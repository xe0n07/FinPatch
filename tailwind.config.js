
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/frontend/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:          '#0A0805',
        card:        '#141210',
        'card-hover':'#1C1814',
        border:      '#1E1A14',
        accent:      '#F4927A',
        'accent-dark':'#E07B62',
        income:      '#22C55E',
        expense:     '#EF4444',
        muted:       '#5C5448',
        'text-primary':   '#F5F0EB',
        'text-secondary': '#8C8578',
      },
      fontFamily: { sans: ['Outfit', 'sans-serif'] },
    },
  },
  plugins: [],
};