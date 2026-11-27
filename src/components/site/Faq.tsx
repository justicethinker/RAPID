import * as Accordion from '@radix-ui/react-accordion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/content/pilot';
import { cn } from '@/lib/cn';

function Answer({ answer, privacyLink }: { answer: string; privacyLink?: boolean }) {
  if (!privacyLink) {
    return <p className="text-[15px] leading-relaxed text-light-muted">{answer}</p>;
  }

  const [before, after] = answer.split('Privacy Policy');
  return (
    <p className="text-[15px] leading-relaxed text-light-muted">
      {before}
      <Link
        to="/privacy"
        className="font-semibold text-brand-700 underline underline-offset-2 hover:text-ink"
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
      className={cn('border-t border-studio-200', className)}
    >
      {items.map((item, index) => (
        <Accordion.Item
          key={item.question}
          value={`${id}-${index}`}
          className="group border-b border-studio-200"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center gap-4 py-5 text-left transition-colors hover:text-brand-700 data-[state=open]:text-brand-700">
              <span className="flex-1 text-[16px] font-bold leading-snug text-ink group-data-[state=open]:text-brand-700">
                {item.question}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-studio-300 text-studio-500 transition-all duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:border-brand-700 group-data-[state=open]:bg-brand-50 group-data-[state=open]:text-brand-700">
                <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-[accordionOpen_0.32s_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[accordionClose_0.22s_ease]">
            <div className="pb-5 pr-12">
              <Answer answer={item.answer} privacyLink={item.privacyLink} />
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
