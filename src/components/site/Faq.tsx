import * as Accordion from '@radix-ui/react-accordion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/content/pilot';
import { cn } from '@/lib/cn';

function Answer({ answer, privacyLink }: { answer: string; privacyLink?: boolean }) {
  if (!privacyLink) {
    return <p className="text-[16px] leading-relaxed text-ink-soft">{answer}</p>;
  }

  const [before, after] = answer.split('Privacy Policy');
  return (
    <p className="text-[16px] leading-relaxed text-ink-soft">
      {before}
      <Link
        to="/privacy"
        className="font-semibold text-rapid-700 underline underline-offset-2 hover:text-ink"
      >
        Privacy Policy
      </Link>
      {after}
    </p>
  );
}

/**
 * One editorial FAQ treatment for every public page: ruled rows, no nested
 * cards, and an explicit plus/minus control that stays keyboard accessible.
 */
export function Faq({
  id,
  items,
  className,
}: {
  id: string;
  items: FaqItem[];
  className?: string;
}) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className={cn('space-y-3', className)}
    >
      {items.map((item, index) => (
        <Accordion.Item
          key={item.question}
          value={`${id}-${index}`}
          className="group rounded-2xl border border-cream-200 bg-white px-5 transition-[border-color,box-shadow] duration-300 hover:border-cream-300 data-[state=open]:border-rapid-200 data-[state=open]:shadow-elev-2 sm:px-6"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center gap-4 py-5 text-left">
              <span className="flex-1 font-display text-[18px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                {item.question}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink transition-all duration-300 group-hover:bg-cream-200 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-sun-500">
                <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordionOpen_0.32s_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[accordionClose_0.22s_ease]">
            <div className="pb-6 pr-2 sm:pr-14">
              <Answer answer={item.answer} privacyLink={item.privacyLink} />
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
