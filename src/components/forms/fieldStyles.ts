export const inputBase =
  'w-full rounded-xl border bg-studio-25 px-4 py-3 text-base text-ink transition-colors duration-200 placeholder:text-light-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-500/25';

export function inputBorder(invalid?: boolean): string {
  return invalid
    ? 'border-danger focus:border-danger focus:ring-red-100'
    : 'border-studio-300 focus:border-brand-700';
}

