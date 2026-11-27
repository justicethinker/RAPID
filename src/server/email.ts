import { query } from './db';

interface EmailInput {
  personId?: string | null;
  to: string;
  kind: string;
  subject: string;
  text: string;
}

const FROM = process.env.EMAIL_FROM?.trim() || 'RAPID <hello@rapid.africa>';

const ATTEMPTS = 2;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends through Resend when RESEND_API_KEY is set. Without a key the message is
 * captured in the server log and marked sent in email_log, which is what local
 * development and tests use. Delivery failures never fail the user's action.
 */
export async function sendEmail(input: EmailInput): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  let status: 'sent' | 'failed' = 'sent';
  let providerId: string | null = null;
  let error: string | null = null;

  if (key) {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${key}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM,
            to: [input.to],
            subject: input.subject,
            text: input.text,
          }),
          signal: AbortSignal.timeout(8_000),
        });

        if (!response.ok) throw new Error(`provider responded ${response.status}`);
        const data = (await response.json()) as { id?: string };
        providerId = data.id ?? null;
        lastError = null;
        break;
      } catch (cause) {
        lastError = cause;
        // One short retry covers a provider blip without holding the user's
        // request open; the action that produced the email has already committed.
        if (attempt < ATTEMPTS) await wait(400);
      }
    }

    if (lastError) {
      status = 'failed';
      error = lastError instanceof Error ? lastError.message.slice(0, 400) : 'send failed';
      // The address itself is deliberately absent from logs.
      console.error(`[email] ${input.kind} delivery failed after ${ATTEMPTS} attempts: ${error}`);
    }
  } else {
    console.info(`[email:capture] ${input.kind}`);
  }

  try {
    await query(
      `insert into email_log (person_id, kind, provider_id, status, error)
       values ($1, $2, $3, $4, $5)`,
      [input.personId ?? null, input.kind, providerId, status, error],
    );
  } catch (cause) {
    console.error('[email] could not write email_log', cause);
  }
}
