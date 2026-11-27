import type { Config } from 'tailwindcss';

/**
 * RAPID design tokens. One identity, three families:
 *
 *  - rapid  deep RAPID green. Structure, headings on dark, links, focus.
 *  - sun    the one hot accent (Nigerian-sun orange). Primary actions and
 *           highlights only. Text on sun is always ink.
 *  - cream  warm paper neutrals for canvases, lines and quiet fills.
 *  - ink    near-black type in three strengths.
 *
 * Status colours (warn, danger) exist only for status chips and errors.
 * Contrast pairs are checked by scripts/contrast-audit.mjs.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rapid: {
          50: '#EEF6F1',
          100: '#D9ECE1',
          200: '#B3D9C4',
          300: '#82BFA0',
          400: '#4FA07C',
          500: '#1E8160',
          600: '#0A6A4C',
          700: '#075F45',
          800: '#0B4A37',
          900: '#0B3D2E',
          950: '#06291F',
        },
        sun: {
          50: '#FFF4EA',
          100: '#FFE4CC',
          200: '#FFC896',
          300: '#FFA85E',
          400: '#FF8E33',
          500: '#FF7A1A',
          600: '#E5650A',
          700: '#A94604',
        },
        cream: {
          50: '#FBF7EF',
          100: '#F4EDDF',
          200: '#E8DECB',
          300: '#D6C8AF',
          400: '#B9A88A',
          // Form-control borders: 3:1 against white and cream (WCAG 1.4.11).
          500: '#938872',
        },
        ink: {
          DEFAULT: '#16150F',
          soft: '#47443A',
          faint: '#625D50',
        },
        warn: { 50: '#FFF3D6', 700: '#7A4A00' },
        danger: { DEFAULT: '#B42318', 50: '#FEF0EE' },
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        display: ['"Bricolage Grotesque Variable"', '"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      maxWidth: { site: '1240px' },
      borderRadius: { card: '22px' },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(22,21,15,.05)',
        'elev-2': '0 1px 2px rgba(22,21,15,.04), 0 18px 40px -24px rgba(22,21,15,.28)',
        'elev-3': '0 2px 6px rgba(22,21,15,.06), 0 40px 80px -40px rgba(22,21,15,.45)',
        float: '0 2px 6px rgba(6,41,31,.12), 0 30px 70px -30px rgba(6,41,31,.55)',
        sun: '0 10px 26px -12px rgba(255,122,26,.7)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
