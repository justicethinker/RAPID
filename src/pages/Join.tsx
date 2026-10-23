import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { TesterForm } from '@/components/forms/TesterForm';
import { SITE, TESTER_FORM } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Join() {
  usePageMeta({
    title: `Request your invite | ${SITE.name}`,
    description:
      'Apply to join the RAPID tester pool. Share a few details and we will review your application within three business days.',
  });

  return (
    <PageShell>
      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-[720px]">
          <h1 className="t-section text-ink">{TESTER_FORM.title}</h1>
          <p className="lead mt-4">{TESTER_FORM.intro}</p>
          <p className="mt-3 text-sm text-light-muted">{TESTER_FORM.note}</p>
          <div className="mt-10">
            <TesterForm />
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
