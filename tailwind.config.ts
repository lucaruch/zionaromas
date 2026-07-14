import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1180px"
      }
    },
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F5E7A3",
          deep: "#8C6A16"
        },
        ink: "#000000",
        porcelain: "#FFFFFF",
        pearl: "#F7F5EF",
        smoke: "#E7E0D0"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"]
      },
      boxShadow: {
        premium: "0 24px 70px rgba(0,0,0,.12)",
        gold: "0 14px 35px rgba(212,175,55,.22)"
      },
      backgroundImage: {
        "gold-metal": "linear-gradient(135deg,#8C6A16 0%,#D4AF37 32%,#FFF3B0 50%,#D4AF37 68%,#7A5B12 100%)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.7s linear infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
