import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { THANKS } from '@/content/pilot';
import { supportEmail, supportEmailHref } from '@/lib/site';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ThanksPage({ kind }: { kind: 'tester' | 'founder' }) {
  const copy = THANKS[kind];

  usePageMeta({
    title: kind === 'tester' ? 'Thanks for applying | RAPID' : 'Thanks for your request | RAPID',
    noindex: true,
  });

  return (
    <PageShell>
      <Container className="py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[640px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 size={30} className="text-brand-700" aria-hidden="true" />
          </div>

          <h1 className="t-section mt-6 text-ink">{copy.title}</h1>

          <p className="mt-5 text-[17px] leading-relaxed text-light-muted">
            {copy.body}
            {kind === 'tester' && (
              <>
                {' '}
                <a
                  href={supportEmailHref}
                  className="font-semibold text-brand-700 underline underline-offset-2 hover:text-ink"
                >
                  {supportEmail}
                </a>
                .
              </>
            )}
          </p>

          {kind === 'tester' && (
            <p className="mt-4 text-[17px] leading-relaxed text-light-muted">
              {THANKS.tester.bodyAfter}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand-500 px-6 text-sm font-bold text-ink transition-colors hover:bg-brand-700 hover:text-white"
            >
              {copy.home}
            </Link>
            <Link
              to="/founders"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-sand-300 px-6 text-sm font-bold text-ink transition-colors hover:border-brand-600 hover:bg-sand-50"
            >
              For founders
            </Link>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
