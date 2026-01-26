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
        // Microsoft Azure colors
        azure: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0078D4', // Primary Azure Blue
          600: '#0066b8',
          700: '#00529c',
          800: '#003d80',
          900: '#002864',
        },
        // Microsoft Copilot gradient colors
        copilot: {
          purple: '#7B68EE',
          blue: '#0078D4',
          teal: '#00B294',
          pink: '#E91E63',
        },
        // SAP Colors
        sap: {
          gold: '#F0AB00',
          blue: '#0070F2',
          dark: '#354A5F',
          light: '#EDF2F7',
        },
        // Status colors
        success: '#107C10',
        warning: '#FFB900',
        error: '#D13438',
        processing: '#0078D4',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'typing': 'typing 1.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 120, 212, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 120, 212, 0.8)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
      },
      backgroundImage: {
        'copilot-gradient': 'linear-gradient(135deg, #7B68EE 0%, #0078D4 50%, #00B294 100%)',
        'azure-gradient': 'linear-gradient(135deg, #0078D4 0%, #00BCF2 100%)',
        'sap-gradient': 'linear-gradient(135deg, #0070F2 0%, #F0AB00 100%)',
      },
    },
  },
  plugins: [],
}
export default config
