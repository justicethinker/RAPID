import { useId } from 'react';

type Style = 'braids' | 'short' | 'cap' | 'fila';
type Preset = {
  skin: string;
  hair: string;
  cloth: string;
  bg: [string, string];
  style: Style;
  glasses?: boolean;
  headphones?: boolean;
  long?: boolean;
};

export const PRESETS = {
  A: { skin: '#7B4A2F', hair: '#1A1210', cloth: 'ankara', bg: ['#0B6B63', '#15E6A0'], style: 'braids' },
  B: { skin: '#6A3E25', hair: '#120C0A', cloth: '#1E5C4C', bg: ['#123A56', '#12B5C4'], style: 'short', glasses: true },
  C: { skin: '#8A5738', hair: '#1A1210', cloth: '#F2E6D8', bg: ['#1C5A4F', '#3FD9B0'], style: 'braids', long: true },
  D: { skin: '#5D3520', hair: '#120C0A', cloth: '#1A2530', bg: ['#123047', '#3B6FB5'], style: 'cap', glasses: true, headphones: true },
  E: { skin: '#7B4A2F', hair: '#120C0A', cloth: '#F5F5F0', bg: ['#0E4A5E', '#15E6A0'], style: 'fila', glasses: true },
  F: { skin: '#74442B', hair: '#120C0A', cloth: '#141C24', bg: ['#1F3A66', '#7A6BE0'], style: 'braids', long: true, headphones: true },
  G: { skin: '#6E4028', hair: '#120C0A', cloth: '#1F6F55', bg: ['#0F3B46', '#15E6A0'], style: 'short', headphones: true },
} as const satisfies Record<string, Preset>;

export type AvatarVariant = keyof typeof PRESETS;

export function Avatar({
  variant,
  className,
}: {
  variant: AvatarVariant;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const p: Preset = PRESETS[variant]!;
  const fill = p.cloth === 'ankara' ? `url(#${uid}p)` : p.cloth;

  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg[0]} />
          <stop offset="1" stopColor={p.bg[1]} />
        </linearGradient>
        {p.cloth === 'ankara' && (
          <pattern id={`${uid}p`} width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#E8792B" />
            <circle cx="10" cy="10" r="6" fill="#1B3F8B" />
            <circle cx="10" cy="10" r="2.4" fill="#F5C518" />
            <path d="M0 0l4 4M20 20l-4-4" stroke="#fff" strokeWidth="1.4" />
          </pattern>
        )}
      </defs>
      <rect width="200" height="200" fill={`url(#${uid}g)`} />
      <circle cx="160" cy="34" r="64" fill="#fff" opacity=".09" />
      <circle cx="30" cy="170" r="50" fill="#fff" opacity=".06" />
      {p.style === 'braids' && (
        <>
          <ellipse cx="100" cy="88" rx="47" ry="53" fill={p.hair} />
          <rect x={p.long ? 52 : 55} y="86" width={p.long ? 15 : 12} height={p.long ? 74 : 46} rx="7" fill={p.hair} />
          <rect x="133" y="86" width={p.long ? 15 : 12} height={p.long ? 74 : 46} rx="7" fill={p.hair} />
        </>
      )}
      <path d="M20 205 C20 158 62 142 100 142 C138 142 180 158 180 205Z" fill={fill} />
      <rect x="87" y="116" width="26" height="32" rx="11" fill={p.skin} />
      <path d="M78 145 Q100 168 122 145 L118 140 Q100 152 82 140Z" fill={p.skin} />
      <circle cx="67" cy="96" r="6.5" fill={p.skin} />
      <circle cx="133" cy="96" r="6.5" fill={p.skin} />
      <ellipse cx="100" cy="92" rx="33" ry="39" fill={p.skin} />
      {p.style === 'braids' && (
        <path d="M65 90 C60 46 140 46 135 90 C128 66 72 66 65 90Z" fill={p.hair} />
      )}
      {p.style === 'short' && (
        <path d="M67 84 C65 50 135 50 133 84 C126 68 74 68 67 84Z" fill={p.hair} />
      )}
      {p.style === 'cap' && (
        <>
          <path d="M64 80 C64 46 136 46 136 80Z" fill="#232B33" />
          <rect x="60" y="76" width="80" height="8" rx="4" fill="#232B33" />
          <rect x="112" y="76" width="38" height="8" rx="4" fill="#33404B" />
        </>
      )}
      {p.style === 'fila' && (
        <>
          <path d="M66 78 C66 52 134 52 134 78Z" fill="#EFE6D2" />
          <rect x="63" y="72" width="74" height="10" rx="5" fill="#E0D5BC" />
        </>
      )}
      {p.headphones && (
        <>
          <path d="M64 92 C60 38 140 38 136 92" fill="none" stroke="#10161C" strokeWidth="6" strokeLinecap="round" />
          <rect x="57" y="86" width="13" height="26" rx="6.5" fill="#10161C" />
          <rect x="130" y="86" width="13" height="26" rx="6.5" fill="#10161C" />
        </>
      )}
      <circle cx="87" cy="93" r="3.3" fill="#1a1210" />
      <circle cx="113" cy="93" r="3.3" fill="#1a1210" />
      <path d="M80 84 Q87 80 94 84M106 84 Q113 80 120 84" stroke={p.hair} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M100 97 Q96 105 101 106" stroke="rgba(0,0,0,.28)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M86 109 Q100 124 114 109Z" fill="#fff" stroke="#3a1c10" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="80" cy="106" rx="6" ry="4" fill="#ff8a6b" opacity=".18" />
      <ellipse cx="120" cy="106" rx="6" ry="4" fill="#ff8a6b" opacity=".18" />
      {p.glasses && (
        <g fill="none" stroke="#111" strokeWidth="2.4">
          <circle cx="87" cy="93" r="10.5" />
          <circle cx="113" cy="93" r="10.5" />
          <path d="M97.5 93h5" />
        </g>
      )}
    </svg>
  );
}
