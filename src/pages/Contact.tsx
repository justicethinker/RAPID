import { CalendarClock, MessageCircle, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { FounderForm } from '@/components/forms/FounderForm';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supportEmail, supportEmailHref } from '@/lib/site';

const NEXT = [
  { icon: MessageCircle, title: 'We message you on WhatsApp', body: 'We aim to reply within three business days to set up a call.' },
  { icon: CalendarClock, title: 'We plan the test together', body: 'Your question, audience, timing and any cost are agreed before recruitment begins.' },
  { icon: ShieldCheck, title: 'No surprises', body: 'No pricing or payment step on this site. Requesting a test does not guarantee a place.' },
];

export default function Contact() {
  usePageMeta({
    title: 'Request a call | RAPID',
    description: 'Tell RAPID what you’re building and request a call about testing your product with real people in Nigeria.',
  });

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="paper-grid absolute inset-0" />
        <div aria-hidden="true" className="breathe absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-sun-200/40 blur-3xl" />
        <Container className="relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="hero-stagger lg:sticky lg:top-28 lg:self-start">
            <p className="kicker">Let’s talk</p>
            <h1 className="t-display mt-6 text-ink">Tell us what you’re building.</h1>
            <p className="mt-6 max-w-[460px] text-[18px] leading-relaxed text-ink-soft">
              Share your idea and who you need to reach. We’ll message you on WhatsApp to set up a call and plan your test.
            </p>
            <ol className="mt-10 space-y-5">
              {NEXT.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rapid-900 text-white">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-[18px] font-bold tracking-[-0.01em] text-ink">{title}</span>
                    <span className="mt-0.5 block text-[15px] leading-relaxed text-ink-soft">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-sm text-ink-faint">
              Prefer email?{' '}
              <a className="font-semibold text-rapid-700 underline underline-offset-4 hover:text-ink" href={supportEmailHref}>
                {supportEmail}
              </a>
            </p>
          </div>
          <div className="rise rounded-[28px] bg-white p-6 shadow-elev-3 ring-1 ring-cream-200 sm:p-10">
            <FounderForm />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
