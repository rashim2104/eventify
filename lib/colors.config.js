/**
 * Eventify Color Theme Configuration
 * Based on shadcn/ui Gray theme with excellent contrast ratios
 * Designed for educational institutions and modern web applications
 */

const colors = {
  // Primary Brand Colors
  primary: {
    50: 'oklch(98.5% 0.004 247)',
    100: 'oklch(96.5% 0.008 247)',
    200: 'oklch(92.5% 0.016 247)',
    300: 'oklch(86.5% 0.032 247)',
    400: 'oklch(78.5% 0.048 247)',
    500: 'oklch(65% 0.096 247)',      // Main primary color
    600: 'oklch(55% 0.096 247)',
    700: 'oklch(45% 0.096 247)',
    800: 'oklch(35% 0.096 247)',
    900: 'oklch(25% 0.096 247)',
    950: 'oklch(15% 0.096 247)',
  },

  // Secondary Colors (Growth & Success)
  secondary: {
    50: 'oklch(98.5% 0.008 142)',
    100: 'oklch(96% 0.016 142)',
    200: 'oklch(91% 0.032 142)',
    300: 'oklch(84% 0.064 142)',
    400: 'oklch(74% 0.096 142)',
    500: 'oklch(64% 0.128 142)',      // Main secondary color
    600: 'oklch(54% 0.128 142)',
    700: 'oklch(44% 0.128 142)',
    800: 'oklch(34% 0.128 142)',
    900: 'oklch(24% 0.128 142)',
    950: 'oklch(14% 0.128 142)',
  },

  // Accent Colors (Highlights & Attention)
  accent: {
    50: 'oklch(98.5% 0.012 85)',
    100: 'oklch(96% 0.024 85)',
    200: 'oklch(91% 0.048 85)',
    300: 'oklch(84% 0.096 85)',
    400: 'oklch(74% 0.144 85)',
    500: 'oklch(64% 0.192 85)',       // Main accent color
    600: 'oklch(54% 0.192 85)',
    700: 'oklch(44% 0.192 85)',
    800: 'oklch(34% 0.192 85)',
    900: 'oklch(24% 0.192 85)',
    950: 'oklch(14% 0.192 85)',
  },

  // Neutral Colors (Text, Backgrounds, Borders)
  neutral: {
    50: 'oklch(99% 0.001 247)',       // Pure white
    100: 'oklch(97.5% 0.002 247)',
    200: 'oklch(95% 0.004 247)',
    300: 'oklch(90% 0.006 247)',
    400: 'oklch(80% 0.008 247)',
    500: 'oklch(65% 0.01 247)',       // Main neutral
    600: 'oklch(50% 0.01 247)',
    700: 'oklch(35% 0.01 247)',
    800: 'oklch(25% 0.01 247)',
    900: 'oklch(15% 0.01 247)',
    950: 'oklch(8% 0.01 247)',        // Near black
  },

  // Semantic Colors
  success: {
    50: 'oklch(96% 0.024 142)',
    100: 'oklch(90% 0.048 142)',
    200: 'oklch(82% 0.072 142)',
    300: 'oklch(72% 0.096 142)',
    400: 'oklch(62% 0.12 142)',
    500: 'oklch(52% 0.144 142)',      // Main success color
    600: 'oklch(45% 0.144 142)',
    700: 'oklch(38% 0.144 142)',
    800: 'oklch(32% 0.144 142)',
    900: 'oklch(26% 0.144 142)',
    950: 'oklch(20% 0.144 142)',
  },

  warning: {
    50: 'oklch(98% 0.016 85)',
    100: 'oklch(95% 0.032 85)',
    200: 'oklch(88% 0.064 85)',
    300: 'oklch(78% 0.096 85)',
    400: 'oklch(68% 0.128 85)',
    500: 'oklch(58% 0.16 85)',        // Main warning color
    600: 'oklch(50% 0.16 85)',
    700: 'oklch(42% 0.16 85)',
    800: 'oklch(35% 0.16 85)',
    900: 'oklch(28% 0.16 85)',
    950: 'oklch(21% 0.16 85)',
  },

  error: {
    50: 'oklch(98% 0.012 25)',
    100: 'oklch(95% 0.024 25)',
    200: 'oklch(90% 0.048 25)',
    300: 'oklch(82% 0.072 25)',
    400: 'oklch(72% 0.096 25)',
    500: 'oklch(62% 0.12 25)',        // Main error color
    600: 'oklch(52% 0.12 25)',
    700: 'oklch(42% 0.12 25)',
    800: 'oklch(35% 0.12 25)',
    900: 'oklch(28% 0.12 25)',
    950: 'oklch(21% 0.12 25)',
  },

  info: {
    50: 'oklch(98% 0.008 247)',
    100: 'oklch(95% 0.016 247)',
    200: 'oklch(90% 0.032 247)',
    300: 'oklch(82% 0.064 247)',
    400: 'oklch(72% 0.096 247)',
    500: 'oklch(62% 0.128 247)',      // Main info color
    600: 'oklch(52% 0.128 247)',
    700: 'oklch(42% 0.128 247)',
    800: 'oklch(32% 0.128 247)',
    900: 'oklch(22% 0.128 247)',
    950: 'oklch(12% 0.128 247)',
  },
};

// Generate Tailwind color configuration
const tailwindColors = {};
Object.entries(colors).forEach(([colorName, shades]) => {
  tailwindColors[colorName] = {};
  Object.entries(shades).forEach(([shade, value]) => {
    tailwindColors[colorName][shade] = value;
  });
});

module.exports = {
  colors,
  tailwindColors,

  // CSS Custom Properties for easy access
  cssVariables: {
    // Main colors
    '--color-primary': colors.primary[500],
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],
    '--color-primary-950': colors.primary[950],

    '--color-secondary': colors.secondary[500],
    '--color-secondary-50': colors.secondary[50],
    '--color-secondary-100': colors.secondary[100],
    '--color-secondary-200': colors.secondary[200],
    '--color-secondary-300': colors.secondary[300],
    '--color-secondary-400': colors.secondary[400],
    '--color-secondary-500': colors.secondary[500],
    '--color-secondary-600': colors.secondary[600],
    '--color-secondary-700': colors.secondary[700],
    '--color-secondary-800': colors.secondary[800],
    '--color-secondary-900': colors.secondary[900],
    '--color-secondary-950': colors.secondary[950],

    '--color-accent': colors.accent[500],
    '--color-accent-50': colors.accent[50],
    '--color-accent-100': colors.accent[100],
    '--color-accent-200': colors.accent[200],
    '--color-accent-300': colors.accent[300],
    '--color-accent-400': colors.accent[400],
    '--color-accent-500': colors.accent[500],
    '--color-accent-600': colors.accent[600],
    '--color-accent-700': colors.accent[700],
    '--color-accent-800': colors.accent[800],
    '--color-accent-900': colors.accent[900],
    '--color-accent-950': colors.accent[950],

    // Semantic colors
    '--color-success': colors.success[500],
    '--color-success-50': colors.success[50],
    '--color-success-100': colors.success[100],
    '--color-success-200': colors.success[200],
    '--color-success-300': colors.success[300],
    '--color-success-400': colors.success[400],
    '--color-success-500': colors.success[500],
    '--color-success-600': colors.success[600],
    '--color-success-700': colors.success[700],
    '--color-success-800': colors.success[800],
    '--color-success-900': colors.success[900],
    '--color-success-950': colors.success[950],

    '--color-warning': colors.warning[500],
    '--color-warning-50': colors.warning[50],
    '--color-warning-100': colors.warning[100],
    '--color-warning-200': colors.warning[200],
    '--color-warning-300': colors.warning[300],
    '--color-warning-400': colors.warning[400],
    '--color-warning-500': colors.warning[500],
    '--color-warning-600': colors.warning[600],
    '--color-warning-700': colors.warning[700],
    '--color-warning-800': colors.warning[800],
    '--color-warning-900': colors.warning[900],
    '--color-warning-950': colors.warning[950],

    '--color-error': colors.error[500],
    '--color-error-50': colors.error[50],
    '--color-error-100': colors.error[100],
    '--color-error-200': colors.error[200],
    '--color-error-300': colors.error[300],
    '--color-error-400': colors.error[400],
    '--color-error-500': colors.error[500],
    '--color-error-600': colors.error[600],
    '--color-error-700': colors.error[700],
    '--color-error-800': colors.error[800],
    '--color-error-900': colors.error[900],
    '--color-error-950': colors.error[950],

    '--color-info': colors.info[500],
    '--color-info-50': colors.info[50],
    '--color-info-100': colors.info[100],
    '--color-info-200': colors.info[200],
    '--color-info-300': colors.info[300],
    '--color-info-400': colors.info[400],
    '--color-info-500': colors.info[500],
    '--color-info-600': colors.info[600],
    '--color-info-700': colors.info[700],
    '--color-info-800': colors.info[800],
    '--color-info-900': colors.info[900],
    '--color-info-950': colors.info[950],

    // Background colors
    '--color-bg-primary': colors.neutral[50],
    '--color-bg-secondary': colors.neutral[100],
    '--color-bg-tertiary': colors.neutral[200],
    '--color-bg-muted': colors.neutral[300],

    // Text colors
    '--color-text-primary': colors.neutral[950],
    '--color-text-secondary': colors.neutral[600],
    '--color-text-muted': colors.neutral[500],
    '--color-text-subtle': colors.neutral[400],

    // Border colors
    '--color-border': colors.neutral[200],
    '--color-border-secondary': colors.neutral[300],
    '--color-border-strong': colors.neutral[400],

    // Surface colors (for cards, modals, etc.)
    '--color-surface': colors.neutral[50],
    '--color-surface-secondary': colors.neutral[100],
    '--color-surface-tertiary': colors.neutral[200],
  },
};
