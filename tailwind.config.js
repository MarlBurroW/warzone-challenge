/** @type {import('tailwindcss').Config} */
import { colors } from "tailwindcss/defaultTheme";

module.exports = {
  content: ["./imports/ui/**/*.{vue,js,ts,jsx,tsx}", "./client/*.html"],
  theme: {
    extend: {
      colors: {
        primary: colors.red,
      },
    },
  },
  plugins: [],
};
