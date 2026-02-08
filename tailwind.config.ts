import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          DEFAULT: "#0a0a1a",
          secondary: "#0f0f23",
          tertiary: "#141432",
          card: "rgba(26, 26, 58, 0.8)",
        },
        // Gold accent colors
        gold: {
          DEFAULT: "#D2AC47",
          light: "#EDC967",
          lighter: "#F7EF8A",
          dark: "#AE8625",
          muted: "rgba(210, 172, 71, 0.2)",
        },
        // Text colors
        text: {
          primary: "#ffffff",
          secondary: "#a0a0b8",
          muted: "#6b6b80",
        },
        // Status colors
        status: {
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
        // Pipeline stage colors
        pipeline: {
          new: "#3b82f6",
          contacted: "#8b5cf6",
          qualified: "#f59e0b",
          proposal: "#ec4899",
          negotiation: "#14b8a6",
          won: "#22c55e",
          lost: "#6b7280",
        },
        // Sidebar colors
        sidebar: {
          DEFAULT: "#0f0f23",
          hover: "#1a1a3a",
          active: "rgba(210, 172, 71, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(210, 172, 71, 0.3)",
        "glow-sm": "0 0 10px rgba(210, 172, 71, 0.2)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-gold":
          "linear-gradient(135deg, #AE8625 0%, #D2AC47 25%, #F7EF8A 50%, #EDC967 75%, #AE8625 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #0a0a1a 0%, #141432 100%)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "pulse-gold": "pulseGold 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(210, 172, 71, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(210, 172, 71, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
