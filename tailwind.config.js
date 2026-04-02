/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f1115',
          800: '#16191f',
          700: '#1d2128',
          600: '#262a33',
        },
        brand: {
          red: '#f84f31',
          orange: '#fc7f3c',
          green: '#23c179',
          blue: '#1e88e5',
          purple: '#8b5cf6',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
