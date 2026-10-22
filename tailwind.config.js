import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#2D55F0', dark: '#1F3BB8', light: '#E8EDFF', soft: '#C7D3FF' },
        gold: { DEFAULT: '#F5B700', dark: '#B98A00', light: '#FFF6D6' },
        leaf: { DEFAULT: '#16A34A', dark: '#0F7A36', light: '#DCFCE7' },
        rose: { DEFAULT: '#EF4444', dark: '#B91C1C', light: '#FEE2E2' },
        grape: { DEFAULT: '#7C3AED', dark: '#5B21B6', light: '#EDE9FE' },
        tang: { DEFAULT: '#EA580C', dark: '#B5420A', light: '#FFEDD5' },
        ink: { DEFAULT: '#1E293B', soft: '#475569', mute: '#64748B' },
        paper: '#F1F5F2',
        night: { DEFAULT: '#1E2A3D', card: '#283750', line: '#3A4B69', soft: '#A9B6CC' },
      },
      fontFamily: {
        display: ['Unbounded', 'Onest', 'system-ui', 'sans-serif'],
        sans: ['Onest', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,41,59,.06), 0 8px 24px -12px rgba(30,41,59,.18)',
        lift: '0 2px 4px rgba(30,41,59,.06), 0 16px 32px -14px rgba(30,41,59,.28)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.12)' }, '100%': { transform: 'scale(1)' } },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-7px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        zzz: { '0%': { opacity: 0, transform: 'translate(0,0) scale(.7)' }, '30%': { opacity: 1 }, '100%': { opacity: 0, transform: 'translate(10px,-22px) scale(1.1)' } },
      },
      animation: {
        pop: 'pop .35s ease-out',
        shake: 'shake .4s ease-in-out',
        floaty: 'floaty 3s ease-in-out infinite',
        zzz: 'zzz 2.4s ease-out infinite',
      },
    },
  },
  plugins: [
    plugin(({ addBase, addUtilities }) => {
      addBase({
        // Katta ekranlarda butun interfeys (rem) proporsional kattalashadi
        html: { WebkitTapHighlightColor: 'transparent', fontSize: '16px' },
        '@media (min-width: 768px)': { html: { fontSize: '17px' } },
        '@media (min-width: 1280px)': { html: { fontSize: '18px' } },
        body: {
          fontFamily: 'Onest, system-ui, sans-serif',
          color: '#1E293B',
          backgroundColor: '#F1F5F2',
          backgroundImage: 'radial-gradient(rgba(30,41,59,.07) 1px, transparent 1.2px)',
          backgroundSize: '20px 20px',
          minHeight: '100vh',
        },
        '.dark body': {
          color: '#E8EEF8',
          backgroundColor: '#1E2A3D',
          backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1.2px)',
        },
        ':focus-visible': { outline: '3px solid #2D55F0', outlineOffset: '2px', borderRadius: '12px' },
        '.dark :focus-visible': { outlineColor: '#8EA6FF' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.001ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      });
      addUtilities({
        '.preserve-3d': { transformStyle: 'preserve-3d' },
        '.perspective': { perspective: '1200px' },
        '.backface-hidden': { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' },
        '.rotate-y-180': { transform: 'rotateY(180deg)' },
        '.no-scrollbar': { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } },
        '.touch-none-all': { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' },
      });
    }),
  ],
};
