export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0d3227',
          deep: '#082019',
          mid: '#14493a',
        },
        lime: {
          DEFAULT: '#b6f14b',
          soft: '#d7f99a',
          dark: '#8ac72f',
        },
        cream: '#f6f5ec',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
