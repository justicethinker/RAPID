import { query } from './db';

type NotificationKind =
  | 'application_received'
  | 'application_decision'
  | 'invitation'
  | 'findings_published'
  | 'reward_sent'
  | 'new_follower'
  | 'new_feedback'
  | 'waitlist_join'
  | 'moderation'
  | 'research_status'
  | 'request_received';

export async function notify(
  personId: string,
  kind: NotificationKind,
  title: string,
  body: string,
  href: string | null,
): Promise<void> {
  try {
    await query(
      `insert into notifications (person_id, kind, title, body, href)
       values ($1, $2, $3, $4, $5)`,
      [personId, kind, title, body, href],
    );
  } catch (cause) {
    // A notification must never roll back the action that produced it.
    console.error('[notify] insert failed', kind, cause);
  }
}

export async function notifyStaff(
  kind: NotificationKind,
  title: string,
  body: string,
  href: string | null,
): Promise<void> {
  try {
    const staff = await query<{ person_id: string }>('select person_id from staff_members');
    await Promise.all(staff.map((row) => notify(row.person_id, kind, title, body, href)));
  } catch (cause) {
    console.error('[notify] staff fan-out failed', kind, cause);
  }
}
