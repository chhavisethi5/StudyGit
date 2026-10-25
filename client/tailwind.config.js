/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        git: {
          bg: '#ffffff',
          surface: '#ffffff',
          canvas: '#f6f8fa',
          border: '#d0d7de',
          borderMuted: '#e1e4e8',
          text: '#1f2328',
          textMuted: '#656d76',
          textSubtle: '#8c959f',
          // Primary Action & Positive (Green)
          green: '#1f883d',
          greenHover: '#1a7f37',
          greenSubtle: '#dafbe1',
          greenText: '#1a7f37',
          // Informational & Active Navigation (Muted Indigo)
          indigo: '#5967d8',
          indigoHover: '#4956c7',
          indigoSubtle: '#eef0fd',
          indigoText: '#3b47a8',
          // Warnings & Pending States (Amber)
          amber: '#bf8700',
          amberHover: '#9e6a03',
          amberSubtle: '#fff8c5',
          amberText: '#7d4e00',
          // Critical & Negative (Red)
          red: '#cf222e',
          redSubtle: '#ffebe9',
          redText: '#a40e26',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans"',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
