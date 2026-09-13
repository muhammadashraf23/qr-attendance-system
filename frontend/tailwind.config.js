/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#4F46E5', // Indigo-600
          primaryHover: '#4338CA', // Indigo-700
          secondary: '#06B6D4', // Cyan-500
          emerald:   '#10B981', // Emerald-500
          accent:    '#F43F5E', // Rose-500
          light:     '#EEF2FF', // Indigo-50
          dark:      '#0F172A', // Slate-900
          surface:   '#1E293B', // Slate-800
          primary:   '#000000',
          primaryHover: '#18181b',
          secondary: '#27272a',
          emerald:   '#10B981',
          accent:    '#000000',
          light:     '#f4f4f5',
          dark:      '#000000',
          surface:   '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
