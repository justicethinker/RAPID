import { useEffect } from 'react';
import { useInView } from '@/hooks/useInView';
import {
  trackAudienceEvent,
  type AudienceSource,
} from '@/lib/audience-analytics';

/**
 * A one-pixel marker that records a post impression when the post card first
 * enters the viewport. Rendering the marker in a post that never becomes
 * visible must not count as an impression.
 */
export function PostImpressionMarker({
  startupId,
  postId,
  source,
  disabled = false,
}: {
  startupId: string;
  postId: string;
  source: AudienceSource;
  disabled?: boolean;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();

  useEffect(() => {
    if (!inView || disabled) return;
    trackAudienceEvent({
      startupId,
      postId,
      eventType: 'post_impression',
      source,
    });
  }, [disabled, inView, postId, source, startupId]);

  return <span ref={ref} aria-hidden="true" className="block h-px w-full" />;
}
