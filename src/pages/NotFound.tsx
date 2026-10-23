import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { NOT_FOUND } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: 'Page not found | RAPID', noindex: true });

  return (
    <PageShell>
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-[640px]">
          <p className="t-eyebrow text-brand-700">404</p>
          <h1 className="t-section mt-3 text-ink">{NOT_FOUND.title}</h1>
          <p className="lead mt-4">{NOT_FOUND.body}</p>
          <ul className="mt-7 space-y-2">
            {NOT_FOUND.links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-brand-700 underline underline-offset-2 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </PageShell>
  );
}
