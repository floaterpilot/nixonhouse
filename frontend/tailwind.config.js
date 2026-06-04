/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#080e1d',
        'navy-light': '#0f1a2e',
        'navy-card': '#111827',
        amber: '#f59e0b',
        'cubs-blue': '#0e3386',
        'cubs-red': '#cc3433',
        'wrigley-green': '#1a3d1a',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      }
    }
  },
  plugins: []
};
