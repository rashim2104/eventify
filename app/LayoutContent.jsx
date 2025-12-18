'use client';

import { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from '@/components/Navbar/navbar';
import Sidebar from '@/components/Sidebar/sidebar';
import { usePathname } from 'next/navigation';
import { colors } from '@/lib/colors.config.js';

export default function LayoutContent({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();

  const isAuthLikePage =
    pathname === '/' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (isAuthLikePage) {
    return (
      <Box component='main' sx={{ minHeight: '100vh', backgroundColor: colors.light.background }}>
        {children}
      </Box>
    );
  }

  return (
    <>
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
            backgroundColor: colors.light.background,
            color: colors.light.foreground,
            minHeight: '100vh',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
