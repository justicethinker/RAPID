import { useState } from "react";
import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useSession } from "@/auth/session";
import { useApi, useApiClient } from "@/hooks/useApi";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ApiError } from "@/lib/api";
import type { StaffTeam as StaffTeamData } from "@/lib/dashboard-types";
import {
  EmptyState,
  ErrorPanel,
  Loading,
  PageHeading,
  Panel,
  Pill,
  inputClass,
} from "@/pages/app/Ui";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function StaffTeam() {
  const { me } = useSession();
  const request = useApiClient();
  const { data, loading, error, refresh } = useApi<StaffTeamData>(
    "/api/staff/team",
  );

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  usePageMeta({ title: "Admins | RAPID staff", noindex: true });

  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending("invite");
    setFieldError(null);
    setProblem(null);
    try {
      await request("/api/staff/team/invites", {
        method: "POST",
        body: { email: email.trim() },
      });
      setEmail("");
      await refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields?.email) {
        setFieldError(cause.fields.email);
      } else {
        setProblem("The invitation was not saved. Try again.");
      }
    } finally {
      setPending(null);
    }
  };

  const revokeInvite = async (address: string) => {
    setPending(address);
    setProblem(null);
    try {
      await request(`/api/staff/team/invites/${encodeURIComponent(address)}`, {
        method: "DELETE",
      });
      await refresh();
    } catch {
      setProblem("That invitation could not be revoked. Try again.");
    } finally {
      setPending(null);
    }
  };

  const removeMember = async (personId: string) => {
    setPending(personId);
    setProblem(null);
    try {
      await request(`/api/staff/team/members/${personId}`, {
        method: "DELETE",
      });
      await refresh();
    } catch (cause) {
      setProblem(
        cause instanceof ApiError && cause.fields?.staff
          ? cause.fields.staff
          : "That access could not be removed. Try again.",
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Staff"
        title="Admins"
        description="Staff access is granted by invitation. There is no public admin sign-up."
      />

      <Panel title="How an admin gets in">
        <ol className="space-y-3 text-sm text-light-muted">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-studio-100 text-xs font-bold text-brand-700">
              1
            </span>
            An existing admin invites an email address below.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-studio-100 text-xs font-bold text-brand-700">
              2
            </span>
            That person opens{" "}
            <span className="font-semibold text-ink">/admin</span> and creates an
            account with the invited address.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-studio-100 text-xs font-bold text-brand-700">
              3
            </span>
            The staff role attaches on first sign-in and the dashboard opens.
          </li>
        </ol>
        <p className="mt-4 rounded-xl border border-studio-200 bg-studio-50 px-4 py-3 text-sm text-light-muted">
          The very first admin is set outside the app with{" "}
          <code className="font-semibold text-ink">STAFF_EMAILS</code>, a
          comma-separated list of addresses. Add one there, sign in with it, and
          that account can invite everyone else.
        </p>
      </Panel>

      {loading && !data && <Loading label="Loading staff access…" />}
      {error && <ErrorPanel message={error} onRetry={() => void refresh()} />}
      {problem && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {problem}
        </p>
      )}

      {data && (
        <>
          <Panel
            title="With access"
            description="Everyone here can review applications and run tests."
          >
            <ul className="rows divide-y divide-studio-200">
              {data.members.map((member) => (
                <li
                  key={member.personId}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">
                        {member.name || member.email}
                      </span>
                      {member.personId === me?.person.id && (
                        <Pill tone="positive">You</Pill>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-light-muted">
                      {member.email} · added {formatDate(member.grantedAt)}
                    </span>
                  </span>
                  {member.personId === me?.person.id ? (
                    <span className="flex items-center gap-2 text-sm text-light-muted">
                      <ShieldCheck size={16} aria-hidden="true" />
                      Keep access
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void removeMember(member.personId)}
                      disabled={pending !== null}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-studio-300 bg-studio-25 px-4 text-sm font-semibold text-danger transition-colors hover:border-danger disabled:opacity-60"
                    >
                      {pending === member.personId ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 size={15} aria-hidden="true" />
                      )}
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Invited, not signed in yet"
            description="The invite attaches to the account the first time that address signs in."
          >
            {data.invites.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck size={20} aria-hidden="true" />}
                title="No invitations are waiting."
              >
                <p>
                  Everyone invited has signed in and picked up staff access.
                </p>
              </EmptyState>
            ) : (
              <ul className="rows divide-y divide-studio-200">
                {data.invites.map((inviteRow) => (
                  <li
                    key={inviteRow.email}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">
                        {inviteRow.email}
                      </span>
                      <span className="mt-0.5 block text-sm text-light-muted">
                        Invited {formatDate(inviteRow.invitedAt)}
                        {inviteRow.invitedBy
                          ? ` by ${inviteRow.invitedBy}`
                          : ""}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void revokeInvite(inviteRow.email)}
                      disabled={pending !== null}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-studio-300 bg-studio-25 px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-600 disabled:opacity-60"
                    >
                      {pending === inviteRow.email ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 size={15} aria-hidden="true" />
                      )}
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Invite an admin">
            <form onSubmit={(event) => void invite(event)} noValidate>
              <label
                htmlFor="invite-email"
                className="block text-sm font-semibold text-ink"
              >
                Email address
              </label>
              <p className="mt-1 text-sm text-light-muted">
                Access applies to the account that uses this exact address.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  id="invite-email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? "invite-email-error" : undefined}
                  placeholder="name@example.com"
                  className={`${inputClass} mt-0 min-w-[220px] flex-1`}
                />
                <button
                  type="submit"
                  disabled={pending !== null || !email.trim()}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-ink transition-colors hover:bg-brand-700 hover:text-white disabled:opacity-60"
                >
                  {pending === "invite" ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Plus size={16} aria-hidden="true" />
                  )}
                  Invite admin
                </button>
              </div>
              {fieldError && (
                <p
                  id="invite-email-error"
                  role="alert"
                  className="mt-2 text-sm font-medium text-danger"
                >
                  {fieldError}
                </p>
              )}
            </form>
          </Panel>
        </>
      )}
    </div>
  );
}
