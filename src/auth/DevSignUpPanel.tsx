import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { useSession } from '@/auth/session';
import { inputBase, inputBorder } from '@/components/forms/fieldStyles';

/**
 * Local-only stand-in for the Clerk sign-up form. It creates a real person row
 * on this machine so the full flow — account, application, dashboard — can be
 * exercised without Clerk credentials.
 */
export default function DevSignUpPanel() {
  const { signUpDev } = useSession();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setProblem(null);
    setErrors({});

    try {
      await signUpDev(email.trim(), fullName.trim());
    } catch (cause) {
      if (cause instanceof ApiError && cause.fields) {
        setErrors(cause.fields);
      } else if (cause instanceof ApiError && cause.code === 'not_found') {
        setProblem(
          "Account creation isn’t available right now. Try again shortly or contact the team.",
        );
      } else {
        setProblem(
          'We couldn’t create your account. Check your connection and try again.',
        );
      }
      setPending(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <div className="rows space-y-4">
        <div>
          <label htmlFor="dev-signup-name" className="block text-[15px] font-semibold text-ink">
            Full name
          </label>
          <input
            id="dev-signup-name"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={errors.fullName ? 'dev-signup-name-error' : undefined}
            className={`${inputBase} ${inputBorder(Boolean(errors.fullName))} mt-2`}
          />
          {errors.fullName && (
            <p id="dev-signup-name-error" role="alert" className="shake mt-1.5 text-sm font-medium text-danger">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dev-signup-email" className="block text-[15px] font-semibold text-ink">
            Email
          </label>
          <input
            id="dev-signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'dev-signup-email-error' : undefined}
            className={`${inputBase} ${inputBorder(Boolean(errors.email))} mt-2`}
          />
          {errors.email && (
            <p id="dev-signup-email-error" role="alert" className="shake mt-1.5 text-sm font-medium text-danger">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="sheen mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Creating your account
          </>
        ) : (
          'Create account'
        )}
      </button>

      {problem && (
        <p role="alert" className="shake mt-3 text-sm font-semibold text-danger">
          {problem}
        </p>
      )}
    </form>
  );
}
