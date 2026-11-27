import { CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { THANKS } from '@/content/pilot';
import { supportEmail, supportEmailHref } from '@/lib/site';
import { usePageMeta } from '@/hooks/usePageMeta';

export function ThanksPage({ kind }: { kind: 'tester' | 'founder' }) {
  const copy = THANKS[kind];
  const location = useLocation();
  const reference = (location.state as { reference?: string } | null)?.reference;

  usePageMeta({
    title: kind === 'tester' ? 'Thanks for applying | RAPID' : 'Thanks for your request | RAPID',
    noindex: true,
  });

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-studio-50">
        <div
          aria-hidden="true"
          className="paper-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-55"
        />
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
            <div className="hero-stagger min-w-0">
              <span className="eyebrow-pill">
                {kind === 'tester' ? 'Application received' : 'Request received'}
              </span>

              <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                <CheckCircle2
                  size={26}
                  className="check-pop text-brand-700"
                  aria-hidden="true"
                />
              </div>

              <h1 className="t-section mt-5 max-w-[620px] text-ink">{copy.title}</h1>

              <p className="lead mt-5">{copy.body}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {kind === 'tester' && <ButtonLink to="/sign-in" showArrow>
                  Sign in to your account
                </ButtonLink>}
                <ButtonLink to="/" variant="outline">
                  {copy.home}
                </ButtonLink>
              </div>

              <p className="mt-6 max-w-[54ch] text-[13px] leading-relaxed text-light-muted">
                {kind === 'tester' ? (
                  <>
                    Applying doesn’t guarantee a test or payment. Need help? Email{' '}
                    <a
                      href={supportEmailHref}
                      className="font-semibold text-brand-700 underline underline-offset-2"
                    >
                      {supportEmail}
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Prefer to talk first? Email{' '}
                    <a
                      href={supportEmailHref}
                      className="font-semibold text-brand-700 underline underline-offset-2"
                    >
                      {supportEmail}
                    </a>{' '}
                    or reply on WhatsApp when we get in touch.
                  </>
                )}
              </p>

              <p className="mt-3 text-[13px] leading-relaxed text-light-muted">
                <Link
                  to={kind === 'tester' ? '/contact' : '/join'}
                  className="font-semibold text-brand-700 underline underline-offset-2 hover:text-ink"
                >
                  {kind === 'tester'
                    ? 'Building something? Test your idea with RAPID as a founder.'
                    : 'Want to test products yourself? Become a tester.'}
                </Link>
              </p>
            </div>

            <aside className="h-fit rounded-2xl border border-studio-200 bg-studio-25 p-6 sm:p-8 lg:sticky lg:top-28">
              <p className="t-eyebrow text-brand-700">What happens next</p>
              <ol className="mt-5 space-y-5">
                {(kind === 'tester'
                  ? [
                      'Our team reviews your application and may follow up with a question.',
                      'If you’re approved, invitations appear in your account and arrive by email when a test fits.',
                      'Read the terms and reward, then accept or decline.',
                    ]
                  : [
                      'Our team reads your request and messages you on WhatsApp to set up a call.',
                      'We talk through your question, audience, timing and any cost.',
                      'If it’s a fit, we agree the next steps with you before any recruiting starts.',
                    ]
                ).map((step, index) => (
                  <li key={step} className="border-t border-studio-200 pt-4 first:border-t-0 first:pt-0">
                    <span className="text-[10px] font-extrabold tracking-[0.12em] text-studio-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-2 text-[13px] leading-relaxed text-light-muted">{step}</p>
                  </li>
                ))}
              </ol>

              {reference && (
                <div className="mt-7 rounded-xl border border-studio-200 bg-studio-50 p-4">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-studio-500">
                    Your reference
                  </p>
                  <p className="mt-2 break-all font-mono text-[12px] text-ink">{reference}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-studio-500">
                    Keep this reference if you contact support.
                  </p>
                </div>
              )}

              <p className="mt-6 flex items-center gap-2 text-[11px] font-medium text-studio-500">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                {kind === 'tester'
                  ? 'A real person reads every application.'
                  : 'A real person reads every request.'}
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
