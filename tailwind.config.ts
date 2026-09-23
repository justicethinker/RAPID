import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dominant surface — a lifted navy, never near-black.
        navy: {
          50: '#F5F7F9',
          100: '#E8EDF1',
          200: '#CDD8E0',
          300: '#A8B8C4',
          400: '#7E93A4',
          500: '#5B7184',
          600: '#3E5468',
          700: '#2A3E52',
          800: '#182C3E',
          900: '#10202F',
          950: '#0B1826',
          line: '#22384D',
        },
        // Accent — reserved for the primary action and one key word.
        brand: {
          50: '#E6FBF3',
          100: '#C9F7E4',
          500: '#15E6A0',
          // 600/700 darkened to clear WCAG AA: 700 must hit 4.5:1 as small text on
          // brand-50/sand/white (was 4.03:1); 600 must hit 3:1 as focus border (was 2.7:1).
          600: '#0B9468',
          700: '#087A56',
        },
        // Warm neutral (secondary).
        sand: {
          50: '#FAF8F4',
          100: '#F3EEE6',
          200: '#E7DFD2',
          300: '#D6C9B6',
          400: '#C2B29A',
        },
        // Kept for compatibility; no longer used as a second accent in UI.
        teal: { 500: '#12C9D6' },
        mint: { 50: '#E6FBF3', 100: '#CFF5E6' },
        ink: '#101B26',
        paper: '#FAF8F4',
        'dark-text': '#E6EDF3',
        'dark-muted': '#9FB0BF',
        'light-muted': '#55636E',
        warn: { 50: '#FFF4D6', 900: '#5C4610' },
        danger: '#B42318',
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
        hand: ['Caveat', 'cursive'],
      },
      maxWidth: { site: '1160px' },
      borderRadius: { card: '20px', phone: '48px' },
      boxShadow: {
        // One elevation ladder, lit from above. Light surfaces.
        'elev-1': '0 1px 2px rgba(11,24,38,.05)',
        'elev-2': '0 2px 4px rgba(11,24,38,.05), 0 16px 36px -22px rgba(11,24,38,.3)',
        'elev-3': '0 8px 20px -8px rgba(11,24,38,.16), 0 40px 90px -40px rgba(11,24,38,.5)',
        // Dark surfaces communicate elevation with a lighter surface + a deep, soft shadow.
        'elev-2-dark': '0 1px 0 rgba(255,255,255,.04), 0 24px 55px -28px rgba(0,0,0,.65)',
        'elev-3-dark': '0 1px 0 rgba(255,255,255,.05), 0 48px 100px -48px rgba(0,0,0,.75)',
        // Accent shadow, used sparingly.
        accent: '0 8px 22px -14px rgba(21,230,160,.45)',
        'accent-hover': '0 12px 28px -14px rgba(21,230,160,.55)',
        // Legacy token names kept but softened to match the restrained system.
        'glow-btn': '0 8px 22px -14px rgba(21,230,160,.45)',
        'glow-btn-hover': '0 12px 28px -14px rgba(21,230,160,.55)',
        'glow-card': '0 30px 70px -38px rgba(0,0,0,.6), 0 0 40px rgba(21,230,160,.1)',
        'glow-phone': '0 0 0 1px #22384D, 0 30px 70px -30px rgba(0,0,0,.6)',
        'card-light': '0 1px 2px rgba(11,24,38,.04), 0 18px 40px -24px rgba(11,24,38,.22), 0 0 0 1px #E7DFD2',
        'card-light-float': '0 2px 6px rgba(11,24,38,.05), 0 34px 70px -40px rgba(11,24,38,.34), 0 0 0 1px #E7DFD2',
        'photo-float': '0 2px 6px rgba(11,24,38,.05), 0 44px 80px -50px rgba(11,24,38,.4)',
        'card-float': '0 2px 4px rgba(0,0,0,.3), 0 26px 55px -26px rgba(0,0,0,.62), 0 0 0 1px rgba(255,255,255,.08)',
      },
      backgroundImage: {
        // Single-hue accent. No second colour.
        'brand-btn': 'linear-gradient(180deg,#19F0A9,#0FD79A)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.4)', opacity: '.9' },
          '100%': { transform: 'scale(3.2)', opacity: '0' },
        },
        drawLine: { to: { strokeDashoffset: '0' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
