import { PageShell } from '@/components/layout/PageShell';
import { Container } from '@/components/layout/Container';
import { FounderForm } from '@/components/forms/FounderForm';
import { FOUNDER_FORM, HOME, SITE } from '@/content/pilot';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Founders() {
  usePageMeta({
    title: `Request a test | ${SITE.name}`,
    description:
      'Tell RAPID what you need to learn and who you need to reach. We will contact you to see whether the pilot is a fit.',
  });

  return (
    <PageShell>
      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-[720px]">
          <h1 className="t-section text-ink">{FOUNDER_FORM.title}</h1>
          <p className="lead mt-4">{FOUNDER_FORM.intro}</p>
          <p className="mt-3 text-sm text-light-muted">{HOME.founders.note}</p>
          <div className="mt-10">
            <FounderForm />
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
