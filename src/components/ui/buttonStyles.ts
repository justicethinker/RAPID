import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface StyleOptions {
  variant?: Variant;
  size?: Size;
  className?: string;
}

/** Shared styles so links and buttons stay visually identical. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: StyleOptions = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-[150ms] ease-out',
    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-brand-700 focus-visible:outline-offset-2',
    size === 'sm' && 'h-11 px-5 text-sm',
    size === 'md' && 'h-[52px] px-7 text-[15px]',
    size === 'lg' && 'h-14 px-8 text-base',
    variant === 'primary' && [
      'bg-brand-500 text-ink shadow-accent',
      'hover:-translate-y-0.5 hover:bg-brand-700 hover:text-white hover:shadow-accent-hover',
    ],
    variant === 'outline' && [
      'border border-sand-300 bg-white text-ink',
      'hover:border-brand-600 hover:bg-sand-50',
    ],
    variant === 'ghost' && ['bg-transparent text-ink underline underline-offset-4 hover:text-brand-700'],
    className,
  );
}

