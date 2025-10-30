import { colors, colorHexMap } from './lib/colors.config.js';

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
        // Eventify Color Palette - shadcn/ui theme (using hex values for compatibility)
        background: colors.light.backgroundHex,
        foreground: colors.light.foregroundHex,
        card: colors.light.cardHex,
        cardForeground: colors.light.cardForegroundHex,
        primary: colors.light.primaryHex,
        primaryForeground: colors.light.primaryForegroundHex,
        secondary: colors.light.secondaryHex,
        secondaryForeground: colors.light.secondaryForegroundHex,
        muted: colors.light.mutedHex,
        mutedForeground: colors.light.mutedForegroundHex,
        accent: colors.light.accentHex,
        accentForeground: colors.light.accentForegroundHex,
        destructive: colors.light.destructiveHex,
        border: colors.light.borderHex,
        input: colors.light.inputHex,
        ring: colors.light.ringHex,
        sidebar: colors.light.sidebar,
        sidebarForeground: colors.light.sidebarForeground,
        sidebarPrimary: colors.light.sidebarPrimary,
        sidebarPrimaryForeground: colors.light.sidebarPrimaryForeground,
        sidebarAccent: colors.light.sidebarAccent,
        sidebarAccentForeground: colors.light.sidebarAccentForeground,
        sidebarBorder: colors.light.sidebarBorder,
        sidebarRing: colors.light.sidebarRing,

        // Legacy support - keeping old color names for backward compatibility
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
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
        border: 'var(--color-border)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-strong': 'var(--color-border-strong)',
      },
    },
  },
  plugins: [],
};
