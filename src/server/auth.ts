import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { one, query } from './db';
import { ApiError } from './http';
import {
  adminSignInCredentials,
  clerkSecretKey,
  devAuthEnabled,
  devAuthSecret,
  staffEmails,
} from './env';

export type Role = 'tester' | 'founder' | 'staff';

export interface Person {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  state: 'active' | 'suppressed' | 'deleted';
}

export const DEV_COOKIE = 'rapid_dev_session';

function sign(value: string): string {
  return createHmac('sha256', devAuthSecret()).update(value).digest('base64url');
}

export function signDevSession(personId: string): string {
  return `${personId}.${sign(personId)}`;
}

export function readDevSession(value: string | undefined): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf('.');
  if (separator === -1) return null;

  const personId = value.slice(0, separator);
  const provided = value.slice(separator + 1);
  const expected = sign(personId);
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(providedBuffer, expectedBuffer) ? personId : null;
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function devSessionCookie(personId: string, secure: boolean): string {
  const value = encodeURIComponent(signDevSession(personId));
  const attributes = [
    `${DEV_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
  ];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

export function clearedDevSessionCookie(secure: boolean): string {
  const attributes = [`${DEV_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

async function personById(id: string): Promise<Person | null> {
  return one<Person>(
    `select id, email, full_name, phone, state
       from people
      where id = $1 and state = 'active'`,
    [id],
  );
}

async function ensureClerkPerson(clerkUserId: string): Promise<string> {
  const existing = await one<{ id: string }>(
    'select id from people where clerk_user_id = $1',
    [clerkUserId],
  );
  if (existing) return existing.id;

  const secretKey = clerkSecretKey();
  if (!secretKey) throw new ApiError(401, 'unauthorized');

  const clerk = createClerkClient({ secretKey });
  let user;
  try {
    user = await clerk.users.getUser(clerkUserId);
  } catch {
    throw new ApiError(401, 'unauthorized');
  }

  // Linking is by email, so only a verified primary address may claim an
  // existing record. Trusting an unverified address would let anyone who can
  // register it take over another applicant's profile.
  const primary = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  );
  const email = primary?.emailAddress?.trim() || null;
  if (!primary || !email) throw new ApiError(401, 'unauthorized');
  if (primary.verification?.status !== 'verified') {
    throw new ApiError(403, 'email_unverified');
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  const rows = await query<{ id: string }>(
    `insert into people (clerk_user_id, email, email_verified, full_name)
     values ($1, $2, true, $3)
     on conflict (lower(email)) do update
       set clerk_user_id = excluded.clerk_user_id,
           email_verified = true,
           full_name = case when people.full_name = '' then excluded.full_name else people.full_name end,
           updated_at = now()
     returning id`,
    [clerkUserId, email, fullName],
  );
  const id = rows[0]?.id;
  if (!id) throw new ApiError(500, 'server');
  return id;
}

async function sessionPersonId(request: Request): Promise<string | null> {
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    const secretKey = clerkSecretKey();
    if (!secretKey) throw new ApiError(401, 'unauthorized');

    let payload;
    try {
      payload = await verifyToken(token, { secretKey });
    } catch {
      throw new ApiError(401, 'unauthorized');
    }

    const subject = typeof payload.sub === 'string' ? payload.sub : null;
    if (!subject) throw new ApiError(401, 'unauthorized');
    return ensureClerkPerson(subject);
  }

  if (devAuthEnabled()) {
    return readDevSession(readCookie(request, DEV_COOKIE));
  }

  return null;
}

export async function requirePerson(request: Request): Promise<Person> {
  const id = await sessionPersonId(request);
  if (!id) throw new ApiError(401, 'unauthorized');

  const person = await personById(id);
  if (!person) throw new ApiError(401, 'unauthorized');
  await grantAllowlistedStaff(person);
  return person;
}

/**
 * The allowlist is the bootstrap path for the first admin. It is checked here
 * rather than at sign-up so an address added to STAFF_EMAILS later takes effect
 * on the next request, without asking the person to sign up again.
 */
async function grantAllowlistedStaff(person: Person): Promise<void> {
  const allowlist = staffEmails();
  if (!allowlist.length) return;
  if (!allowlist.includes(person.email.toLowerCase())) return;

  await query(
    `insert into staff_members (person_id) values ($1)
     on conflict (person_id) do nothing`,
    [person.id],
  );
}

/**
 * An invited address becomes staff the first time it loads its own account.
 * Called from getMe, which every signed-in session hits before a dashboard.
 */
async function claimStaffInvite(person: Person): Promise<void> {
  const invite = await one<{ email: string }>(
    `update staff_invites
        set accepted_at = now()
      where lower(email) = lower($1) and accepted_at is null
      returning email`,
    [person.email],
  );
  if (!invite) return;

  await query(
    `insert into staff_members (person_id) values ($1)
     on conflict (person_id) do nothing`,
    [person.id],
  );
  await query(
    `insert into audit_events (action, entity, entity_id, meta)
     values ('staff.invite.claimed', 'person', $1, $2)`,
    [person.id, JSON.stringify({ email: invite.email })],
  );
}

/**
 * The person behind a request when there is one. Public endpoints use this to
 * attach a submission to an account without turning anonymous visitors away,
 * and a failed sign-in is never treated as a fresh anonymous visitor.
 */
export async function optionalPerson(request: Request): Promise<Person | null> {
  try {
    return await requirePerson(request);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/**
 * Local-only account creation for the sign-up flow. Production never reaches
 * this: devAuthEnabled is false on any deployment and in production builds.
 */
export async function signUpDevAccount(
  email: string,
  fullName: string,
): Promise<string> {
  if (!devAuthEnabled()) throw new ApiError(404, 'not_found');

  const rows = await query<{ id: string }>(
    `insert into people (email, email_verified, full_name)
     values ($1, true, $2)
     on conflict (lower(email)) do update
       set email_verified = true,
           full_name = case when people.full_name = '' then excluded.full_name else people.full_name end,
           updated_at = now()
     returning id`,
    [email.trim().toLowerCase(), fullName.trim()],
  );
  const id = rows[0]?.id;
  if (!id) throw new ApiError(500, 'server');
  return id;
}

export async function getMe(personId: string) {
  const person = await personById(personId);
  if (!person) throw new ApiError(401, 'unauthorized');

  await claimStaffInvite(person);

  const [tester, founder, staff, unread] = await Promise.all([
    one<{ application_status: string; submission_id: string }>(
      'select application_status, submission_id from tester_profiles where person_id = $1',
      [personId],
    ),
    one<{ organisation: string | null }>(
      'select organisation from founder_profiles where person_id = $1',
      [personId],
    ),
    one<{ person_id: string }>('select person_id from staff_members where person_id = $1', [
      personId,
    ]),
    one<{ count: string }>(
      'select count(*)::text as count from notifications where person_id = $1 and read_at is null',
      [personId],
    ),
  ]);

  const [invitations, tests] = await Promise.all([
    tester
      ? one<{ count: string }>(
          'select count(*)::text as count from invitations where tester_id = $1',
          [personId],
        )
      : Promise.resolve(null),
    founder
      ? one<{ count: string }>(
          'select count(*)::text as count from tests where founder_id = $1',
          [personId],
        )
      : Promise.resolve(null),
  ]);

  return {
    person: {
      id: person.id,
      email: person.email,
      fullName: person.full_name,
      phone: person.phone,
    },
    roles: {
      tester: Boolean(tester),
      founder: Boolean(founder),
      staff: Boolean(staff),
    },
    tester: tester
      ? {
          applicationStatus: tester.application_status,
          reference: tester.submission_id,
          invitations: Number(invitations?.count ?? 0),
        }
      : null,
    founder: founder
      ? {
          organisation: founder.organisation,
          tests: Number(tests?.count ?? 0),
        }
      : null,
    unreadNotifications: Number(unread?.count ?? 0),
  };
}

export async function requireStaff(request: Request): Promise<Person> {
  const person = await requirePerson(request);
  const staff = await one('select person_id from staff_members where person_id = $1', [person.id]);
  if (!staff) throw new ApiError(404, 'not_found');
  return person;
}

/**
 * Role isolation is enforced here, not only in the router guard. A signed-in
 * person can hold several roles, but each surface only answers people who have
 * the profile that surface belongs to.
 */
export async function requireTester(request: Request): Promise<Person> {
  const person = await requirePerson(request);
  const tester = await one('select person_id from tester_profiles where person_id = $1', [
    person.id,
  ]);
  if (!tester) throw new ApiError(404, 'not_found');
  return person;
}

export async function requireFounder(request: Request): Promise<Person> {
  const person = await requirePerson(request);
  const founder = await one('select person_id from founder_profiles where person_id = $1', [
    person.id,
  ]);
  if (!founder) throw new ApiError(404, 'not_found');
  return person;
}

const DEV_PEOPLE: Record<Role, { email: string; name: string }> = {
  tester: { email: 'dev.tester@rapid.local', name: 'Dev Tester' },
  founder: { email: 'dev.founder@rapid.local', name: 'Dev Founder' },
  staff: { email: 'dev.staff@rapid.local', name: 'Dev Staff' },
};

function constantTimeEqual(left: string, right: string): boolean {
  // Hash first so different lengths still compare in constant time.
  return timingSafeEqual(
    createHash('sha256').update(left).digest(),
    createHash('sha256').update(right).digest(),
  );
}

/**
 * The local admin door. The username and password are compared in constant
 * time and only accepted while local role sign-in is enabled, so this page
 * cannot open a deployed pilot. It signs into the fixed staff account instead
 * of creating a staff row, so knowing the password grants no extra role.
 */
export async function signInDevAdmin(
  username: string,
  password: string,
): Promise<string> {
  if (!devAuthEnabled()) throw new ApiError(404, 'not_found');

  const expected = adminSignInCredentials();
  const usernameOk = constantTimeEqual(username.trim(), expected.username);
  const passwordOk = constantTimeEqual(password, expected.password);
  if (!usernameOk || !passwordOk) {
    throw new ApiError(401, 'unauthorized');
  }

  return signInDevRole('staff');
}

/**
 * Local-only role sign-in. Creates nothing but the fixed development accounts,
 * and only when ALLOW_DEV_AUTH=1 outside production.
 */
export async function signInDevRole(role: Role, email?: string): Promise<string> {
  if (!devAuthEnabled()) throw new ApiError(404, 'not_found');
  if (!(role in DEV_PEOPLE)) throw new ApiError(400, 'bad_request');

  // Local testing can open any existing active record by email, so an
  // application can be followed through every role without Clerk.
  if (email) {
    const existing = await one<{ id: string }>(
      `select id from people where lower(email) = lower($1) and state = 'active'`,
      [email.trim()],
    );
    if (!existing) throw new ApiError(404, 'not_found');
    return existing.id;
  }

  const person = DEV_PEOPLE[role];
  const rows = await query<{ id: string }>(
    `insert into people (email, email_verified, full_name)
     values ($1, true, $2)
     on conflict (lower(email)) do update
       set email_verified = true,
           updated_at = now()
     returning id`,
    [person.email, person.name],
  );

  const id = rows[0]?.id;
  if (!id) throw new ApiError(500, 'server');

  if (role === 'tester') {
    await query(
      `insert into tester_profiles
         (person_id, submission_id, country_code, city, age_band, situation, interests,
          application_status, privacy_version, schema_version, source)
       values ($1, $2, 'NG', 'Lagos', '25_29', 'employed', '{education,technology}',
               'approved', '2026-10-20', '2026-10-20', '{"seed":"dev"}'::jsonb)
       on conflict (person_id) do nothing`,
      [id, `dev-tester-${id.slice(0, 8)}`],
    );
  }

  if (role === 'founder') {
    await query(
      `insert into founder_profiles (person_id) values ($1)
       on conflict (person_id) do nothing`,
      [id],
    );
  }

  if (role === 'staff') {
    await query(
      `insert into staff_members (person_id) values ($1)
       on conflict (person_id) do nothing`,
      [id],
    );
  }

  return id;
}
