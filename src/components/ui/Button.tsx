import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonStyles } from '@/components/ui/buttonStyles';

type Variant = 'primary' | 'outline' | 'ghost' | 'inverse';
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
        buttonStyles({ variant, size, className }),
        disabled && 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:bg-brand-500 hover:text-ink',
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <ArrowRight
          size={size === 'sm' ? 16 : 18}
          strokeWidth={2}
          aria-hidden="true"
          className="transition-transform duration-300 ease-out group-hover:translate-x-1"
        />
      )}
    </button>
  );
}

interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  className,
  children,
  onClick,
  'aria-label': ariaLabel,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={ariaLabel}
      className={buttonStyles({ variant, size, className })}
    >
      {children}
      {showArrow && (
        <ArrowRight
          size={size === 'sm' ? 16 : 18}
          strokeWidth={2}
          aria-hidden="true"
          className="transition-transform duration-300 ease-out group-hover:translate-x-1"
        />
      )}
    </Link>
  );
}
