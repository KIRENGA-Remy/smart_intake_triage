/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens -> CSS variables (switch with [data-theme]).
        bgmain: "var(--bg-main)",
        sidebar: "var(--bg-sidebar)",
        inputbg: "var(--bg-input)",
        elevated: "var(--bg-elevated)",
        line: "var(--border)",
        linestrong: "var(--border-strong)",
        accent: "var(--accent)",
        accent2: "var(--accent2)",
        tprimary: "var(--text-primary)",
        tsecondary: "var(--text-secondary)",
        tmuted: "var(--text-muted)",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: { chat: "740px" },
      keyframes: {
        blink: { "0%,80%,100%": { opacity: "0.25" }, "40%": { opacity: "1" } },
      },
      animation: { blink: "blink 1.2s infinite both" },
    },
  },
  plugins: [],
};
