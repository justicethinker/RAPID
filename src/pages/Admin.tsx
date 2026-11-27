import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthSplit } from "@/components/layout/AuthSplit";
import { STAFF_PHOTO } from "@/components/layout/authPhotos";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSession } from "@/auth/session";
import { SITE } from "@/content/pilot";

/**
 * The door for pilot staff. It never creates a staff role by itself: access
 * comes from an invitation, so an account that arrives here without one is
 * told plainly rather than shown a 404.
 */
export default function Admin() {
  const { status, me, error, refresh, signOut } = useSession();
  const navigate = useNavigate();

  usePageMeta({
    title: `Admin access | ${SITE.name}`,
    description: "Staff access to the RAPID pilot.",
    noindex: true,
  });

  if (status === "loading") {
    return (
      <AuthLayout>
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-ink-soft">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Checking your access…
        </p>
      </AuthLayout>
    );
  }

  if (status === "signed_in" && me?.roles.staff) {
    return <Navigate to="/staff" replace />;
  }

  return (
    <AuthLayout width="max-w-[936px]">
      <AuthSplit
        width="max-w-[560px]"
        photo={STAFF_PHOTO}
        header={
          <div className="flex items-center gap-3">
            <span className="float-slow flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-100 text-rapid-700">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <h1 className="font-display text-[28px] font-bold tracking-[-0.03em] text-ink">
              Pilot admin access
            </h1>
          </div>
        }
      >
        <div className="pop-in rounded-3xl border border-cream-200 bg-white p-6 shadow-elev-1 sm:p-8">
          {status === "error" ? (
            <>
              <p className="text-ink-soft">{error}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 font-semibold text-ink hover:bg-sun-400"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-cream-300 px-5 font-semibold text-ink hover:bg-cream-50"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : status === "signed_in" && me ? (
            <>
              <p className="text-ink-soft">
                You’re signed in as{" "}
                <strong className="text-ink">{me.person.email}</strong>, but this
                address doesn’t have staff access.
              </p>
              <p className="mt-3 text-ink-soft">
                Ask an existing admin to invite this exact address, then sign in
                again.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-sun-500 px-5 font-semibold text-ink hover:bg-sun-400"
                >
                  Check again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void signOut().then(() =>
                      navigate("/admin/sign-up", { replace: true }),
                    );
                  }}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-cream-300 px-5 font-semibold text-ink hover:bg-cream-50"
                >
                  Use another address
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-ink-soft">
                Staff accounts are invite-only. An existing admin invites your
                email address, then you create an account with that same address.
              </p>
              <p className="mt-3 text-ink-soft">
                If you’re the first admin, use the email address your team set up
                for staff access. Access is attached the first time you sign in.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/admin/sign-up"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-sun-500 px-6 text-sm font-semibold text-ink transition-colors hover:bg-sun-400"
                >
                  Create an admin account
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  to="/admin/sign-in"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-cream-300 px-6 text-sm font-semibold text-ink transition-colors hover:border-rapid-600 hover:bg-cream-50"
                >
                  I already have an account
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Not staff?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-rapid-700 underline underline-offset-2"
          >
            Join as a tester or founder
          </Link>
          .
        </p>
      </AuthSplit>
    </AuthLayout>
  );
}
