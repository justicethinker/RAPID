import { useEffect, useState } from 'react';
import { useSession } from '@/auth/session';
import { cn } from '@/lib/cn';

/**
 * Founder-facing media may belong to a draft startup or post. Those assets are
 * not public, so an <img src> alone cannot load them: the request needs the
 * dashboard's bearer token (or the local dev session cookie).
 */
export function AuthedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const { getToken } = useSession();
  const [loaded, setLoaded] = useState<{
    src: string;
    objectUrl: string | null;
    failed: boolean;
  }>({ src, objectUrl: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    void (async () => {
      try {
        const token = await getToken();
        const response = await fetch(src, {
          credentials: 'same-origin',
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error('media unavailable');
        const blob = await response.blob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setLoaded({ src, objectUrl: createdUrl, failed: false });
      } catch {
        if (!cancelled) setLoaded({ src, objectUrl: null, failed: true });
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src, getToken]);

  // A changed src is loading even before the effect for it has run. Keeping
  // that in the state lets the effect avoid a synchronous reset render.
  const current =
    loaded.src === src ? loaded : { src, objectUrl: null, failed: false };

  if (!current.objectUrl) {
    return (
      <span
        role="img"
        aria-label={current.failed ? 'Image unavailable' : 'Loading image'}
        className={cn(
          'flex items-center justify-center bg-cream-100 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint',
          className,
        )}
      >
        {current.failed ? 'Image unavailable' : 'Loading image'}
      </span>
    );
  }

  return <img src={current.objectUrl} alt={alt} className={className} />;
}
