import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ARKA PLANLAR
        background: "#050505", 
        surface: "#0A0A0A",    
        border: "#1F1F1F",     

        // METİN RENKLERİ
        foreground: "#EDEDED", 
        muted: "#A1A1AA",      

        // MARKALAR
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
      },
      fontFamily: {
        sans: ['var(--font-space)', 'sans-serif'], 
        body: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #202020 1px, transparent 1px), linear-gradient(to bottom, #202020 1px, transparent 1px)",
      },
      boxShadow: {
        'neon': '0 0 30px -5px rgba(204, 255, 0, 0.15)',
      },
      // İŞTE EKSİK OLAN KISIM BURASIYDI 👇
      animation: {
        'scroll': 'scroll 30s linear infinite', // Sonsuz kayma ayarı
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }, // Yarısına kadar kaydırıp başa sarar
        }
      }
    },
  },
  plugins: [],
};
export default config;