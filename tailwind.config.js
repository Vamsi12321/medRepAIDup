/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: { from: { opacity: 0, transform: "translateX(100%)" }, to: { opacity: 1, transform: "translateX(0)" } },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
}
