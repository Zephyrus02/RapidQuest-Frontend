/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "wa-green": "#00a884",
        "wa-green-dark": "#005c4b",
        "wa-bg-dark": "#111b21",
        "wa-panel-bg-dark": "#202c33",
        "wa-text-dark": "#e9edef",
        "wa-text-secondary-dark": "#8696a0",
        "wa-panel-header-icon-dark": "#aebac1",
        "wa-message-bg-dark": "#202c33",
        "wa-hover-dark": "#2a3942",
        "wa-border-dark": "#2a3942",
        "wa-chat-bg-dark": "#0b141a",
        "wa-read-receipt-dark": "#53bdeb",
      },
    },
  },
  plugins: [],
};
