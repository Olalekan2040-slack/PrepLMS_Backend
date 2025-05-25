import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 280;

// Define menu items with role access
const getMenuItems = (role) => {
  const items = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/admin',
      roles: ['super_admin', 'content_admin']
    },
    { 
      text: 'Content', 
      icon: <LibraryBooksIcon />, 
      path: '/admin/content',
      roles: ['super_admin', 'content_admin']
    },
    { 
      text: 'Users', 
      icon: <PeopleIcon />, 
      path: '/admin/users',
      roles: ['super_admin']
    },
    { 
      text: 'Analytics', 
      icon: <AnalyticsIcon />, 
      path: '/admin/analytics',
      roles: ['super_admin', 'content_admin']
    },
    { 
      text: 'Subscriptions', 
      icon: <CardMembershipIcon />, 
      path: '/admin/subscriptions',
      roles: ['super_admin']
    },
    { 
      text: 'Rewards', 
      icon: <EmojiEventsIcon />, 
      path: '/admin/rewards',
      roles: ['super_admin']
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/admin/settings',
      roles: ['super_admin']
    }
  ];

  return items.filter(item => item.roles.includes(role));
};

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('/users/admins/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAdminInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/auth');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        px: 2,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Typography variant="h6" noWrap component="div">
          Prep Admin
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {getMenuItems(adminInfo?.role || 'content_admin').map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  }
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path 
                  ? theme.palette.primary.contrastText 
                  : theme.palette.text.secondary,
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItem 
          button 
          onClick={handleMenuOpen}
          sx={{ borderRadius: 1 }}
        >
          <ListItemIcon>
            <Avatar 
              src={adminInfo?.avatar}
              sx={{ width: 32, height: 32 }}
            >
              <AccountCircleIcon />
            </Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={adminInfo?.name || 'Admin User'}
            secondary={adminInfo?.role === 'super_admin' ? 'Super Admin' : 'Content Admin'}
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getMenuItems(adminInfo?.role || 'content_admin').find(
              item => item.path === location.pathname
            )?.text || 'Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: theme.shadows[2]
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: theme.shadows[2]
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
