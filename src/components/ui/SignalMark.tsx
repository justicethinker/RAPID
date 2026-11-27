import { cn } from '@/lib/cn';

/**
 * RAPID's decorative mark: a forward chevron with a short horizontal signal
 * bar inside its opening, echoing the speed lines beside the R. All of the ink
 * sits on the right side of the box, so the mark can sit against a photo edge
 * without the trail crossing onto the image, and it still resolves at 10px.
 *
 * It replaced the radial starburst, whose spoke count read too close to other
 * AI brands' asterisks. Direction is the point, so it is never rotated.
 */
export function SignalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('signal-mark', className)}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 4 26 16 15 28" />
      <path d="M15 16h7" />
    </svg>
  );
}
