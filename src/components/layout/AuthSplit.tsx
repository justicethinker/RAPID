import type { ReactNode } from 'react';
import { Photo } from '@/components/ui/Photo';
import { SignalMark } from '@/components/ui/SignalMark';

import type { AuthPhoto } from './authPhotos';

/**
 * The portrait rail shared by the account screens. The content column keeps
 * its original width; the photo adds a 320px column on desktop and becomes a
 * 16:9 band between the intro and the card on smaller screens.
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
    <div className="auth-split grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-x-14">
      <div className={`w-full ${width} mx-auto lg:col-start-1 lg:row-start-1`}>
        {header}
      </div>

      <div className="auth-visual lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="relative mx-auto w-full max-w-[440px] lg:sticky lg:top-8 lg:mx-0 lg:max-w-none">
          <p className="auth-visual-label">THE RAPID COMMUNITY <span><SignalMark /></span></p>
          <figure className="auth-portrait relative overflow-hidden border border-studio-200 bg-studio-100 shadow-elev-3">
            <Photo
              name={photo.name}
              sizes="(min-width: 1024px) 320px, (min-width: 480px) 440px, 90vw"
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              priority
              className="aspect-[16/9] object-[center_30%] saturate-[.82] contrast-[1.02] lg:aspect-[4/5] lg:object-center"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/65 via-transparent to-transparent"
            />
            <span
              aria-hidden="true"
              className="absolute left-3 top-3 rounded-full border border-white/25 bg-forest-950/50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-studio-50 backdrop-blur"
            >
              RAPID · Pilot
            </span>
            {photo.caption && (
              <figcaption className="absolute bottom-3 left-3 text-[10px] font-bold text-studio-50">
                {photo.caption}
              </figcaption>
            )}
          </figure>
          <div className="auth-visual-note"><span>REAL PEOPLE. HONEST FEEDBACK.</span><strong>Your experience makes the difference.</strong></div>
        </div>
      </div>

      <div className={`w-full ${width} mx-auto lg:col-start-1 lg:row-start-2`}>
        {children}
      </div>
    </div>
  );
}
