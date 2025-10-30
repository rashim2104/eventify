// Color configuration for light and dark themes

// Color mapping for hex conversion
const colorHexMap = {
  'oklch(0.205 0 0)': '#0f172a', // Dark primary (almost black)
  'oklch(0.922 0 0)': '#ffffff', // Light primary (white)
  'oklch(0.97 0 0)': '#f8fafc', // Light secondary (gray-50)
  'oklch(0.269 0 0)': '#334155', // Dark secondary (gray-700)
  'oklch(0.577 0.245 27.325)': '#ef4444', // Destructive red
  'oklch(0.922 0 0)': '#e2e8f0', // Light border (gray-200)
  'oklch(1 0 0 / 10%)': '#e2e8f0', // Dark border (gray-200 with opacity)
  'oklch(1 0 0 / 15%)': '#334155', // Dark input (gray-700 with opacity)
  'oklch(0.708 0 0)': '#475569', // Light ring (gray-600)
  'oklch(0.556 0 0)': '#64748b', // Dark ring (gray-500)
  'oklch(0.985 0 0)': '#000000', // Light foreground (black)
  'oklch(0.145 0 0)': '#0f172a', // Dark background (almost black)
};

const colors = {
  light: {
    radius: '0.625rem',
    background: '#ffffff',
    foreground: '#000000',
    card: '#ffffff',
    cardForeground: '#000000',
    popover: '#ffffff',
    popoverForeground: '#000000',
    primary: 'oklch(0.205 0 0)',
    primaryForeground: 'oklch(0.985 0 0)',
    secondary: 'oklch(0.97 0 0)',
    secondaryForeground: 'oklch(0.205 0 0)',
    muted: 'oklch(0.97 0 0)',
    mutedForeground: 'oklch(0.556 0 0)',
    accent: 'oklch(0.97 0 0)',
    accentForeground: 'oklch(0.205 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.708 0 0)',
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    sidebar: '#ffffff',
    sidebarForeground: '#000000',
    sidebarPrimary: '#6366f1',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#f1f5f9',
    sidebarAccentForeground: '#000000',
    sidebarBorder: '#e2e8f0',
    sidebarRing: '#6366f1',

    // Hex equivalents for Tailwind compatibility
    backgroundHex: '#ffffff',
    foregroundHex: '#000000',
    cardHex: '#ffffff',
    cardForegroundHex: '#000000',
    primaryHex: colorHexMap['oklch(0.205 0 0)'],
    primaryForegroundHex: colorHexMap['oklch(0.985 0 0)'],
    secondaryHex: colorHexMap['oklch(0.97 0 0)'],
    secondaryForegroundHex: colorHexMap['oklch(0.205 0 0)'],
    mutedHex: colorHexMap['oklch(0.97 0 0)'],
    mutedForegroundHex: colorHexMap['oklch(0.556 0 0)'],
    accentHex: colorHexMap['oklch(0.97 0 0)'],
    accentForegroundHex: colorHexMap['oklch(0.205 0 0)'],
    destructiveHex: colorHexMap['oklch(0.577 0.245 27.325)'],
    borderHex: colorHexMap['oklch(0.922 0 0)'],
    inputHex: colorHexMap['oklch(0.922 0 0)'],
    ringHex: colorHexMap['oklch(0.708 0 0)'],
  },
  dark: {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.205 0 0)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.269 0 0)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.922 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.371 0 0)',
    accentForeground: 'oklch(0.985 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.556 0 0)',
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    sidebar: 'oklch(0.205 0 0)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.488 0.243 264.376)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.269 0 0)',
    sidebarAccentForeground: 'oklch(0.985 0 0)',
    sidebarBorder: 'oklch(1 0 0 / 10%)',
    sidebarRing: 'oklch(0.439 0 0)',

    // Hex equivalents for Tailwind compatibility
    backgroundHex: colorHexMap['oklch(0.145 0 0)'],
    foregroundHex: colorHexMap['oklch(0.985 0 0)'],
    cardHex: colorHexMap['oklch(0.205 0 0)'],
    cardForegroundHex: colorHexMap['oklch(0.985 0 0)'],
    primaryHex: colorHexMap['oklch(0.922 0 0)'],
    primaryForegroundHex: colorHexMap['oklch(0.205 0 0)'],
    secondaryHex: colorHexMap['oklch(0.269 0 0)'],
    secondaryForegroundHex: colorHexMap['oklch(0.985 0 0)'],
    mutedHex: colorHexMap['oklch(0.269 0 0)'],
    mutedForegroundHex: colorHexMap['oklch(0.708 0 0)'],
    accentHex: colorHexMap['oklch(0.371 0 0)'],
    accentForegroundHex: colorHexMap['oklch(0.985 0 0)'],
    destructiveHex: colorHexMap['oklch(0.704 0.191 22.216)'],
    borderHex: colorHexMap['oklch(1 0 0 / 10%)'],
    inputHex: colorHexMap['oklch(1 0 0 / 15%)'],
    ringHex: colorHexMap['oklch(0.556 0 0)'],
  },
};

// Export the colors object and colorHexMap for use in other files
module.exports = { colors, colorHexMap };
module.exports.tailwindColors = {
  ...colors.light,
  ...colors.dark,
};
