'use client';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ListIcon, SignOutIcon } from '@phosphor-icons/react';

function Navbar({ onMobileMenuToggle }) {
  const { data: session } = useSession();
  const [print, setPrint] = useState(true);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const allowedPaths = [
      '/dashboard',
      '/manage',
      '/create',
      '/status',
      '/update',
      '/approve',
      '/report',
      '/profile',
      '/events',
      'events/[eventID]',
      '/venues',
    ];
    if (!allowedPaths.some(path => pathname.startsWith(path))) {
      setPrint(false);
    } else {
      setPrint(true);
    }
  }, [pathname]);

  const handleMobileMenuOpen = event => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleSignOut = () => {
    signOut();
    handleMobileMenuClose();
  };

  if (!print) {
    return null;
  }

  return (
    <AppBar position='fixed' sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Link
          href='/dashboard'
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Image
              src='/assets/images/logo.png'
              width={140}
              height={50}
              quality={100}
              alt='Eventify Logo'
              style={{ marginRight: '16px' }}
            />
          </Box>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          {session && session.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='body1' color='inherit'>
                Hello, {session.user.name}
              </Typography>
            </Box>
          )}
          <Button
            color='inherit'
            onClick={handleSignOut}
            startIcon={<SignOutIcon size={20} weight='regular' />}
            variant='outlined'
            sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Sign out
          </Button>
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='open navigation menu'
            onClick={onMobileMenuToggle}
          >
            <ListIcon size={24} weight='regular' />
          </IconButton>
          <IconButton
            size='large'
            edge='end'
            color='inherit'
            aria-label='account menu'
            onClick={handleMobileMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={mobileMenuAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id='mobile-menu'
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
      >
        {session && session.user && (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {session.user.name?.charAt(0).toUpperCase()}
              </Avatar>
              Hello, {session.user.name}
            </Box>
          </MenuItem>
        )}
        <MenuItem onClick={handleSignOut}>
          <SignOutIcon
            size={20}
            weight='regular'
            style={{ marginRight: '8px' }}
          />
          Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Navbar;
