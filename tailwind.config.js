/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F6FFF", // 토스 블루
        secondary: "#F8F9FA",
        'toss-blue-light': '#EBF4FF',
        'toss-blue': '#0F6FFF',
        'toss-blue-dark': '#0051D4',
        'toss-error': '#FF4E4E',
        'toss-gray-light': '#F0F1F2',
        'toss-gray': '#D9DBE0',
        'toss-gray-dark': '#999999',
        'toss-black': '#333333',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'toss': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};