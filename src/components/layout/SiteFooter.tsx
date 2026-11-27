import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Container } from '@/components/layout/Container';
import { supportEmail, supportEmailHref } from '@/lib/site';

const COLUMNS = [
  {
    title: 'Get started',
    links: [
      { to: '/founders', label: 'For founders' },
      { to: '/join', label: 'For testers' },
      { to: '/contact', label: 'Test my idea' },
      { to: '/sign-in', label: 'Sign in' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { to: '/how-it-works', label: 'How it works' },
      { to: '/discover', label: 'Discover startups' },
      { to: '/about', label: 'About RAPID' },
      { to: '/privacy', label: 'Privacy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="on-dark relative overflow-hidden bg-rapid-950 text-cream-50">
      <Container className="relative pb-10 pt-20 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <div>
            <Link to="/" aria-label="RAPID home" className="inline-block text-white">
              <Logo size={34} />
            </Link>
            <p className="mt-6 max-w-[34ch] font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
              Validation that drives{' '}
              <span className="t-serif text-sun-300">traction.</span>
            </p>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-rapid-100">
              RAPID helps founders in Nigeria test ideas with the right people, and gives everyday
              people a say in what gets built.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-rapid-200">{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[15px] text-cream-50 transition-colors hover:text-sun-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-rapid-200">Get in touch</h2>
            <a
              href={supportEmailHref}
              className="mt-5 inline-flex items-center gap-1.5 break-all text-[15px] text-cream-50 underline decoration-white/30 underline-offset-4 transition-colors hover:text-sun-300"
            >
              {supportEmail}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-rapid-100">
              A pilot in Nigeria. Matching is team-assisted, and taking part is always your choice.
            </p>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="pointer-events-none mt-16 select-none font-display text-[clamp(88px,19vw,300px)] font-extrabold leading-[0.8] tracking-[-0.06em] text-white/[0.06]"
        >
          RAPID
        </p>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-rapid-100 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} RAPID · Nigeria pilot</span>
          <span>Photos are illustrative and show no real RAPID testers or founders.</span>
        </div>
      </Container>
    </footer>
  );
}
