/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAF6EE', dark: '#F1EADB', deep: '#E7DDC8' },
        burgundy: { DEFAULT: '#8A0B45', dark: '#6B0836', light: '#A8195C' },
        gold: { DEFAULT: '#D39E57', dark: '#B8823D', light: '#EBCB9B' },
        ink: { DEFAULT: '#1B1517', soft: '#5C5256' },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(60, 30, 40, 0.18)',
        lift: '0 18px 40px -16px rgba(60, 30, 40, 0.30)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'fade-up': 'fadeUp 0.5s ease both',
      },
    },
  },
  plugins: [],
};
