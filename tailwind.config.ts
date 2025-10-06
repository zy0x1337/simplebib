import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#8fac8e',           // Salbeigrün
          'primary-focus': '#708c6f',     // Dunkleres Salbeigrün
          'primary-content': '#ffffff',   // Weiß für Text auf Primary
          
          'secondary': '#a8b5a3',         // Helles Salbeigrün
          'secondary-focus': '#8fa089',
          'secondary-content': '#ffffff',
          
          'accent': '#9fb69d',
          'accent-focus': '#85a083',
          'accent-content': '#ffffff',
          
          'neutral': '#3d4451',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',
          
          'base-100': '#faf8f5',         // Off-white/Beige
          'base-200': '#f5f2ed',         // Helleres Beige
          'base-300': '#e8e4dc',         // Mittleres Beige
          'base-content': '#2b2b2b',     // Dunkelgrau für Text
          
          'info': '#7ba89e',
          'success': '#8fac8e',
          'warning': '#d4a574',
          'error': '#c17272',
        },
      },
      {
        dark: {
          'primary': '#8fac8e',           // Salbeigrün (gleich wie Light)
          'primary-focus': '#708c6f',
          'primary-content': '#ffffff',
          
          'secondary': '#a8b5a3',
          'secondary-focus': '#8fa089',
          'secondary-content': '#ffffff',
          
          'accent': '#9fb69d',
          'accent-focus': '#85a083',
          'accent-content': '#ffffff',
          
          'neutral': '#2a2e37',
          'neutral-focus': '#1f2229',
          'neutral-content': '#d7dae0',
          
          'base-100': '#1a1a1a',         // Warmes Dunkelgrau (kein Blau)
          'base-200': '#252525',         // Neutrales Grau
          'base-300': '#303030',         // Mittleres Grau
          'base-content': '#e8e8e8',     // Hellgrau für Text
          
          'info': '#7ba89e',
          'success': '#8fac8e',
          'warning': '#d4a574',
          'error': '#c17272',
        },
      },
    ],
  },
}

export default config
