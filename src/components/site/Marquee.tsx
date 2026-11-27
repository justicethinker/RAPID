import { Fragment } from 'react';
import { SignalMark } from '@/components/ui/SignalMark';
import { cn } from '@/lib/cn';

/**
 * A slow strip of words. The list renders twice so the loop is seamless;
 * the copy is hidden from assistive tech and a plain sentence stands in.
 * Under reduced motion the strip simply sits still.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const track = (hidden: boolean) => (
    <div className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <span className="whitespace-nowrap">{item}</span>
          <SignalMark className="text-sun-500" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={cn('marquee', className)}>
      <p className="sr-only">{items.join(', ')}</p>
      <div aria-hidden="true" className="flex">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
