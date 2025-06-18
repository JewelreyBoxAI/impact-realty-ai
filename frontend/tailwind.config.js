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
        heading: ['Poppins', ...fontFamily.sans],
        body: ['Inter', ...fontFamily.sans]
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        muted: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
        card: 'hsl(var(--card))',
        input: 'hsl(var(--input))',
        error: 'hsl(var(--error))',
        success: 'hsl(var(--success))'
      },
      boxShadow: {
        glass: '0 2px 8px 0 rgba(30,30,30,0.06), 0 8px 24px 0 rgba(30,30,30,0.10)',
        neumorph: '4px 4px 15px 0 rgba(0,0,0,0.07), -4px -4px 12px 0 rgba(255,255,255,0.09)'
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, hsl(var(--primary)/0.7) 0%, hsl(var(--secondary)/0.7) 100%)',
        card: 'linear-gradient(135deg, hsl(var(--muted)/0.4) 0%, hsl(var(--card)/0.8) 100%)'
      },
      transitionProperty: {
        'spacing': 'margin, padding'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};
