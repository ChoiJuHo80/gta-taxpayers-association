import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gta: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0055b8', // GTA Taxpayers Primary Blue
          600: '#004396',
          700: '#003478',
          800: '#002558',
          900: '#001a40',
          accent: '#d97706', // Gold Accent
        },
      },
    },
  },
  plugins: [],
};
export default config;
