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
        // Studio: the warm paper system that now carries the public site.
        studio: {
          25: '#FFFFFF',
          50: '#F3F7F1',
          100: '#EAF1E9',
          200: '#D9E4DA',
          300: '#C3D3C7',
          400: '#A4B9A9',
          500: '#758C7B',
          // Dark enough for small print (captions, disclaimers) on studio-25/50.
          600: '#52665A',
        },
        // Oxblood: the proof accent. Findings, published evidence and the
        // moments that need to feel decided — never a second CTA colour.
        oxblood: {
          50: '#F1EEFA',
          100: '#E5DDF6',
          200: '#D0C2EB',
          500: '#6B4BA0',
          600: '#513779',
          700: '#402D61',
          800: '#302147',
          900: '#211631',
        },
        // Deep warm green replaces navy in the public product stage.
        forest: {
          50: '#EEF7F2',
          100: '#D6EDE1',
          200: '#A9D6C2',
          500: '#2F6B58',
          600: '#265244',
          700: '#1D3A30',
          800: '#162A23',
          900: '#12231F',
          950: '#0F1A1E',
          line: '#284238',
        },
        // Warm neutral (legacy name kept for the dashboard and forms).
        sand: {
          50: '#FAF8F1',
          100: '#F3EEE3',
          200: '#E6DED0',
          300: '#D5C7B4',
          400: '#C2B29A',
        },
        // Kept for compatibility; no longer used as a second accent in UI.
        teal: { 500: '#12C9D6' },
        // Green carries the RAPID identity: page washes use 25/50, borders and
        // accents 200/300, and text stays on brand-700 for contrast.
        mint: {
          25: '#F6FDFA',
          50: '#E6FBF3',
          100: '#CFF5E6',
          200: '#9BE8CC',
          300: '#6FD9B5',
        },
        ink: '#172D25',
        paper: '#FFFFFF',
        'dark-text': '#E8F0EA',
        'dark-muted': '#B3C2B8',
        'light-muted': '#4F5D55',
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
      maxWidth: { site: '1200px' },
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
        'card-light': '0 1px 2px rgba(18,26,30,.04), 0 18px 40px -24px rgba(18,26,30,.18), 0 0 0 1px #E3DCCF',
        'card-light-float': '0 2px 6px rgba(18,26,30,.05), 0 34px 70px -40px rgba(18,26,30,.3), 0 0 0 1px #E3DCCF',
        'photo-float': '0 2px 6px rgba(18,26,30,.05), 0 44px 80px -50px rgba(18,26,30,.38)',
        stage: '0 2px 4px rgba(18,26,30,.12), 0 40px 90px -48px rgba(18,26,30,.62)',
        'proof': '0 28px 60px -34px rgba(74,20,28,.65)',
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
