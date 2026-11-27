import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

interface StyleOptions {
  variant?: ButtonVariant;
  size?: Size;
  className?: string;
}

/**
 * Shared styles so links and buttons stay visually identical.
 *
 * - primary    the one hot action on a screen: sun with ink text.
 * - secondary  solid RAPID green, for confident structural actions.
 * - outline    quiet, on light surfaces.
 * - inverse    quiet, on dark or photographic surfaces.
 * - ghost      text-only.
 */
export function buttonStyles({ variant = 'primary', size = 'md', className }: StyleOptions = {}): string {
  return cn(
    'group relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-semibold tracking-[-0.005em]',
    'transition-[transform,background-color,box-shadow,border-color,color] duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[0.98]',
    'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-rapid-600',
    size === 'sm' && 'h-10 px-4 text-sm',
    size === 'md' && 'h-12 px-6 text-[15px]',
    size === 'lg' && 'h-14 px-7 text-base sm:px-8',
    variant === 'primary' && 'bg-sun-500 text-ink hover:-translate-y-0.5 hover:bg-sun-400 hover:shadow-sun',
    variant === 'secondary' && 'bg-rapid-900 text-cream-50 hover:-translate-y-0.5 hover:bg-rapid-800 hover:shadow-elev-2',
    variant === 'outline' && 'border border-ink/20 bg-white/60 text-ink hover:border-ink hover:bg-white',
    variant === 'ghost' && 'h-auto px-0 text-rapid-700 underline decoration-rapid-700/30 underline-offset-4 hover:text-ink hover:decoration-sun-500',
    variant === 'inverse' && 'border border-white/35 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white/15 focus-visible:outline-sun-200',
    className,
  );
}
