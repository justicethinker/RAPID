import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { NOT_FOUND } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: 'Page not found | RAPID', noindex: true });

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-cream-50">
        <div
          aria-hidden="true"
          className="paper-grid pointer-events-none absolute inset-x-0 top-0 h-full opacity-50"
        />
        <Container className="relative py-20 sm:py-28 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div aria-hidden="true" className="select-none">
              <span className="float-slow block font-display text-[clamp(120px,18vw,260px)] font-extrabold leading-[0.8] tracking-[-0.06em] text-rapid-900">
                4<span className="t-serif font-normal text-sun-500">0</span>4
              </span>
              <span className="mt-8 block h-[3px] w-16 rounded-full bg-sun-500" />
            </div>

            <div className="hero-stagger max-w-[620px]">
              <p className="kicker">Page not found</p>
              <h1 className="t-section mt-4 text-ink">{NOT_FOUND.title}</h1>
              <p className="lead mt-4">{NOT_FOUND.body}</p>

              <ul className="mt-9 border-t border-cream-300">
                {NOT_FOUND.links.map((link) => (
                  <li key={link.to} className="border-b border-cream-300">
                    <Link
                      to={link.to}
                      className="group flex min-h-[60px] items-center justify-between gap-4 font-display text-[19px] font-semibold tracking-[-0.01em] text-ink transition-colors hover:text-rapid-700"
                    >
                      {link.label}
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="text-cream-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rapid-700"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
