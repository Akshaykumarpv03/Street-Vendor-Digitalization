/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // README §6.2 — exact hex values
      colors: {
        teal:       { DEFAULT: "#0F5C57", light: "#1a7a73", dark: "#0a3d39" },
        amber:      { DEFAULT: "#E8A33D", light: "#f0b860", dark: "#c4872a" },
        charcoal:   "#1F2937",
        slate:      "#6B7280",
        cream:      "#FAF7F2",
        surface:    "#FFFFFF",
        sand:       "#F0EBE1",
        terracotta: "#C4623E",
        success:    "#4B8B6F",
        error:      "#B84C3E",
        info:       "#5A7A8C",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
