const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        heading: ['Inter', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans]
      },
      colors: {
        // AgentOS Dashboard Color Palette
        primary: '#3B82F6',
        background: '#0F172A',
        'card-bg': '#1E293B',
        'text-primary': '#FFFFFF',
        'text-secondary': '#E5E7EB',
        'accent-green': '#22C55E',
        'border-light': '#334155',
        
        // Status colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      boxShadow: {
        'agentos': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'agentos-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'agentos-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

      },

      borderRadius: {
        'agentos': '8px',
        'agentos-lg': '12px',
        'agentos-xl': '16px'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};
