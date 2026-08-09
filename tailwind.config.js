/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0B0507',
        'navy-dark': '#14080B',
        'navy-card': '#1C0D11',
        'electric-blue': '#EF4444',
        'cyan-accent': '#FF3366',
        'red-primary': '#DC2626',
        'rose-accent': '#F43F5E',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
