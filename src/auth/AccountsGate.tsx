import type { ReactNode } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ButtonLink } from '@/components/ui/Button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { accountsEnabled } from '@/auth/session';
import { supportEmail, supportEmailHref } from '@/lib/site';

function AccountsOff() {
  usePageMeta({
    title: 'Accounts are coming soon | RAPID',
    description: 'RAPID accounts are not switched on for this site yet.',
  });

  return (
    <AuthLayout width="max-w-[620px]">
      <div className="rounded-[28px] bg-white p-8 shadow-elev-3 ring-1 ring-cream-200 sm:p-12">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rapid-900 text-sun-300">
          <KeyRound size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-7 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[42px]">
          Accounts aren’t switched on <span className="t-serif text-rapid-700">just yet.</span>
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
          We’re getting sign-in ready for the pilot. Everything else on the site works: you can read how testing works,
          or tell us about your idea and we’ll be in touch.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/contact" showArrow>
            Tell us your idea
          </ButtonLink>
          <ButtonLink to="/how-it-works" variant="outline">
            How it works
          </ButtonLink>
        </div>
        <p className="mt-8 flex items-center gap-2 border-t border-cream-200 pt-6 text-sm text-ink-soft">
          <Mail size={15} aria-hidden="true" className="text-rapid-700" />
          Questions?{' '}
          <a href={supportEmailHref} className="font-semibold text-rapid-700 underline underline-offset-4 hover:text-ink">
            {supportEmail}
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}

/** Renders account screens only when this build can actually sign people in. */
export function AccountsGate({ children }: { children: ReactNode }) {
  if (!accountsEnabled) return <AccountsOff />;
  return <>{children}</>;
}
