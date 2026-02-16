/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: "#1E1E2E",
        bgSidebar: "#181825",
        bgPanel: "#24243A",
        accent: "#7AA2F7",
        muted: "#A9B1D6",
        border: "rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};