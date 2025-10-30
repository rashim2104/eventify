'use client';

import { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from '@/components/Navbar/navbar';
import Sidebar from '@/components/Sidebar/sidebar';
import { usePathname } from 'next/navigation';

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
      <Box component='main' sx={{ minHeight: '100vh' }}>
        {children}
      </Box>
    );
  }

  return (
    <>
      <Navbar onMobileMenuToggle={handleMobileMenuToggle} />
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Box
        component='main'
        sx={{
          marginLeft: { md: '280px' },
          marginTop: '64px',
          padding: 3,
          minHeight: 'calc(100vh - 64px)',
          transition: 'margin-left 0.3s ease-in-out',
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          backgroundColor: '#ffffff',
          color: '#000000',
        }}
      >
        {children}
      </Box>
    </>
  );
}
