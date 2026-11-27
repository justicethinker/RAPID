import { cn } from '@/lib/cn';

export type PhotoName = 'hero' | 'founder' | 'tester' | 'session' | 'team';

/**
 * Widths generated in `public/images/photos` for each source photo. The
 * photos are illustrative (see docs/PHOTO_CREDITS.md); the footer carries the
 * single site-wide note saying so.
 */
const WIDTHS: Record<PhotoName, number[]> = {
  hero: [768, 1280, 1920],
  founder: [600, 900, 1200],
  tester: [600, 900, 1200],
  session: [600, 928],
  team: [600, 928],
};

interface PhotoProps {
  name: PhotoName;
  alt: string;
  sizes: string;
  /** Intrinsic size of the largest generated file, used to reserve space. */
  width: number;
  height: number;
  /** Load immediately for above-the-fold imagery. */
  priority?: boolean;
  className?: string;
}

/**
 * Illustrative photography served as a responsive WebP set. The intrinsic
 * dimensions keep layout stable before the file arrives, and small screens
 * only download a smaller crop.
 */
export function Photo({
  name,
  alt,
  sizes,
  width,
  height,
  priority = false,
  className,
}: PhotoProps) {
  const widths = WIDTHS[name];
  const largest = widths[widths.length - 1];

  return (
    <img
      src={`/images/photos/${name}-${largest}.webp`}
      srcSet={widths.map((candidate) => `/images/photos/${name}-${candidate}.webp ${candidate}w`).join(', ')}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('block w-full object-cover', className)}
    />
  );
}
