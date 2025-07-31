import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';

const getMenuItems = (isAuthenticated) => [
  { label: 'Home', link: '/', icon: <HomeIcon /> },
  { label: 'About Prep', link: '/about', icon: <InfoIcon /> },
  { label: 'Prep Tutor', link: '/tutor', icon: <SchoolIcon />, protected: true },
  { label: 'Prep Practice Questions', link: '/practice', icon: <QuizIcon />, comingSoon: true },
  { label: 'Rewards', link: '/rewards', icon: <EmojiEventsIcon />, protected: true },
  { label: 'My Account', link: '/account/dashboard', icon: <AccountCircleIcon />, protected: true },
  { label: 'Contact/Support', link: '/contact', icon: <ContactSupportIcon /> },
  ...(isAuthenticated
    ? [
        { label: 'Logout', link: '/auth?logout=1', icon: <LoginIcon /> }
      ]
    : [
        { label: 'Login/Sign Up', link: '/auth', icon: <LoginIcon /> }
      ]),
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const isAuthenticated = Boolean(token);
  const menuItems = getMenuItems(isAuthenticated);
  const handleNavigation = (item) => {
    if (item.protected && !isAuthenticated) {
      // Save the intended destination and redirect to login
      navigate('/auth', { state: { from: item.link } });
    } else if (item.comingSoon) {
      return; // Do nothing for coming soon items
    } else {
      navigate(item.link);
    }
    setDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 280, bgcolor: 'background.paper', height: '100%' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.label}
            onClick={() => handleNavigation(item.link)}
            disabled={item.comingSoon}
            sx={{
              opacity: item.comingSoon ? 0.5 : 1,
              '&:hover': {
                bgcolor: 'rgba(113, 75, 103, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              secondary={item.comingSoon ? '(Coming Soon)' : null}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #714B67 30%, #017E84 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Prep
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => handleNavigation(item.link)}
                disabled={item.comingSoon}
                startIcon={item.icon}
                sx={{
                  opacity: item.comingSoon ? 0.5 : 1,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'rgba(113, 75, 103, 0.1)',
                  },
                }}
              >
                {item.label}
                {item.comingSoon ? ' (Coming Soon)' : ''}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
