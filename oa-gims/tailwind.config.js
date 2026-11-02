/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07070d',
        coal: '#0c0c16',
        panel: '#12121f',
        line: 'rgba(255,215,130,0.14)',
        gold: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#fce588',
          300: '#fadb5f',
          400: '#f7c948',
          500: '#e0a82e',
          600: '#c98a1b',
          700: '#a36b12',
          800: '#7d510e',
          900: '#57380a',
        },
        aurum: {
          DEFAULT: '#e6b64c',
          soft: '#f5d78a',
          deep: '#8a6a1f',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(230,182,76,0.45)',
        card: '0 20px 60px -20px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'gold-radial': 'radial-gradient(circle at 30% 20%, rgba(230,182,76,0.18), transparent 55%)',
        'hero-fade': 'linear-gradient(to bottom, rgba(7,7,13,0.2), rgba(7,7,13,0.85))',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        pulseGlow: {
          '0%,100%': { opacity: 0.55 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
