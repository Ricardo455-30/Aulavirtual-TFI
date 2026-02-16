/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B5ED7",
        primaryDark: "#084298",
        graySoft: "#E5E7EB",
        dark: "#0F172A",
      },
      boxShadow: {
        card: "0 20px 40px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
