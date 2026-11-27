import type { Role } from "./auth";
import {
  clearedDevSessionCookie,
  devSessionCookie,
  getMe,
  optionalPerson,
  requireFounder,
  requirePerson,
  requireStaff,
  requireTester,
  signInDevAdmin,
  signInDevRole,
  signUpDevAccount,
} from "./auth";
import { one, query } from "./db";
import { clerkSecretKey, devAuthEnabled } from "./env";
import { ApiError, fail, json, methodNotAllowed, readJson } from "./http";
import {
  submitFounderApplication,
  submitTesterApplication,
} from "./applications";
import {
  listTesterInvitations,
  respondToInvitation,
  submitTesterResponse,
  testerHistory,
  testerInvitation,
  testerOverview,
  updateTesterProfile,
} from "./tester";
import {
  createFounderTest,
  founderReport,
  founderTest,
  founderTests,
  recordFounderDecision,
} from "./founder";
import {
  archiveFounderPost,
  createFounderPost,
  createFounderStartup,
  founderAudience,
  founderPosts,
  founderStartup,
  joinWaitlist,
  publicStartup,
  publishFounderPost,
  restoreFounderPost,
  updateFounderPost,
  updateFounderStartup,
} from "./startups";
import {
  deletePostMedia,
  deleteStartupMedia,
  serveMedia,
  uploadPostMedia,
  uploadStartupMedia,
} from "./media";
import {
  decideReport,
  discoveryFeed,
  openLinkedTest,
  reportContent,
  setFeedbackModeration,
  setPostModeration,
  setStartupModeration,
  setStartupFollow,
  staffModeration,
  submitFeedback,
  trackDemoClick,
} from "./discovery";
import {
  anonymisePerson,
  decideApplication,
  exportCsv,
  inviteStaff,
  inviteTesters,
  publishFindings,
  removeStaffMember,
  revokeStaffInvite,
  saveFindings,
  sentReward,
  staffApplication,
  staffApplications,
  staffCandidates,
  staffTeam,
  staffTest,
  staffTests,
  updateStaffTest,
} from "./staff";
import { isSubmissionEnvelope } from "./validate";
import { recordAudienceEvent } from "./analytics";
import {
  aiDraftFindingsRoute,
  aiDraftStudy,
  confirmIntakeBrief,
  copyTemplate,
  createIntakeBrief,
  deleteEligibilityRule,
  deleteScreener,
  deleteStudyStep,
  getFounderIntake,
  getInvitationSteps,
  getStudyDefinition,
  getTaskLink,
  initializePayment,
  listTemplates,
  messageIntake,
  openTaskLink,
  paystackWebhook,
  recordReward,
  reportTaskAction,
  saveEligibilityRule,
  saveScreener,
  saveStudyStep,
  saveScreenerAnswers,
  saveTesterStepAnswer,
  verifyPayment,
  verifyTaskAction,
} from "./mvp";

interface SignInBody {
  role?: string;
  email?: string;
}

const ROLES: Role[] = ["tester", "founder", "staff"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idParam(value: string): string {
  if (!UUID_RE.test(value)) throw new ApiError(404, "not_found");
  return value;
}

function isSecure(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

interface StaffSummaryRow {
  applications_received: number;
  applications_under_review: number;
  applications_approved: number;
  applications_waitlisted: number;
  applications_declined: number;
  tests_requested: number;
  tests_scoping: number;
  tests_recruiting: number;
  tests_fielding: number;
  tests_findings: number;
  tests_published: number;
  tests_closed: number;
  tests_cancelled: number;
  testers: number;
  founders: number;
  invitations: number;
  responses: number;
}

async function staffSummary() {
  const summary = await one<StaffSummaryRow>(
    `select
       (select count(*) from tester_profiles where application_status = 'received')::int as applications_received,
       (select count(*) from tester_profiles where application_status = 'under_review')::int as applications_under_review,
       (select count(*) from tester_profiles where application_status = 'approved')::int as applications_approved,
       (select count(*) from tester_profiles where application_status = 'waitlisted')::int as applications_waitlisted,
       (select count(*) from tester_profiles where application_status = 'declined')::int as applications_declined,
       (select count(*) from tests where status = 'requested')::int as tests_requested,
       (select count(*) from tests where status = 'scoping')::int as tests_scoping,
       (select count(*) from tests where status = 'recruiting')::int as tests_recruiting,
       (select count(*) from tests where status = 'fielding')::int as tests_fielding,
       (select count(*) from tests where status = 'findings')::int as tests_findings,
       (select count(*) from tests where status = 'published')::int as tests_published,
       (select count(*) from tests where status = 'closed')::int as tests_closed,
       (select count(*) from tests where status = 'cancelled')::int as tests_cancelled,
       (select count(*) from tester_profiles)::int as testers,
       (select count(*) from founder_profiles)::int as founders,
       (select count(*) from invitations)::int as invitations,
       (select count(*) from responses)::int as responses`,
  );
  if (!summary) throw new ApiError(500, "server");

  return {
    applications: {
      received: summary.applications_received,
      underReview: summary.applications_under_review,
      approved: summary.applications_approved,
      waitlisted: summary.applications_waitlisted,
      declined: summary.applications_declined,
    },
    tests: {
      requested: summary.tests_requested,
      scoping: summary.tests_scoping,
      recruiting: summary.tests_recruiting,
      fielding: summary.tests_fielding,
      findings: summary.tests_findings,
      published: summary.tests_published,
      closed: summary.tests_closed,
      cancelled: summary.tests_cancelled,
    },
    totals: {
      testers: summary.testers,
      founders: summary.founders,
      invitations: summary.invitations,
      responses: summary.responses,
    },
  };
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();

  try {
    // A mutation must come from the same origin. Bearer tokens mean CSRF is not
    // the main risk, but a cross-site form post is rejected before any work.
    if (!SAFE_METHODS.has(method)) {
      const origin = request.headers.get("origin");
      if (origin && origin !== url.origin) return fail(403, "forbidden");
    }

    if (path === "/api/health") {
      if (method !== "GET") return methodNotAllowed();

      // An uptime monitor must see an unavailable database as unhealthy, not as
      // a healthy API that happens to fail every real request.
      let database = true;
      try {
        await query("select 1");
      } catch (cause) {
        database = false;
        console.error("[health] database probe failed", cause);
      }

      return json(
        {
          ok: database,
          database,
          auth: { dev: devAuthEnabled(), clerk: Boolean(clerkSecretKey()) },
        },
        { status: database ? 200 : 503 },
      );
    }

    /* ---------------------------------------------------------------- */
    /* Public applications                                              */
    /* ---------------------------------------------------------------- */

    const application = path.match(/^\/api\/applications\/(tester|founder)$/);
    if (application) {
      if (method !== "POST") return methodNotAllowed();
      const body = await readJson<unknown>(request);
      if (!isSubmissionEnvelope(body)) throw new ApiError(400, "bad_request");
      if (body.formType !== application[1])
        throw new ApiError(400, "bad_request");

      // A signed-in visitor's answers belong to that account. Anonymous
      // visitors keep the public path, which creates the record by email.
      const account = await optionalPerson(request);
      const result =
        body.formType === "tester"
          ? await submitTesterApplication(
              request,
              body,
              url.origin,
              account?.id,
            )
          : await submitFounderApplication(
              request,
              body,
              url.origin,
              account?.id,
            );

      return json(result);
    }

    /* ---------------------------------------------------------------- */
    /* Session                                                          */
    /* ---------------------------------------------------------------- */

    if (path === "/api/me") {
      if (method === "GET") {
        const person = await requirePerson(request);
        return json(await getMe(person.id));
      }
      if (method === "PATCH") {
        const person = await requirePerson(request);
        const body = await readJson<{
          fullName?: string;
          phone?: string;
          organisation?: string;
        }>(request);
        const fullName = (body.fullName ?? "").trim();
        if (fullName.length < 2 || fullName.length > 100) {
          throw new ApiError(400, "bad_request", {
            fullName: "Enter your full name (2–100 characters).",
          });
        }
        await query(
          "update people set full_name = $2, phone = $3, updated_at = now() where id = $1",
          [person.id, fullName, body.phone?.trim() || null],
        );
        if (typeof body.organisation === "string") {
          await query(
            `update founder_profiles set organisation = $2 where person_id = $1`,
            [person.id, body.organisation.trim().slice(0, 120) || null],
          );
        }
        return json(await getMe(person.id));
      }
      return methodNotAllowed();
    }

    if (path === "/api/notifications") {
      if (method !== "GET") return methodNotAllowed();
      const person = await requirePerson(request);
      const rows = await query(
        `select id, kind, title, body, href, read_at, created_at
           from notifications where person_id = $1
          order by created_at desc limit 50`,
        [person.id],
      );
      return json(rows);
    }

    const notificationRead = path.match(
      /^\/api\/notifications\/([^/]+)\/read$/,
    );
    if (notificationRead) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requirePerson(request);
      await query(
        "update notifications set read_at = now() where id = $1 and person_id = $2",
        [idParam(notificationRead[1]!), person.id],
      );
      return json({ ok: true });
    }

    /* ---------------------------------------------------------------- */
    /* Public discovery and live audience actions                       */
    /* ---------------------------------------------------------------- */

    if (path === "/api/payments/paystack/webhook") {
      if (method !== "POST") return methodNotAllowed();
      return json(await paystackWebhook(request));
    }

    const taskLinkMatch = path.match(/^\/api\/task-links\/([^/]+)$/);
    if (taskLinkMatch && method === "GET") {
      const target = await openTaskLink(taskLinkMatch[1]!);
      return new Response(null, { status: 302, headers: { Location: target } });
    }

    if (path === "/api/analytics/events") {
      if (method !== "POST") return methodNotAllowed();
      return json(await recordAudienceEvent(request), { status: 201 });
    }

    if (path === "/api/discover/feed") {
      if (method !== "GET") return methodNotAllowed();
      const person = await optionalPerson(request);
      return json(await discoveryFeed(url.searchParams, person?.id ?? null));
    }

    const followMatch = path.match(/^\/api\/startups\/([^/]+)\/follow$/);
    if (followMatch) {
      if (method !== "POST" && method !== "DELETE") return methodNotAllowed();
      const person = await requirePerson(request);
      return json(
        await setStartupFollow(
          person.id,
          idParam(followMatch[1]!),
          method === "POST",
        ),
      );
    }

    const demoClickMatch = path.match(
      /^\/api\/startups\/([^/]+)\/demo-click$/,
    );
    if (demoClickMatch) {
      if (method !== "POST") return methodNotAllowed();
      return json(await trackDemoClick(idParam(demoClickMatch[1]!), request));
    }

    const postTestMatch = path.match(/^\/api\/posts\/([^/]+)\/test$/);
    if (postTestMatch) {
      if (method !== "GET") return methodNotAllowed();
      const person = await requirePerson(request);
      return json(
        await openLinkedTest(person.id, idParam(postTestMatch[1]!)),
      );
    }

    const postFeedbackMatch = path.match(/^\/api\/posts\/([^/]+)\/feedback$/);
    if (postFeedbackMatch) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requirePerson(request);
      return json(
        await submitFeedback(
          person.id,
          idParam(postFeedbackMatch[1]!),
          request,
        ),
        { status: 201 },
      );
    }

    if (path === "/api/reports") {
      if (method !== "POST") return methodNotAllowed();
      const person = await requirePerson(request);
      return json(await reportContent(person.id, request), { status: 201 });
    }

    /* ---------------------------------------------------------------- */
    /* Public founder profiles and media                                */
    /* ---------------------------------------------------------------- */

    const publicMediaMatch = path.match(/^\/api\/media\/([^/]+)$/);
    if (publicMediaMatch) {
      if (method !== "GET") return methodNotAllowed();
      return await serveMedia(idParam(publicMediaMatch[1]!), request);
    }

    const publicStartupMatch = path.match(/^\/api\/startups\/([^/]+)$/);
    if (publicStartupMatch) {
      if (method !== "GET") return methodNotAllowed();
      // Public browsing stays open; a signed-in viewer also learns whether
      // they follow this startup so the page can render the right action.
      const person = await optionalPerson(request);
      return json(
        await publicStartup(publicStartupMatch[1]!, person?.id ?? null),
      );
    }

    const publicWaitlistMatch = path.match(
      /^\/api\/startups\/([^/]+)\/waitlist$/,
    );
    if (publicWaitlistMatch) {
      if (method !== "POST") return methodNotAllowed();
      return json(await joinWaitlist(publicWaitlistMatch[1]!, request), {
        status: 201,
      });
    }

    /* ---------------------------------------------------------------- */
    /* Tester                                                           */
    /* ---------------------------------------------------------------- */

    if (path === "/api/tester/overview") {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await testerOverview(person.id));
    }

    if (path === "/api/tester/invitations") {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await listTesterInvitations(person.id));
    }

    const testerInvitationMatch = path.match(
      /^\/api\/tester\/invitations\/([^/]+)$/,
    );
    if (testerInvitationMatch) {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireTester(request);
      return json(
        await testerInvitation(person.id, idParam(testerInvitationMatch[1]!)),
      );
    }

    const testerRespond = path.match(
      /^\/api\/tester\/invitations\/([^/]+)\/respond$/,
    );
    if (testerRespond) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireTester(request);
      return json(
        await respondToInvitation(
          person.id,
          idParam(testerRespond[1]!),
          request,
        ),
      );
    }

    const testerResponse = path.match(
      /^\/api\/tester\/invitations\/([^/]+)\/response$/,
    );
    if (testerResponse) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireTester(request);
      return json(
        await submitTesterResponse(
          person.id,
          idParam(testerResponse[1]!),
          request,
        ),
      );
    }

    const testerSteps = path.match(/^\/api\/tester\/invitations\/([^/]+)\/steps$/);
    if (testerSteps) {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await getInvitationSteps(person.id, idParam(testerSteps[1]!)));
    }

    const testerAnswer = path.match(/^\/api\/tester\/invitations\/([^/]+)\/answers$/);
    if (testerAnswer) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await saveTesterStepAnswer(person.id, idParam(testerAnswer[1]!), request));
    }

    const testerScreen = path.match(/^\/api\/tester\/invitations\/([^/]+)\/screeners$/);
    if (testerScreen) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await saveScreenerAnswers(person.id, idParam(testerScreen[1]!), request));
    }

    const testerTaskLink = path.match(/^\/api\/tester\/invitations\/([^/]+)\/task-link$/);
    if (testerTaskLink) {
      if (method === "GET") {
        const person = await requireTester(request);
        const link = await getTaskLink(person.id, idParam(testerTaskLink[1]!));
        return new Response(JSON.stringify(link), { status: 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
      }
      if (method === "POST") {
        const person = await requireTester(request);
        return json(await reportTaskAction(person.id, idParam(testerTaskLink[1]!), request));
      }
      return methodNotAllowed();
    }

    if (path === "/api/tester/history") {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await testerHistory(person.id));
    }

    if (path === "/api/tester/profile") {
      if (method !== "PATCH") return methodNotAllowed();
      const person = await requireTester(request);
      return json(await updateTesterProfile(person.id, request));
    }

    /* ---------------------------------------------------------------- */
    /* Founder                                                          */
    /* ---------------------------------------------------------------- */

    if (path === "/api/founder/startup/media") {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(await uploadStartupMedia(person, request), { status: 201 });
    }

    const founderStartupMedia = path.match(
      /^\/api\/founder\/startup\/media\/(logo|cover)$/,
    );
    if (founderStartupMedia) {
      if (method !== "DELETE") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(await deleteStartupMedia(person, founderStartupMedia[1]!));
    }

    if (path === "/api/founder/startup") {
      if (method === "GET") {
        const person = await requireFounder(request);
        return json(await founderStartup(person.id));
      }
      if (method === "POST") {
        // Onboarding is the transition from an account to a founder profile,
        // so it accepts any signed-in person and creates the profile with the
        // startup. Every later founder route still requires that role.
        const person = await requirePerson(request);
        return json(await createFounderStartup(person.id, request), {
          status: 201,
        });
      }
      if (method === "PATCH") {
        const person = await requireFounder(request);
        return json(await updateFounderStartup(person.id, request));
      }
      return methodNotAllowed();
    }

    if (path === "/api/founder/posts") {
      const person = await requireFounder(request);
      if (method === "GET") return json(await founderPosts(person.id));
      if (method === "POST") {
        return json(await createFounderPost(person.id, request), {
          status: 201,
        });
      }
      return methodNotAllowed();
    }

    const founderPostMatch = path.match(/^\/api\/founder\/posts\/([^/]+)$/);
    if (founderPostMatch) {
      if (method !== "PATCH") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await updateFounderPost(
          person.id,
          idParam(founderPostMatch[1]!),
          request,
        ),
      );
    }

    const founderPostPublish = path.match(
      /^\/api\/founder\/posts\/([^/]+)\/publish$/,
    );
    if (founderPostPublish) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await publishFounderPost(person.id, idParam(founderPostPublish[1]!)),
      );
    }

    const founderPostArchive = path.match(
      /^\/api\/founder\/posts\/([^/]+)\/archive$/,
    );
    if (founderPostArchive) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await archiveFounderPost(person.id, idParam(founderPostArchive[1]!)),
      );
    }

    const founderPostRestore = path.match(
      /^\/api\/founder\/posts\/([^/]+)\/restore$/,
    );
    if (founderPostRestore) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await restoreFounderPost(person.id, idParam(founderPostRestore[1]!)),
      );
    }

    const founderPostMedia = path.match(
      /^\/api\/founder\/posts\/([^/]+)\/media$/,
    );
    if (founderPostMedia) {
      const person = await requireFounder(request);
      const postId = idParam(founderPostMedia[1]!);
      if (method === "POST") {
        return json(await uploadPostMedia(person, postId, request), {
          status: 201,
        });
      }
      if (method === "DELETE") {
        return json(await deletePostMedia(person, postId));
      }
      return methodNotAllowed();
    }

    const founderPostMediaItem = path.match(
      /^\/api\/founder\/posts\/([^/]+)\/media\/([^/]+)$/,
    );
    if (founderPostMediaItem) {
      if (method !== "DELETE") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await deletePostMedia(
          person,
          idParam(founderPostMediaItem[1]!),
          idParam(founderPostMediaItem[2]!),
        ),
      );
    }

    if (path === "/api/founder/audience") {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireFounder(request);
      const requested = Number(url.searchParams.get("range") ?? 30);
      return json(await founderAudience(person.id, requested));
    }

    if (path === "/api/founder/tests") {
      const person = await requireFounder(request);
      if (method === "GET") return json(await founderTests(person.id));
      if (method === "POST") {
        return json(await createFounderTest(person.id, request), {
          status: 201,
        });
      }
      return methodNotAllowed();
    }

    if (path === "/api/founder/intake" && method === "POST") {
      const person = await requireFounder(request);
      return json(await createIntakeBrief(person.id, request), { status: 201 });
    }

    const founderIntake = path.match(/^\/api\/founder\/intake\/([^/]+)$/);
    if (founderIntake && method === "GET") {
      const person = await requireFounder(request);
      return json(await getFounderIntake(person.id, idParam(founderIntake[1]!)));
    }

    const founderIntakeMessage = path.match(/^\/api\/founder\/intake\/([^/]+)\/message$/);
    if (founderIntakeMessage && method === "POST") {
      const person = await requireFounder(request);
      return json(await messageIntake(person.id, idParam(founderIntakeMessage[1]!), request));
    }

    const founderIntakeConfirm = path.match(/^\/api\/founder\/intake\/([^/]+)\/confirm$/);
    if (founderIntakeConfirm && method === "POST") {
      const person = await requireFounder(request);
      return json(await confirmIntakeBrief(person.id, idParam(founderIntakeConfirm[1]!), request));
    }

    const founderPaymentInitialize = path.match(/^\/api\/founder\/tests\/([^/]+)\/payment\/initialize$/);
    if (founderPaymentInitialize && method === "POST") {
      const person = await requireFounder(request);
      return json(await initializePayment(person.id, idParam(founderPaymentInitialize[1]!), request));
    }

    const founderPaymentVerify = path.match(/^\/api\/founder\/tests\/([^/]+)\/payment\/verify$/);
    if (founderPaymentVerify && method === "POST") {
      const person = await requireFounder(request);
      return json(await verifyPayment(person.id, idParam(founderPaymentVerify[1]!), request));
    }

    const founderTestMatch = path.match(/^\/api\/founder\/tests\/([^/]+)$/);
    if (founderTestMatch) {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(await founderTest(person.id, idParam(founderTestMatch[1]!)));
    }

    const founderReportMatch = path.match(
      /^\/api\/founder\/tests\/([^/]+)\/report$/,
    );
    if (founderReportMatch) {
      if (method !== "GET") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await founderReport(
          person.id,
          idParam(founderReportMatch[1]!),
        ),
      );
    }

    const founderDecision = path.match(
      /^\/api\/founder\/tests\/([^/]+)\/decision$/,
    );
    if (founderDecision) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireFounder(request);
      return json(
        await recordFounderDecision(
          person.id,
          idParam(founderDecision[1]!),
          request,
        ),
      );
    }

    /* ---------------------------------------------------------------- */
    /* Staff                                                            */
    /* ---------------------------------------------------------------- */

    if (path === "/api/staff/summary") {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(await staffSummary());
    }

    if (path === "/api/staff/applications") {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(await staffApplications(request));
    }

    const staffApplicationMatch = path.match(
      /^\/api\/staff\/applications\/([^/]+)$/,
    );
    if (staffApplicationMatch) {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(await staffApplication(idParam(staffApplicationMatch[1]!)));
    }

    const staffDecision = path.match(
      /^\/api\/staff\/applications\/([^/]+)\/decision$/,
    );
    if (staffDecision) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await decideApplication(
          person.id,
          idParam(staffDecision[1]!),
          request,
          url.origin,
        ),
      );
    }

    if (path === "/api/staff/tests") {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(await staffTests(request));
    }

    const staffTestMatch = path.match(/^\/api\/staff\/tests\/([^/]+)$/);
    if (staffTestMatch) {
      if (method === "GET") {
        await requireStaff(request);
        return json(await staffTest(idParam(staffTestMatch[1]!)));
      }
      if (method === "PATCH") {
        const person = await requireStaff(request);
        return json(
          await updateStaffTest(
            person.id,
            idParam(staffTestMatch[1]!),
            request,
          ),
        );
      }
      return methodNotAllowed();
    }

    const staffCandidatesMatch = path.match(
      /^\/api\/staff\/tests\/([^/]+)\/candidates$/,
    );
    if (staffCandidatesMatch) {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(
        await staffCandidates(idParam(staffCandidatesMatch[1]!), request),
      );
    }

    const staffInvite = path.match(
      /^\/api\/staff\/tests\/([^/]+)\/invitations$/,
    );
    if (staffInvite) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await inviteTesters(
          person.id,
          idParam(staffInvite[1]!),
          request,
          url.origin,
        ),
      );
    }

    const staffFindings = path.match(
      /^\/api\/staff\/tests\/([^/]+)\/findings$/,
    );
    if (staffFindings) {
      if (method !== "PUT") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await saveFindings(person.id, idParam(staffFindings[1]!), request),
      );
    }

    const staffPublish = path.match(
      /^\/api\/staff\/tests\/([^/]+)\/findings\/publish$/,
    );
    if (staffPublish) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await publishFindings(person.id, idParam(staffPublish[1]!), url.origin),
      );
    }

    if (path === "/api/staff/templates" && method === "GET") {
      await requireStaff(request);
      return json(await listTemplates());
    }

    const staffStudy = path.match(/^\/api\/staff\/tests\/([^/]+)\/study$/);
    if (staffStudy && method === "GET") {
      const person = await requireStaff(request);
      return json(await getStudyDefinition(person.id, idParam(staffStudy[1]!)));
    }

    const staffCopyTemplate = path.match(/^\/api\/staff\/tests\/([^/]+)\/copy-template$/);
    if (staffCopyTemplate && method === "POST") {
      const person = await requireStaff(request);
      return json(await copyTemplate(person.id, idParam(staffCopyTemplate[1]!), request));
    }

    const staffStep = path.match(/^\/api\/staff\/tests\/([^/]+)\/steps(?:\/([^/]+))?$/);
    if (staffStep) {
      const person = await requireStaff(request);
      if (method === "POST" && !staffStep[2]) return json(await saveStudyStep(person.id, idParam(staffStep[1]!), request));
      if (method === "DELETE" && staffStep[2]) return json(await deleteStudyStep(person.id, idParam(staffStep[1]!), idParam(staffStep[2]!)));
      return methodNotAllowed();
    }

    const staffRule = path.match(/^\/api\/staff\/tests\/([^/]+)\/rules(?:\/([^/]+))?$/);
    if (staffRule) {
      const person = await requireStaff(request);
      if (method === "POST" && !staffRule[2]) return json(await saveEligibilityRule(person.id, idParam(staffRule[1]!), request));
      if (method === "DELETE" && staffRule[2]) return json(await deleteEligibilityRule(person.id, idParam(staffRule[1]!), idParam(staffRule[2]!)));
      return methodNotAllowed();
    }

    const staffScreener = path.match(/^\/api\/staff\/tests\/([^/]+)\/screeners(?:\/([^/]+))?$/);
    if (staffScreener) {
      const person = await requireStaff(request);
      if (method === "POST" && !staffScreener[2]) return json(await saveScreener(person.id, idParam(staffScreener[1]!), request));
      if (method === "DELETE" && staffScreener[2]) return json(await deleteScreener(person.id, idParam(staffScreener[1]!), idParam(staffScreener[2]!)));
      return methodNotAllowed();
    }

    const staffAiDraft = path.match(/^\/api\/staff\/tests\/([^/]+)\/ai-draft$/);
    if (staffAiDraft && method === "POST") {
      const person = await requireStaff(request);
      return json(await aiDraftStudy(person.id, idParam(staffAiDraft[1]!), request));
    }

    const staffFindingsDraft = path.match(/^\/api\/staff\/tests\/([^/]+)\/findings\/ai-draft$/);
    if (staffFindingsDraft && method === "GET") {
      const person = await requireStaff(request);
      return json(await aiDraftFindingsRoute(person.id, idParam(staffFindingsDraft[1]!)));
    }

    const staffTaskVerify = path.match(/^\/api\/staff\/invitations\/([^/]+)\/task-action\/verify$/);
    if (staffTaskVerify && method === "POST") {
      const person = await requireStaff(request);
      return json(await verifyTaskAction(person.id, idParam(staffTaskVerify[1]!), request));
    }

    const staffRewardLedger = path.match(/^\/api\/staff\/invitations\/([^/]+)\/reward-ledger$/);
    if (staffRewardLedger && method === "POST") {
      const person = await requireStaff(request);
      return json(await recordReward(person.id, idParam(staffRewardLedger[1]!), request));
    }

    const staffReward = path.match(
      /^\/api\/staff\/invitations\/([^/]+)\/reward$/,
    );
    if (staffReward) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(await sentReward(person.id, idParam(staffReward[1]!), request));
    }

    if (path === "/api/staff/export") {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      const { filename, csv } = await exportCsv(
        new URL(request.url).searchParams.get("type") ?? "",
      );
      return new Response(csv, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${filename}"`,
          "cache-control": "no-store",
        },
      });
    }

    if (path === "/api/staff/moderation") {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(await staffModeration());
    }

    const staffReportMatch = path.match(
      /^\/api\/staff\/moderation\/reports\/([^/]+)$/,
    );
    if (staffReportMatch) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await decideReport(
          person.id,
          idParam(staffReportMatch[1]!),
          request,
        ),
      );
    }

    const staffFeedbackMatch = path.match(
      /^\/api\/staff\/moderation\/feedback\/([^/]+)$/,
    );
    if (staffFeedbackMatch) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await setFeedbackModeration(
          person.id,
          idParam(staffFeedbackMatch[1]!),
          request,
        ),
      );
    }

    const staffPostMatch = path.match(
      /^\/api\/staff\/moderation\/posts\/([^/]+)$/,
    );
    if (staffPostMatch) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await setPostModeration(
          person.id,
          idParam(staffPostMatch[1]!),
          request,
        ),
      );
    }

    const staffStartupMatch = path.match(
      /^\/api\/staff\/moderation\/startups\/([^/]+)$/,
    );
    if (staffStartupMatch) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await setStartupModeration(
          person.id,
          idParam(staffStartupMatch[1]!),
          request,
        ),
      );
    }

    if (path === "/api/staff/team") {
      if (method !== "GET") return methodNotAllowed();
      await requireStaff(request);
      return json(await staffTeam());
    }

    if (path === "/api/staff/team/invites") {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(await inviteStaff(person.id, request, url.origin));
    }

    const staffInviteMatch = path.match(
      /^\/api\/staff\/team\/invites\/([^/]+)$/,
    );
    if (staffInviteMatch) {
      if (method !== "DELETE") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await revokeStaffInvite(
          person.id,
          decodeURIComponent(staffInviteMatch[1]!),
        ),
      );
    }

    const staffMemberMatch = path.match(
      /^\/api\/staff\/team\/members\/([^/]+)$/,
    );
    if (staffMemberMatch) {
      if (method !== "DELETE") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await removeStaffMember(person.id, idParam(staffMemberMatch[1]!)),
      );
    }

    const staffAnonymise = path.match(
      /^\/api\/staff\/people\/([^/]+)\/anonymise$/,
    );
    if (staffAnonymise) {
      if (method !== "POST") return methodNotAllowed();
      const person = await requireStaff(request);
      return json(
        await anonymisePerson(person.id, idParam(staffAnonymise[1]!)),
      );
    }

    /* ---------------------------------------------------------------- */
    /* Development sign-in                                              */
    /* ---------------------------------------------------------------- */

    if (path === "/api/dev/admin-sign-in") {
      if (method !== "POST") return methodNotAllowed();
      if (!devAuthEnabled()) throw new ApiError(404, "not_found");

      const body = await readJson<{ username?: string; password?: string }>(
        request,
      );
      const personId = await signInDevAdmin(
        body.username ?? "",
        body.password ?? "",
      );
      const response = json(await getMe(personId));
      response.headers.append(
        "set-cookie",
        devSessionCookie(personId, isSecure(request)),
      );
      return response;
    }

    if (path === "/api/dev/sign-in") {
      if (method !== "POST") return methodNotAllowed();
      if (!devAuthEnabled()) throw new ApiError(404, "not_found");

      const body = await readJson<SignInBody>(request);
      const role = body.role as Role | undefined;
      if (!role || !ROLES.includes(role)) {
        throw new ApiError(400, "bad_request", {
          role: "Choose tester, founder or staff.",
        });
      }

      const personId = await signInDevRole(role, body.email);
      const response = json(await getMe(personId));
      response.headers.append(
        "set-cookie",
        devSessionCookie(personId, isSecure(request)),
      );
      return response;
    }

    if (path === "/api/dev/sign-up") {
      if (method !== "POST") return methodNotAllowed();
      if (!devAuthEnabled()) throw new ApiError(404, "not_found");

      const body = await readJson<{ email?: string; fullName?: string }>(request);
      const email = (body.email ?? "").trim();
      const fullName = (body.fullName ?? "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        throw new ApiError(400, "validation", {
          email: "Enter a valid email address, like name@example.com.",
        });
      }
      if (fullName.length < 2 || fullName.length > 100) {
        throw new ApiError(400, "validation", {
          fullName: "Enter your full name (2–100 characters).",
        });
      }

      const personId = await signUpDevAccount(email, fullName);
      const response = json(await getMe(personId));
      response.headers.append(
        "set-cookie",
        devSessionCookie(personId, isSecure(request)),
      );
      return response;
    }

    if (path === "/api/dev/sign-out") {
      if (method !== "POST") return methodNotAllowed();
      const response = json({ ok: true });
      response.headers.append(
        "set-cookie",
        clearedDevSessionCookie(isSecure(request)),
      );
      return response;
    }

    return fail(404, "not_found");
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.status, error.code, error.fields);
    }
    console.error("[api] unhandled error", error);
    return fail(500, "server");
  }
}
