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
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
