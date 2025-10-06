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
          50: '#fdf8f4',
          100: '#f9efe4',
          200: '#f2dfca',
          300: '#e3c4a6',
          400: '#d1a679',
          500: '#b88552',
          600: '#9c6a3e',
          700: '#7e5333',
          800: '#65422b',
          900: '#533524'
        },
        sand: {
          50: '#fdfbf8',
          100: '#f8f3ec',
          200: '#efe2d1',
          300: '#e0cbb0',
          400: '#caa37d',
          500: '#a97952',
          600: '#8e5f3f',
          700: '#704830',
          800: '#573927',
          900: '#452f21'
        },
        cocoa: {
          50: '#faf6f1',
          100: '#ede2d3',
          200: '#dac3a9',
          300: '#c3a07d',
          400: '#a87b55',
          500: '#8b5e3c',
          600: '#6f472d',
          700: '#583624',
          800: '#43271b',
          900: '#2e1a12'
        }
      },
      boxShadow: {
        soft: '0 10px 40px -25px rgba(139, 94, 60, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;
