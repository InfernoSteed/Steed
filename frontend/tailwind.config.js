/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '376px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        theme: {
          bg: 'var(--theme-bg)',
          panel: 'var(--theme-panel)',
          surface: 'var(--theme-surface)',
          border: 'var(--theme-border)',
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          text: 'var(--theme-text)',
          'text-muted': 'var(--theme-text-muted)',
          'text-highlight': 'var(--theme-text-highlight)',
          danger: 'var(--theme-danger)',
          success: 'var(--theme-success)',
          warning: 'var(--theme-warning)',
          info: 'var(--theme-info)'
        }
      },
      transitionTimingFunction: {
        'pro': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'elevation-1': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'elevation-3': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'elevation-4': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      }
    }
  },
  plugins: [],
}
