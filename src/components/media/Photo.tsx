import { useState, type CSSProperties } from 'react';

interface PhotoProps {
  src: string;
  /** Decorative by default — surrounding markup carries the labels. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
  /** Prioritise this image in the loader — use for above-the-fold media (LCP). */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * <img> that removes itself when the file fails to load, revealing the
 * gradient/Avatar placeholder underneath. Lets every slot be wired before
 * the licensed photography arrives without shipping broken images.
 */
export function Photo({
  src,
  alt = '',
  className,
  style,
  loading = 'lazy',
  fetchPriority,
}: PhotoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      style={style}
    />
  );
}
