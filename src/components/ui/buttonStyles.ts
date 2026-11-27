import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'inverse';
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
    'group relative inline-flex items-center justify-center gap-3 rounded-lg font-bold transition-all duration-200 ease-out active:scale-[0.98]',
    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-brand-700 focus-visible:outline-offset-2',
    size === 'sm' && 'h-11 px-5 text-sm',
    size === 'md' && 'h-[52px] px-7 text-[15px]',
    size === 'lg' && 'h-14 px-8 text-base',
    variant === 'primary' && [
      'bg-[#075f45] text-white',
      'hover:-translate-y-0.5 hover:bg-[#123c2e] hover:text-white',
    ],
    variant === 'outline' && [
      'border border-[#8fa99a] bg-transparent text-[#143b2e]',
      'hover:border-[#075f45] hover:bg-white',
    ],
    variant === 'ghost' && ['bg-transparent text-ink underline underline-offset-4 hover:text-brand-700'],
    variant === 'inverse' && [
      'border border-white/25 bg-transparent text-studio-25 hover:border-white/50 hover:bg-studio-25/10 hover:text-white',
    ],
    className,
  );
}

