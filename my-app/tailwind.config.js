/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Mirrors src/theme/tokens.ts — keep both in sync when changing a color.
      colors: {
        brand: {
          primary: "#0B3B24",
          "primary-dark": "#082A19",
          accent: "#F58220",
          "accent-dark": "#8A3B00",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F4F0",
          app: "#FDFBF7",
        },
        border: "#E7E5DF",
        ink: {
          primary: "#1A2420",
          secondary: "#5B6660",
          muted: "#8A938D",
        },
        state: {
          success: "#1E7A3D",
          "success-bg": "#E5F3EA",
          warning: "#B4700A",
          "warning-bg": "#FDF0DD",
          danger: "#B3261E",
          "danger-bg": "#FBE9E7",
          info: "#1E5FB4",
          "info-bg": "#E8F0FC",
        },
      },
      fontFamily: {
        sans: ["NotoSans_400Regular"],
        "sans-medium": ["NotoSans_500Medium"],
        "sans-bold": ["NotoSans_700Bold"],
        telugu: ["NotoSansTelugu_400Regular"],
        "telugu-bold": ["NotoSansTelugu_700Bold"],
        hindi: ["NotoSansDevanagari_400Regular"],
        "hindi-bold": ["NotoSansDevanagari_700Bold"],
      },
    },
  },
  plugins: [],
}
