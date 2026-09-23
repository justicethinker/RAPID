import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-[150ms] ease-out',
        'focus-visible:outline-3 focus-visible:outline focus-visible:outline-brand-500 focus-visible:outline-offset-3 focus-visible:rounded-lg',
        // Sizes
        size === 'sm' && 'h-11 px-5 text-sm',
        size === 'md' && 'h-[52px] px-7 text-[15px]',
        size === 'lg' && 'h-14 px-8 text-base',
        // Variants
        variant === 'primary' && [
          'bg-brand-500 text-ink shadow-accent',
          !disabled && 'hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-accent-hover',
        ],
        variant === 'outline' && [
          'border border-navy-line text-dark-text bg-transparent',
          !disabled && 'hover:bg-white/[.06]',
        ],
        variant === 'ghost' && [
          'border border-navy-200 text-ink bg-white',
          !disabled && 'hover:bg-navy-50',
        ],
        // Disabled
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight size={size === 'sm' ? 16 : 18} strokeWidth={2} />}
    </button>
  );
}
