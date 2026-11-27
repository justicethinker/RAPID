/**
 * The signed-in onboarding variant of the application forms. When this is
 * present the email is fixed to the account, the submission travels with a
 * session token, and success belongs to the dashboard rather than the public
 * thank-you page.
 */
export interface AccountFormContext {
  email: string;
  name: string;
  getToken: () => Promise<string | null>;
  onSubmitted: () => void | Promise<void>;
}
