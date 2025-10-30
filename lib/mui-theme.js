/**
 * Material UI Theme Configuration for Eventify
 * Custom theme using Eventify's color palette with Material Design principles
 */

import { createTheme } from '@mui/material/styles';
import { colors, colorHexMap } from './colors.config.js';

// Convert oklch colors to hex for Material UI compatibility
const convertOklchToHex = oklchValue => {
  // Use the colorHexMap for consistent color conversion
  return colorHexMap[oklchValue] || oklchValue;
};

// Create the Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: convertOklchToHex(colors.light.primary),
      light: convertOklchToHex(colors.light.secondary),
      dark: convertOklchToHex(colors.light.primary),
      contrastText: convertOklchToHex(colors.light.primaryForeground),
    },
    secondary: {
      main: convertOklchToHex(colors.light.secondary),
      light: convertOklchToHex(colors.light.accent),
      dark: convertOklchToHex(colors.light.muted),
      contrastText: convertOklchToHex(colors.light.secondaryForeground),
    },
    error: {
      main: convertOklchToHex(colors.light.destructive),
      light: convertOklchToHex(colors.light.muted),
      dark: convertOklchToHex(colors.light.destructive),
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Warning amber
      light: '#fcd34d',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6', // Info blue
      light: '#93c5fd',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Success green
      light: '#6ee7b7',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    background: {
      default: convertOklchToHex(colors.light.background),
      paper: convertOklchToHex(colors.light.card),
    },
    text: {
      primary: convertOklchToHex(colors.light.foreground),
      secondary: convertOklchToHex(colors.light.mutedForeground),
      disabled: convertOklchToHex(colors.light.muted),
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily:
      'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 16px',
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});

export default theme;
