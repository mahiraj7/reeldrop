/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#FBFBFD",
          subtle: "#F5F5F7",
          border: "#E5E5EA",
          blue: "#0071E3",
          hover: "#0077ED",
          text: "#1D1D1F",
          secondary: "#86868B"
        }
      }
    },
  },
  plugins: [],
}