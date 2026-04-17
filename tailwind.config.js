/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: '#00C896',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F3',
          tertiary: '#EBEBEA',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          secondary: '#141414',
          tertiary: '#1E1E1E',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          secondary: '#6B6B6A',
          tertiary: '#888780',
        },
        border: {
          light: '#E8E8E6',
          dark: '#2A2A2A',
        },
      },
    },
  },
  plugins: [],
};
