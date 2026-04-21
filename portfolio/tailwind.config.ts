import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#070A13',
        neon: '#58F6D2',
        plasma: '#FF5ABF',
        arc: '#6AA6FF',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
        display: ['"Sora"', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(88, 246, 210, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        noise:
          'radial-gradient(circle at 20% 20%, rgba(88, 246, 210, 0.16), transparent 40%), radial-gradient(circle at 80% 10%, rgba(255, 90, 191, 0.18), transparent 42%), radial-gradient(circle at 70% 75%, rgba(106, 166, 255, 0.16), transparent 45%)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(88, 246, 210, 0.12)' },
          '50%': { boxShadow: '0 0 30px rgba(88, 246, 210, 0.4)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
