import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg: '#0A090D',
        surface: '#131219',
        border: '#2D2C3A',
        accent: '#D4A853',
        text: '#EDE9E0',
        muted: '#8D8899',
        dim: '#5C5768',
        success: '#5CB87A',
        error: '#E05252',
        warning: '#E0A830',
        info: '#6B9FE8',
      },
    },
  },
  plugins: [],
}

export default config
