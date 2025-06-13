// =================================================================
// ============== ARQUIVO: tailwind.config.js ======================
// =================================================================
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f', 
        surface: '#12121c',   
        primary: '#39FF14', 
        accent: '#A044FF',  
        'text-main': '#e2e8f0',
        'text-secondary': '#8b949e',
        'orange-neon': '#FF9500',
        'cyan-neon': '#22D3EE', // Nova cor para o botão "Todos"
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(57, 255, 20, 0.4)',
        'glow-accent': '0 0 15px rgba(160, 68, 255, 0.4)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}