import { createElement, type ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/cn';

type RevealTag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'p' | 'span' | 'h2' | 'h3';

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: RevealTag;
  /** Extra delay in ms, for a hand-tuned sequence. */
  delay?: number;
  /** Animate each direct child in turn instead of the wrapper itself. */
  stagger?: boolean;
}

/**
 * Reveals content once it first enters the viewport. The element renders
 * normally when motion is reduced, because the hidden state lives behind
 * `prefers-reduced-motion: no-preference`.
 */
export function Reveal({
  children,
  className,
  as = 'div',
  delay = 0,
  stagger = false,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return createElement(
    as,
    {
      ref,
      className: cn(stagger ? 'stagger' : 'reveal', inView && 'is-visible', className),
      style: !stagger && delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}

export function Stagger({
  children,
  className,
  as = 'div',
}: Pick<RevealProps, 'children' | 'className' | 'as'>) {
  return (
    <Reveal as={as} stagger className={className}>
      {children}
    </Reveal>
  );
}
