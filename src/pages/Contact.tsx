import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { FounderForm } from '@/components/forms/FounderForm';
import { usePageMeta } from '@/hooks/usePageMeta';
import { supportEmail, supportEmailHref } from '@/lib/site';

export default function Contact() {
  usePageMeta({ title: 'Request a call | RAPID', description: 'Tell RAPID what you’re building and request a call about testing your product with real people in Nigeria.' });
  return <PageShell><section className="signal-hero"><Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="signal-kicker"><span /> LET’S TALK</p><h1 className="signal-heading mt-6">Tell us what you’re building.</h1><p className="mt-5 max-w-[460px] text-lg leading-relaxed text-[#39544a]">Share your idea and who you need to reach. We’ll message you on WhatsApp to set up a call and plan your test.</p><div className="mt-8 border-l-4 border-[#075f45] bg-[#b2b6f2] p-6 text-[#17382c]"><p className="font-bold">What happens next?</p><p className="mt-2 text-sm leading-relaxed">We aim to reply within three business days. Timing and any cost are agreed with you before recruitment begins.</p></div><p className="mt-6 text-sm text-[#476157]">Prefer email? <a className="font-semibold underline" href={supportEmailHref}>{supportEmail}</a></p></div><div className="border-t-8 border-[#075f45] bg-white p-6 shadow-elev-2 sm:p-10"><FounderForm /></div></Container></section></PageShell>;
}
