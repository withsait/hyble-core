/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Ana Marka Rengi - Emerald/Yeşil (Gaming)
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // Arka Planlar - Koyu tema (Gaming)
        background: {
          primary: "#0F172A",
          secondary: "#1E293B",
          tertiary: "#334155",
        },
        // Metin Renkleri
        foreground: {
          primary: "#F1F5F9",
          secondary: "#CBD5E1",
          muted: "#64748B",
        },
        // Kenarlıklar
        border: {
          DEFAULT: "#334155",
          light: "#475569",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        grid: "grid 20s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #10B981, 0 0 10px #10B981, 0 0 15px #10B981" },
          "100%": { boxShadow: "0 0 10px #10B981, 0 0 20px #10B981, 0 0 30px #10B981" },
        },
        grid: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
