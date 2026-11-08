/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#F8FAFC',
        'navy-dark': '#F1F5F9',
        'navy-card': '#FFFFFF',
        'electric-blue': '#2563EB',
        'cyan-accent': '#0284C7',
        'red-primary': '#2563EB',
        'rose-accent': '#3B82F6',
        'soft-canvas': '#F8FAFC',
        'soft-surface': '#FFFFFF',
        'soft-blue-50': '#EFF6FF',
        'soft-blue-100': '#DBEAFE',
        'soft-blue-200': '#BFDBFE',
        'soft-blue-600': '#2563EB',
        'soft-blue-700': '#1D4ED8',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
