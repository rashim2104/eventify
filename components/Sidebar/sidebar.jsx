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
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {filteredMenuItems.map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
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
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
            mt: { xs: '64px', sm: '64px' }, // Account for AppBar height
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
            mt: '64px', // Account for AppBar height
            border: 'none',
            backgroundColor: 'background.paper',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
