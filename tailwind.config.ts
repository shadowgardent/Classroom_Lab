import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f9ff',
          100: '#e0f2ff',
          200: '#b9e5ff',
          300: '#81d0ff',
          400: '#3ab5ff',
          500: '#0094f0',
          600: '#0074cc',
          700: '#005ba7',
          800: '#004785',
          900: '#003a6c'
        }
      }
    }
  },
  plugins: []
};

export default config;