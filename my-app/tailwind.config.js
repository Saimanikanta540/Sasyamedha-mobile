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
      },
    },
  },
  plugins: [],
}
