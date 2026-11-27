import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';
import { Photo, type PhotoName } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';

/**
 * Opening band for supporting pages. `green` floats under the overlay header;
 * `cream` sits below the sticky header.
 */
export function PageHero({
  kicker,
  title,
  lead,
  children,
  photo,
  tone = 'cream',
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  photo?: { name: PhotoName; alt: string; width: number; height: number };
  tone?: 'cream' | 'green';
}) {
  const dark = tone === 'green';
  return (
    <section className={cn('relative overflow-hidden', dark ? 'on-dark green-glow text-white' : 'bg-cream-50 text-ink')}>
      {dark ? (
        <div aria-hidden="true" className="grain absolute inset-0" />
      ) : (
        <>
          <div aria-hidden="true" className="paper-grid absolute inset-0" />
          <div aria-hidden="true" className="breathe absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-sun-200/50 blur-3xl" />
        </>
      )}
      <Container
        className={cn(
          'relative grid items-center gap-12',
          dark ? 'pb-20 pt-36 sm:pb-24 sm:pt-44' : 'py-16 sm:py-24',
          photo && 'lg:grid-cols-[1.15fr_0.85fr]',
        )}
      >
        <div className="hero-stagger max-w-[860px]">
          <p className="kicker">{kicker}</p>
          <h1 className={cn('t-display mt-6', dark ? 'text-white' : 'text-ink')}>{title}</h1>
          {lead && (
            <p className={cn('mt-6 max-w-[620px] text-[18px] leading-relaxed sm:text-[20px]', dark ? 'text-cream-100' : 'text-ink-soft')}>
              {lead}
            </p>
          )}
          {children && <div className="mt-9">{children}</div>}
        </div>
        {photo && (
          <div className="pop-in relative isolate mx-auto w-full max-w-[460px]">
            <div className="overflow-hidden rounded-[32px] shadow-elev-3">
              <Photo
                name={photo.name}
                alt={photo.alt}
                sizes="(min-width: 1024px) 460px, 92vw"
                width={photo.width}
                height={photo.height}
                priority
                className="aspect-[4/5]"
              />
            </div>
            <span aria-hidden="true" className="absolute -bottom-5 -left-5 -z-10 h-28 w-28 rounded-full bg-sun-500" />
          </div>
        )}
      </Container>
    </section>
  );
}
