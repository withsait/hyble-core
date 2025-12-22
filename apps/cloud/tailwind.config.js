const preset = require("@hyble/config/tailwind/preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override primary with cloud indigo color
        primary: preset.theme.extend.colors.cloud,
      },
    },
  },
};
