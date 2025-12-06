module.exports = {
  content: [
    './app/views/**/*.{html,erb,haml}',
    './app/helpers/**/*.rb',
    './app/frontend/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        // Financial Editorial Brutalism color palette
        salmon: {
          light: '#FFE5D9',
          DEFAULT: '#FF9B85',
          dark: '#E6705A',
        },
        cream: '#FAF9F6',
        charcoal: '#1A1A1A',
        'near-black': '#0A0A0A',
        income: '#2D5016',
        expense: '#8B1E3F',
        gold: '#C5A572',
        navy: '#1E3A5F',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("daisyui")],
}
