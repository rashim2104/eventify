'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  HouseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  CheckCircleIcon,
  ChartBarIcon,
  MapPinIcon,
  UserIcon,
  GearIcon,
  CaretLeftIcon,
} from '@phosphor-icons/react';
import { colors } from '@/lib/colors.config.js';

const drawerWidth = 280;

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const [print, setPrint] = useState(true);
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

  const { data: session, status } = useSession();
  if (status === 'loading') {
    return null;
  }

  const currUser = session?.user?.userType;

  const handleDrawerToggle = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const menuItems = [
    {
      text: 'Home',
      href: '/dashboard',
      icon: <HouseIcon size={20} weight='regular' />,
      roles: ['HOD', 'staff', 'admin'],
    },
    {
      text: 'Create',
      href: '/create',
      icon: <PlusIcon size={20} weight='regular' />,
      roles: ['HOD', 'staff', 'admin'],
    },
    {
      text: 'Status',
      href: '/status',
      icon: <MagnifyingGlassIcon size={20} weight='regular' />,
      roles: ['HOD', 'staff'],
    },
    {
      text: 'Update',
      href: '/update',
      icon: <NotePencilIcon size={20} weight='regular' />,
      roles: ['HOD', 'staff'],
    },
    {
      text: 'Approve',
      href: '/approve',
      icon: <CheckCircleIcon size={20} weight='regular' />,
      roles: ['HOD', 'admin'],
    },
    {
      text: 'Report',
      href: '/report',
      icon: <ChartBarIcon size={20} weight='regular' />,
      roles: ['HOD', 'admin'],
    },
    {
      text: 'Venue',
      href: '/venues',
      icon: <MapPinIcon size={20} weight='regular' />,
      roles: ['admin'],
    },
    {
      text: 'Profile',
      href: '/profile',
      icon: <UserIcon size={20} weight='regular' />,
      roles: ['HOD', 'staff', 'admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(currUser)
  );

  // Add Manage for Super Admin
  if (session?.user?.isSuperAdmin === 1) {
    filteredMenuItems.push({
      text: 'Manage',
      href: '/manage',
      icon: <GearIcon size={20} weight='regular' />,
      roles: ['admin'],
    });
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CaretLeftIcon size={24} weight='regular' />
          </IconButton>
        )}
      </Box>
      <List sx={{ flexGrow: 1, pt: 1, px: 2 }}>
        {filteredMenuItems.map(item => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                borderRadius: '0.5rem',
                color: colors.light.sidebarForeground,
                '&.Mui-selected': {
                  backgroundColor: colors.light.sidebarPrimary,
                  color: colors.light.sidebarPrimaryForeground,
                  '&:hover': {
                    backgroundColor: colors.light.sidebarPrimary,
                    color: colors.light.sidebarPrimaryForeground,
                    '& .MuiListItemIcon-root': {
                      color: colors.light.sidebarPrimaryForeground,
                    },
                  },
                  '& .MuiListItemIcon-root': {
                    color: colors.light.sidebarPrimaryForeground,
                  },
                },
                '&:hover': {
                  backgroundColor: colors.light.sidebarAccent,
                  color: colors.light.sidebarAccentForeground,
                  '& .MuiListItemIcon-root': {
                    color: colors.light.sidebarAccentForeground,
                  },
                },
                '& .MuiListItemIcon-root': {
                  minWidth: 40,
                  color: pathname === item.href ? colors.light.sidebarPrimaryForeground : colors.light.sidebarForeground,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: pathname === item.href ? 600 : 400,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!print) {
    return null;
  }

  return (
    <Box
      component='nav'
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
        position: { md: 'sticky' },
        top: { md: 0 },
        height: { md: '100vh' },
      }}
      aria-label='navigation menu'
    >
      {/* Mobile drawer */}
      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: colors.light.sidebar,
            borderRight: `2px solid ${colors.light.sidebarBorder}`,
            color: colors.light.sidebarForeground,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant='permanent'
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            mt: '64px',
            borderRight: `2px solid ${colors.light.sidebarBorder}`,
            backgroundColor: colors.light.sidebar,
            color: colors.light.sidebarForeground,
            zIndex: 0,
            position: 'relative',
            height: 'calc(100vh - 64px)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
