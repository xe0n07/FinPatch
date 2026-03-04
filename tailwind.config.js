/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/frontend/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0805',
        card: '#1C1610',
        'card-hover': '#251D14',
        border: '#2E2318',
        accent: '#F4927A',
        'accent-dark': '#E07B62',
        income: '#22C55E',
        expense: '#EF4444',
        muted: '#6B6558',
        'text-primary': '#F5F0EB',
        'text-secondary': '#9C9085',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};