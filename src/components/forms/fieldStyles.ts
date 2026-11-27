export const inputBase =
  'w-full rounded-xl border bg-white px-4 py-3 text-base text-ink shadow-[inset_0_1px_0_rgba(22,21,15,.03)] transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint/80 hover:border-ink/40 focus:outline-none focus:ring-4';

export function inputBorder(invalid?: boolean): string {
  return invalid
    ? 'border-danger bg-danger-50/40 focus:border-danger focus:ring-danger/15'
    : 'border-cream-500 focus:border-rapid-600 focus:ring-rapid-500/15';
}
