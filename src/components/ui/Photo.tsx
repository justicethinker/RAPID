import { cn } from '@/lib/cn';

export type PhotoName =
  | 'test-session'
  | 'session'
  | 'staff'
  | 'tester'
  | 'founder'
  | 'tester-card'
  | 'founder-card';

/** Widths generated in `public/images/photos` for each source photo. */
const WIDTHS: Record<PhotoName, number[]> = {
  'test-session': [900, 1400, 2000],
  session: [600, 900],
  staff: [600, 900],
  tester: [600, 900, 1200],
  founder: [600, 900, 1200],
  'tester-card': [600, 900],
  'founder-card': [600, 900],
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
 * Licensed photography served as a responsive WebP set. The intrinsic
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
