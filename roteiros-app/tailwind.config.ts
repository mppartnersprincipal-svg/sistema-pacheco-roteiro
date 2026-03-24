import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          orange: '#F97316',
          yellow: '#FACC15',
          dark: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          muted: '#64748B',
        }
      }
    },
  },
  plugins: [],
}
export default config
