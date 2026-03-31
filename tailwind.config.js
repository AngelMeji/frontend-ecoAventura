/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-primary': {
          50: '#f2fcf9',
          100: '#dcfce7', // Was lighter
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2E8B57', // Seagreen base
          600: '#1A4D2E', // Deep Jungle Green
          700: '#143C24',
          800: '#0F2E1B',
          900: '#064e3b',
        },
        'eco-secondary': {
          DEFAULT: '#D4A373', // Coffee/Earth
          hover: '#C58F5D',
          light: '#FAEBD7',
        },
        'eco-accent': {
          DEFAULT: '#E9C46A', // Sun/Gold
          hover: '#D4B05B',
          red: '#E76F51', // Tropical Flower
        },
        'eco-dark': '#1F2937',
        'eco-light': '#F9FAFB',
        'eco-paper': '#FAEDCD', // Soft yellow/paper for cards
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/src/assets/hero-bg.jpg')", // Example placeholder
        'jungle-gradient': "linear-gradient(to right bottom, #1A4D2E, #2E8B57)",
      },
    },
  },
  plugins: [],
}
