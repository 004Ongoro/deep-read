import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#bd4131", 
          light: "#d66355",
          dark: "#8a2f24",
        },
        background: "#fdfcfb",
      },
    },
  },
  plugins: [],
};
export default config;