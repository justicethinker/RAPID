import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when an element first scrolls into view. Motion is pure CSS; this
 * only decides when to add `is-visible`, so no layout work happens per frame.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  // Without IntersectionObserver the content is simply visible from the start.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (inView) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setInView(true);
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  return { ref, inView };
}
