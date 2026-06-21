/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#6366F1",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
        },
        background: "#0F172A",
        surface: {
          DEFAULT: "#111827",
          card: "#1F2937",
          light: "#374151",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 20px rgba(79, 70, 229, 0.3)",
        purpleGlow: "0 0 20px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [],
}
