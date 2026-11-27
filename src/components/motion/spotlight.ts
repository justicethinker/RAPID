import type { PointerEvent } from 'react';

/**
 * Moves the `.spotlight` radial glow to the pointer. Pair with the
 * `spotlight` utility class; without pointer movement the CSS fallback keeps a
 * soft wash in the corner.
 */
export function useSpotlight() {
  return (event: PointerEvent<HTMLElement>) => {
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    node.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };
}
