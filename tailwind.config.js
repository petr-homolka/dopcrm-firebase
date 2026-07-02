/** @type {import('tailwindcss').Config} */
// Tokeny 1:1 podle DESIGN.md §2-4 ("Přítomnost" design systém).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDF6F5',
          100: '#D7EAE7',
          600: '#1A6B64',
          700: '#14544F',
          900: '#0F3D3A',
        },
        entity: {
          family: { text: '#15803D', bg: '#F0FDF4' },
          ospod: { text: '#1D4ED8', bg: '#EFF6FF' },
          court: { text: '#44403C', bg: '#F5F5F4' },
          bio: { text: '#B45309', bg: '#FFFBEB' },
          crisis: { text: '#C2410C', bg: '#FFF7ED' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        lg: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
