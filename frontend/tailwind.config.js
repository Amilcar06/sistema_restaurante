/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Orange - Brand Colors
        primary: {
          DEFAULT: "#FF6B35",
          light: "#FF8557",
          dark: "#E85A24",
          foreground: "#FFFFFF",
        },

        // Accent Orange
        accent: {
          DEFAULT: "#FFA372",
          foreground: "#0A0F1E",
          orange: "#FFA372",
          'orange-glow': "rgba(255, 107, 53, 0.2)",
          'orange-subtle': "rgba(255, 107, 53, 0.1)",
        },

        // State Colors
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          foreground: "#0A0F1E",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#06B6D4",
          light: "#22D3EE",
          dark: "#0891B2",
          foreground: "#FFFFFF",
        },

        // Tech Blue (Secondary)
        secondary: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
          foreground: "#FFFFFF",
        },

        // Background Colors
        background: {
          DEFAULT: "#0F1629",
          darker: "#0A0F1E",
          medium: "#1A2235",
          light: "#253045",
          lighter: "#2F3B56",
        },

        // Card and Surface Colors
        card: {
          DEFAULT: "#253045",
          foreground: "#FFFFFF",
        },

        // Border Colors
        border: {
          DEFAULT: "#2F3B56",
          dark: "#1A2235",
          medium: "#2F3B56",
          light: "#3F4D6B",
          orange: "rgba(255, 107, 53, 0.2)",
        },

        // Text Colors
        foreground: {
          DEFAULT: "#FFFFFF",
          secondary: "#E5E7EB",
          tertiary: "#9CA3AF",
          muted: "#6B7280",
        },

        // Muted (for less emphasis)
        muted: {
          DEFAULT: "#2F3B56",
          foreground: "#9CA3AF",
        },

        // Popover
        popover: {
          DEFAULT: "#253045",
          foreground: "#FFFFFF",
        },

        // Input
        input: {
          DEFAULT: "#1A2235",
          foreground: "#FFFFFF",
        },

        // Ring (focus)
        ring: {
          DEFAULT: "#FF6B35",
        },

        // Surface tints
        surface: {
          'orange-subtle': "rgba(255, 107, 53, 0.05)",
          'orange-light': "rgba(255, 107, 53, 0.1)",
          'orange-medium': "rgba(255, 107, 53, 0.15)",
          'blue-subtle': "rgba(59, 130, 246, 0.05)",
          'green-subtle': "rgba(16, 185, 129, 0.05)",
        },

        // Chart colors
        chart: {
          1: "#FF6B35",
          2: "#3B82F6",
          3: "#10B981",
          4: "#06B6D4",
          5: "#F59E0B",
        },
      },

      // Box shadow with orange glow
      boxShadow: {
        'glow-sm': '0 0 12px rgba(255, 107, 53, 0.2)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.2)',
        'glow-lg': '0 0 30px rgba(255, 107, 53, 0.3)',
      },

      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
