/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14c9c5',
          50: '#e6fffe',
          100: '#c7f8f6',
          200: '#9cece9',
          300: '#67dedb',
          400: '#38d9d5',
          500: '#14c9c5',
          600: '#0eaaa7',
          700: '#0c8987',
          800: '#0b5e5d',
          900: '#073b3c',
        },
        secondary: '#7c6cf2',
        success: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
        },
        surface: '#0b1018',
        card: '#151a24',
        ink: '#f8fafc',
      },
      fontFamily: {
        display: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 35px -18px rgba(0,0,0,0.7)',
        card: '0 10px 30px -18px rgba(0,0,0,0.75)',
        glow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
        'glow-lg': '0 8px 32px -4px rgba(37, 99, 235, 0.25)',
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        wave: 'wave 1.2s ease-in-out infinite',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        pulseRing: 'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
