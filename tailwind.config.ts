import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Arka planlar
        background: "#050505",
        surface: "#0A0A0A",
        border: "#1F1F1F",

        // Metin renkleri
        foreground: "#EDEDED",
        muted: "#A1A1AA",

        // Markalar
        primary: {
          DEFAULT: "#CCFF00",
          hover: "#B3E600",
        },
        secondary: {
          DEFAULT: "#00E5FF",
        },
        accent: {
          DEFAULT: "#FF8A00",
        },

        // Minecraft teması
        minecraft: {
          grass: "#7CB342",
          dirt: "#8B6914",
          stone: "#7D7D7D",
          diamond: "#4DD0E1",
          emerald: "#50C878",
          gold: "#FFD700",
          creeper: "#4CAF50",
        },
      },
      fontFamily: {
        sans: ['var(--font-space)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #202020 1px, transparent 1px), linear-gradient(to bottom, #202020 1px, transparent 1px)",
        'grid-pattern-light': "linear-gradient(to right, #E5E7EB 1px, transparent 1px), linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)",
      },
      boxShadow: {
        'neon': '0 0 30px -5px rgba(204, 255, 0, 0.15)',
        'neon-strong': '0 0 50px -5px rgba(204, 255, 0, 0.3)',
        'minecraft': '0 0 30px -5px rgba(76, 175, 80, 0.3)',
      },
      animation: {
        'scroll': 'scroll 30s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pixel-float': 'pixelFloat 3s ease-in-out infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(204, 255, 0, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(204, 255, 0, 0.4)' },
        },
        pixelFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-5px) rotate(2deg)' },
          '75%': { transform: 'translateY(5px) rotate(-2deg)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
