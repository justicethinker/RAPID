import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthSplit } from "@/components/layout/AuthSplit";
import { SESSION_PHOTO } from "@/components/layout/authPhotos";
import { inputBase, inputBorder } from "@/components/forms/fieldStyles";
import { usePageMeta } from "@/hooks/usePageMeta";
import { clerkPublishableKey, useSession, type Me } from "@/auth/session";
import { ApiError, api } from "@/lib/api";
import { supportEmail, supportEmailHref } from "@/lib/site";
import { SITE } from "@/content/pilot";

const ClerkSignInPanel = lazy(() => import("@/auth/ClerkSignInPanel"));

interface Health {
  ok: boolean;
  auth?: { dev: boolean; clerk: boolean };
}

/** Where a person belongs once their session is known. */
function landingFor(me: Me): string {
  if (me.roles.staff) return "/staff";
  if (me.roles.tester) return "/app/tester";
  if (me.roles.founder) return "/app/founder";
  return "/app";
}

/**
 * Sign-in without Clerk configured. One email field is enough: the roles come
 * from the account's rows, so there is no role to choose here and no staff
 * door — admins use /admin/sign-in.
 */
function EmailSignIn() {
  const { signInDev } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<Health>("/api/health")
      .then((health) => {
        if (!cancelled) setAvailable(Boolean(health.auth?.dev));
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (available === false) {
    return (
      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
        <p className="text-sm text-ink-soft">
          Sign-in isn’t available right now. Email{" "}
          <a
            className="font-semibold text-rapid-700 underline underline-offset-2"
            href={supportEmailHref}
          >
            {supportEmail}
          </a>{" "}
          and we’ll sort it out.
        </p>
      </div>
    );
  }

  if (available === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Checking sign-in…
      </p>
    );
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address || pending) return;

    setPending(true);
    setError(null);
    try {
      // The role argument is only a hint when no email is given; the account's
      // rows decide what this person can open.
      const me = await signInDev("tester", address);
      const from = (location.state as { from?: string } | null)?.from;
      // Go straight to the role's own dashboard. Landing on /app only to be
      // redirected again leaves a window where the next navigation can race
      // the redirect.
      navigate(
        from && from.startsWith("/") && !from.startsWith("/sign-in")
          ? from
          : landingFor(me),
        { replace: true },
      );
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 404
          ? "We couldn’t find an account with that email. Check the address, or create an account."
          : "We couldn’t sign you in. Check your connection and try again.",
      );
      setPending(false);
    }
  };

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate>
      <label
        htmlFor="signin-email"
        className="block text-[15px] font-semibold text-ink"
      >
        Email
      </label>
      <p className="mt-1 text-sm text-ink-soft">
        Use the email on your account.
      </p>
      <input
        id="signin-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "signin-error" : undefined}
        className={`${inputBase} ${inputBorder(Boolean(error))} mt-2`}
      />

      <button
        type="submit"
        disabled={pending || !email.trim()}
        className="sheen mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-sun-500 px-5 font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-400 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {error && (
        <p
          id="signin-error"
          role="alert"
          className="shake mt-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}
    </form>
  );
}

export default function SignIn() {
  const { status } = useSession();

  usePageMeta({
    title: `Sign in | ${SITE.name}`,
    description:
      "Sign in to RAPID to manage your startup profile, posts and validation requests, or your tester invitations.",
    noindex: true,
  });

  if (status === "signed_in") return <Navigate to="/app" replace />;

  return (
    <AuthLayout width="max-w-[816px]">
      <AuthSplit
        width="max-w-[440px]"
        photo={SESSION_PHOTO}
        header={
          <>
            <h1 className="font-display text-center text-[32px] font-bold tracking-[-0.03em] text-ink">
              Welcome back.
            </h1>
            <p className="mx-auto mt-3 max-w-[38ch] text-center text-ink-soft">
              {clerkPublishableKey
                ? "Sign in with the email you signed up with, or continue with Google if that’s how you created your account."
                : "Sign in to manage your startup profile, posts, validation requests and tester invitations."}
            </p>
          </>
        }
      >
        <div className="rise rounded-2xl border border-cream-200 bg-white p-5 shadow-elev-1 sm:p-7">
            {/* The session resolves after the first paint. Showing the form
                during that window flashes sign-in controls at someone who is
                already signed in, and a redirect follows. */}
            {status === "loading" ? (
              <p className="flex items-center justify-center gap-2 py-8 text-sm text-ink-soft">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Loading sign-in…
              </p>
            ) : clerkPublishableKey ? (
              <Suspense
                fallback={
                  <p className="flex items-center justify-center gap-2 py-8 text-sm text-ink-soft">
                    <Loader2
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Loading sign-in…
                  </p>
                }
              >
                <ClerkSignInPanel />
              </Suspense>
            ) : (
              <EmailSignIn />
            )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{" "}
          <Link
            to="/sign-up/tester"
            className="font-semibold text-rapid-700 underline underline-offset-2"
          >
            Create a tester account
          </Link>
          . Founders can{" "}
          <Link to="/sign-up/founder" className="font-semibold text-rapid-700 underline underline-offset-2">
            create a startup profile
          </Link>{" "}
          instead.
        </p>
      </AuthSplit>
    </AuthLayout>
  );
}
