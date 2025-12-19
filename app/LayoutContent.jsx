'use client';

import { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from '@/components/Navbar/navbar';
import Sidebar from '@/components/Sidebar/sidebar';
import { usePathname } from 'next/navigation';
import { colors } from '@/lib/colors.config.js';
import { SessionProvider } from 'next-auth/react';

// Public pages that don't need authentication
const PUBLIC_PATHS = ['/', '/forgot-password', '/reset-password', '/student', '/home'];

export default function LayoutContent({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Public pages - no auth, no navbar/sidebar
  if (isPublicPage) {
    return (
      <Box
        component='main'
        sx={{ minHeight: '100vh', backgroundColor: colors.light.sidebar }}
      >
        {children}
      </Box>
    );
  }

  // Authenticated pages - wrap with SessionProvider, show navbar/sidebar
  return (
    <SessionProvider>
      <Navbar onMobileMenuToggle={handleMobileMenuToggle} />
      <Box sx={{ display: 'flex' }}>
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <Box
          component='main'
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px',
            width: { sm: `calc(100% - 280px)` },
            backgroundColor: colors.light.sidebar,
            color: colors.light.sidebarForeground,
            minHeight: '100vh',
          }}
        >
          {children}
        </Box>
      </Box>
    </SessionProvider>
  );
}
