/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens:{
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },
    extend: {
      colors:{
        custom:{
          darkRed: '#8c181b',
          textBlue: '#002839',
          blue: '#586AEA',
          inactiveBlue: 'rgba(88, 106, 234, 0.9)',
          textBlack: '#1E293B',
          textGrey: '#64748B',
          borderGrey: '#E2E8F0'
        }
      },
      fontFamily:{
        'asenpro':['Asen Pro','sans-serif']
      },
      boxShadow: {
        'all-sides': '0 5px 15px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

