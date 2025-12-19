'use client';

// Import global styles in client component to ensure CSS is bundled for all pages
import '@/styles/globals.css';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Convert OKLCH values to hex for Material UI compatibility
const convertOklchToHex = oklchValue => {
  // OKLCH to Hex conversion - using approximate values for now
  // In production, consider using a proper color conversion library
  const oklchMap = {
    'oklch(0.205 0 0)': '#1a1a1a', // Very dark gray/black
    'oklch(0.97 0 0)': '#f7f7f7', // Very light gray/white
    'oklch(0.577 0.245 27.325)': '#ef4444', // Red
    'oklch(0.646 0.222 41.116)': '#10b981', // Green
    'oklch(0.6 0.118 184.704)': '#3b82f6', // Blue
    'oklch(0.398 0.07 227.392)': '#8b5cf6', // Purple
    'oklch(0.828 0.189 84.429)': '#f59e0b', // Orange
    'oklch(0.769 0.188 70.08)': '#eab308', // Yellow
    'oklch(0.145 0 0)': '#0f0f0f', // Very dark
    'oklch(0.985 0 0)': '#fbfbfb', // Very light
    'oklch(0.922 0 0)': '#ebebeb', // Light gray
    'oklch(0.556 0 0)': '#8e8e8e', // Medium gray
    'oklch(0.708 0 0)': '#b4b4b4', // Light medium gray
  };

  return oklchMap[oklchValue] || '#6366f1'; // Default fallback
};

// Create the Material UI theme inline for now
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: convertOklchToHex('oklch(0.205 0 0)'),
      contrastText: convertOklchToHex('oklch(0.985 0 0)'),
    },
    secondary: {
      main: convertOklchToHex('oklch(0.97 0 0)'),
      contrastText: convertOklchToHex('oklch(0.205 0 0)'),
    },
    error: {
      main: convertOklchToHex('oklch(0.577 0.245 27.325)'),
      contrastText: '#ffffff',
    },
    warning: {
      main: convertOklchToHex('oklch(0.828 0.189 84.429)'),
      contrastText: '#ffffff',
    },
    info: {
      main: convertOklchToHex('oklch(0.6 0.118 184.704)'),
      contrastText: '#ffffff',
    },
    success: {
      main: convertOklchToHex('oklch(0.646 0.222 41.116)'),
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: convertOklchToHex('oklch(0.145 0 0)'),
      secondary: convertOklchToHex('oklch(0.556 0 0)'),
    },
    grey: {
      50: convertOklchToHex('oklch(0.97 0 0)'),
      100: convertOklchToHex('oklch(0.97 0 0)'),
      200: convertOklchToHex('oklch(0.97 0 0)'),
      300: convertOklchToHex('oklch(0.922 0 0)'),
      400: convertOklchToHex('oklch(0.922 0 0)'),
      500: convertOklchToHex('oklch(0.556 0 0)'),
      600: convertOklchToHex('oklch(0.556 0 0)'),
      700: convertOklchToHex('oklch(0.145 0 0)'),
      800: convertOklchToHex('oklch(0.145 0 0)'),
      900: convertOklchToHex('oklch(0.145 0 0)'),
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
    borderRadius: 'var(--radius)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius)',
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
          borderRadius: 'var(--radius)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 'var(--radius)',
            '& fieldset': {
              borderColor: 'var(--border)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--ring)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--ring)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 'calc(var(--radius) / 2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
          color: '#000000',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundColor: 'var(--sidebar)',
          color: 'var(--sidebar-foreground)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius)',
          '&.Mui-selected': {
            backgroundColor: 'var(--sidebar-primary)',
            color: 'var(--sidebar-primary-foreground)',
            '&:hover': {
              backgroundColor: 'var(--sidebar-accent)',
            },
          },
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

export const Providers = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
};
