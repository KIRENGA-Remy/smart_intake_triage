/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Sampled from the MineTech site.
        cream: "#F4F1EC",
        ink: "#2E1F16",
        muted: "#6B5D52",
        coffee: { DEFAULT: "#3D2B1F", deep: "#2A1B12" },
        gold: { DEFAULT: "#B8935A", soft: "#C9A86A" },
        cta: "#6B4423",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(46,31,22,0.06), 0 8px 24px -12px rgba(46,31,22,0.18)",
      },
    },
  },
  plugins: [],
};
