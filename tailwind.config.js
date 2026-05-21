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
        fadeUp: { from: { opacity: 0, transform: "translateY(30px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        glow: { "0%, 100%": { opacity: 0.4 }, "50%": { opacity: 0.8 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        orbit: { "0%": { transform: "rotate(0deg) translateX(60px) rotate(0deg)" }, "100%": { transform: "rotate(360deg) translateX(60px) rotate(-360deg)" } },
        pulse2: { "0%, 100%": { opacity: 0.6, transform: "scale(1)" }, "50%": { opacity: 1, transform: "scale(1.05)" } },
        typewriter: { from: { width: "0" }, to: { width: "100%" } },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
        fadeUp: "fadeUp 0.7s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        orbit: "orbit 8s linear infinite",
        pulse2: "pulse2 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
