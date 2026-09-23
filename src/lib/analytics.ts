const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

export function trackEvent(name: string, props?: Record<string, string>): void {
  if (!domain) return;
  try {
    // Plausible custom events API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plausible = (window as any)['plausible'] as
      | ((name: string, options: { props: Record<string, string> }) => void)
      | undefined;
    if (plausible) {
      plausible(name, { props: props ?? {} });
    }
  } catch {
    // Silently ignore analytics errors
  }
}
