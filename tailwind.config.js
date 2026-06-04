/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme — main backgrounds
        brandBg:      "#F8FAFC",
        brandSidebar: "#FFFFFF",
        brandTopBar:  "rgba(255, 255, 255, 0.9)",
        // Brand accent
        brandPrimary:   "#2563EB",
        brandSecondary: "#3B82F6",
        brandSuccess:   "#10B981",
        brandWarning:   "#F59E0B",
        brandDanger:    "#EF4444",
        // Text
        textPrimary:   "#0F172A",
        textSecondary: "#64748B",
        textMuted:     "#94A3B8",
        // Borders / surfaces
        borderColor:   "#E2E8F0",
        surfaceCard:   "#FFFFFF",
        surfaceBg:     "#F8FAFC",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-coral":   "linear-gradient(135deg, #2563EB, #3B82F6)",
        "gradient-red-soft": "linear-gradient(135deg, #EF4444, #F87171)",
      },
      boxShadow: {
        card:   "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)",
        "brand": "0 4px 14px rgba(37, 99, 235, 0.12)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        "pulse-slow":  "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "loading-bar": "loadingBar 1.5s infinite linear",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        loadingBar: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}
