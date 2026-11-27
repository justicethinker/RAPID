import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthSplit } from "@/components/layout/AuthSplit";
import { STAFF_PHOTO } from "@/components/layout/authPhotos";
import { inputBase, inputBorder } from "@/components/forms/fieldStyles";
import { usePageMeta } from "@/hooks/usePageMeta";
import { clerkPublishableKey, useSession } from "@/auth/session";
import { ApiError, api } from "@/lib/api";
import { supportEmail, supportEmailHref } from "@/lib/site";
import { SITE } from "@/content/pilot";

interface Health {
  ok: boolean;
  auth?: { dev: boolean; clerk: boolean };
}

/**
 * The admin door. It lives on its own slug so the public sign-in page never
 * advertises a staff route, and it asks for credentials rather than an email.
 * The server owns the comparison and refuses the request when local role
 * sign-in is off, which is how the dashboard stays closed on a deployment.
 */
export default function AdminSignIn() {
  const { status, me, signInAdminDev } = useSession();
  const navigate = useNavigate();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: `Admin sign in | ${SITE.name}`,
    description: "Staff access to the RAPID pilot.",
    noindex: true,
  });

  useEffect(() => {
    let cancelled = false;
    api<Health>("/api/health")
      .then((health) => {
        // Clerk owns staff sign-in when it is configured, so the credential
        // form would only set a cookie Clerk never reads.
        if (!cancelled) {
          setAvailable(Boolean(health.auth?.dev) && !clerkPublishableKey);
        }
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "signed_in" && me?.roles.staff) {
    return <Navigate to="/staff" replace />;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await signInAdminDev(username, password);
      navigate("/staff", { replace: true });
    } catch (cause) {
      const code = cause instanceof ApiError ? cause.code : null;
      setError(
        code === "unauthorized"
          ? "That username and password did not match."
          : code === "not_found"
            ? "Admin sign-in is not available on this deployment."
            : "We could not sign you in. Check your connection and try again.",
      );
      setPending(false);
    }
  };

  return (
    <AuthLayout width="max-w-[816px]">
      <AuthSplit
        width="max-w-[440px]"
        photo={STAFF_PHOTO}
        header={
          <>
            <div className="flex items-center gap-3">
              <span className="float-slow flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-studio-100 text-brand-700">
                <ShieldCheck size={20} aria-hidden="true" />
              </span>
              <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-ink">
                Admin sign in
              </h1>
            </div>
            <p className="mt-3 text-sm text-light-muted">
              Staff only. Sign in with the credentials the team issued to you.
            </p>
          </>
        }
      >
        <div className="pop-in rounded-3xl border border-studio-200 bg-studio-25 p-6 shadow-elev-1 sm:p-8">
          {available === null ? (
            <p className="flex items-center gap-2 text-sm text-light-muted">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Checking admin sign-in…
            </p>
          ) : available === false ? (
            <div className="rounded-xl border border-studio-200 bg-studio-50 p-4">
              <p className="text-sm text-light-muted">
                Admin sign-in is unavailable here.{" "}
                <Link
                  to="/admin"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  See admin access
                </Link>{" "}
                or email{" "}
                <a
                  className="font-semibold text-brand-700 underline underline-offset-2"
                  href={supportEmailHref}
                >
                  {supportEmail}
                </a>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)}>
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[15px] font-semibold text-ink"
                >
                  Username
                </label>
                <input
                  id="admin-username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={`${inputBase} ${inputBorder(Boolean(error))} mt-2`}
                  aria-invalid={error ? true : undefined}
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="admin-password"
                  className="block text-[15px] font-semibold text-ink"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputBase} ${inputBorder(Boolean(error))} mt-2`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "admin-signin-error" : undefined}
                />
              </div>

              <button
                type="submit"
                disabled={pending || !username.trim() || !password}
                className="sheen mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 active:scale-[0.99] disabled:opacity-60"
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
                  id="admin-signin-error"
                  role="alert"
                  className="shake mt-3 text-sm font-semibold text-danger"
                >
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-light-muted">
          Not staff?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            Join as a tester or founder
          </Link>
          .
        </p>
      </AuthSplit>
    </AuthLayout>
  );
}
