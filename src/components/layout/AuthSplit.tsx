import type { ReactNode } from 'react';
import { Photo } from '@/components/ui/Photo';
import type { AuthPhoto } from './authPhotos';

/**
 * Account screens: the form column on the left and, on large screens, a tall
 * photo panel with one human line on the right. Small screens keep only the
 * form so nothing stands between a person and the field they need.
 */
export function AuthSplit({
  photo,
  width,
  header,
  children,
}: {
  photo: AuthPhoto;
  /** Max width of the text/form column, e.g. `max-w-[440px]`. */
  width: string;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-14">
      <div className={`mx-auto w-full ${width} lg:col-start-1 lg:row-start-1`}>{header}</div>

      <div aria-hidden="true" className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
        <figure className="on-dark relative overflow-hidden rounded-[28px] bg-rapid-900 shadow-elev-3 lg:sticky lg:top-8">
          <Photo
            name={photo.name}
            sizes="340px"
            alt=""
            width={photo.width}
            height={photo.height}
            priority
            className="ken-burns aspect-[4/5.2] object-cover"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rapid-950 via-rapid-950/30 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span className="kicker">Real people · Honest feedback</span>
            <strong className="mt-3 block font-display text-[26px] font-bold leading-[1.08] tracking-[-0.025em]">
              Your experience <span className="t-serif text-sun-300">makes the difference.</span>
            </strong>
          </figcaption>
        </figure>
      </div>

      <div className={`mx-auto w-full ${width} lg:col-start-1 lg:row-start-2`}>{children}</div>
    </div>
  );
}
