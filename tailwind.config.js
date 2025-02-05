/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#00A3E1',
        'sidebar-blue': '#00A3E1',
        'hover-blue': '#0088C2',
        'light-blue': '#E6F3F9',
        'table-header-bg': '#F8FBFD',
        'table-border': '#E0E0E0',
      },
      boxShadow: {
        'custom-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'custom': '8px',
      },
    },
  },
  plugins: [],
}