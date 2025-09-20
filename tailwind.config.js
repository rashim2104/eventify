const { tailwindColors } = require('./lib/colors.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        // Eventify Color Palette - shadcn/ui Gray theme
        ...tailwindColors,

        // Legacy support - keeping old color names for backward compatibility
        primary: tailwindColors.primary,
        secondary: tailwindColors.secondary,
        accent: tailwindColors.accent,
        neutral: tailwindColors.neutral,
        success: tailwindColors.success,
        warning: tailwindColors.warning,
        error: tailwindColors.error,
        info: tailwindColors.info,
      },

      // Custom utility classes for the design system
      backgroundColor: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'bg-muted': 'var(--color-bg-muted)',
        'bg-surface': 'var(--color-surface)',
        'bg-surface-secondary': 'var(--color-surface-secondary)',
        'bg-surface-tertiary': 'var(--color-surface-tertiary)',
      },

      textColor: {
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-subtle': 'var(--color-text-subtle)',
      },

      borderColor: {
        'border': 'var(--color-border)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-strong': 'var(--color-border-strong)',
      },
    },
  },
  plugins: [],
};
