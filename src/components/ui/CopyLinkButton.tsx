import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

export function CopyLinkButton({
  url,
  label = 'Copy link',
  className,
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be blocked by the browser. Leave the button
      // unchanged rather than claiming the link was copied.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={cn(
        'inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-studio-300 bg-studio-25 px-3 text-xs font-bold text-ink transition-colors hover:border-brand-600 hover:bg-studio-50',
        className,
      )}
    >
      {copied ? (
        <Check size={14} className="text-brand-700" aria-hidden="true" />
      ) : (
        <Copy size={14} aria-hidden="true" />
      )}
      {copied ? 'Copied' : label}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied to clipboard.' : ''}
      </span>
    </button>
  );
}
