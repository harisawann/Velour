/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory:   '#F9F6F1',
        'ivory-dark': '#F0EBE3',
        bone:    '#E8E1D6',
        walnut:  '#1C1814',
        'walnut-mid': '#2E2820',
        'walnut-light': '#4A3F35',
        stone:   '#7A7268',
        'stone-light': '#A09890',
        gold:    '#C4954A',
        'gold-light': '#D4AE72',
        'gold-pale': '#F0E4CC',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        ui:      ['"Jost"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1300px',
      },
      height: {
        nav: '64px',
      },
    },
  },
  plugins: [],
}
