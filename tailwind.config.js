/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
        },
        secondary: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          lighter: '#E2E8F0',
        },
        background: {
          light: '#E8F1FF',
          lighter: '#F5F9FF',
        }
      }
    }
  },
  plugins: [
    forms,
  ],
};