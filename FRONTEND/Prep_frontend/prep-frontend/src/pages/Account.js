import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  BottomNavigation,
  BottomNavigationAction,
  Container
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Dashboard from '../components/Dashboard/Dashboard';
import Profile from '../components/Profile/Profile';
import BookmarkedLessons from '../components/Dashboard/BookmarkedLessons';
import LearningProgress from '../components/Dashboard/LearningProgress';
import Rewards from './Rewards';

const drawerWidth = 260;

const menu = [
  { label: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
  { label: 'My Progress', icon: <TimelineIcon />, value: 'progress' },
  { label: 'Bookmarked Lessons', icon: <BookmarkIcon />, value: 'bookmarks' },
  { label: 'Subscription', icon: <CardMembershipIcon />, value: 'subscription' },
  { label: 'Rewards', icon: <EmojiEventsIcon />, value: 'rewards' }
];

export default function Account() {
  const [selectedTab, setSelectedTab] = React.useState('dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  React.useEffect(() => {
    if (!token) {
      navigate('/auth', { state: { from: location }, replace: true });
      return;
    }
  }, [token, navigate, location]);

  const renderContent = () => {
    switch(selectedTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'progress':
        return <LearningProgress />;
      case 'bookmarks':
        return <BookmarkedLessons />;
      case 'subscription':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Subscription Details</Typography>
            <Profile />
          </Paper>
        );
      case 'rewards':
        return <Rewards />;
      default:
        return <Dashboard />;
    }
  };

  const NavigationContent = () => (
    <List>
      {menu.map((item) => (
        <ListItem
          button
          key={item.value}
          selected={selectedTab === item.value}
          onClick={() => setSelectedTab(item.value)}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'inherit',
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: selectedTab === item.value ? 'inherit' : 'primary.main' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Account
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <NavigationContent />
          </Box>
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          mb: { xs: 7, md: 0 } // Add bottom margin for mobile to account for navigation
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            zIndex: 1000,
            borderTop: '1px solid',
            borderColor: 'divider'
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={selectedTab}
            onChange={(event, newValue) => setSelectedTab(newValue)}
            showLabels
          >
            {menu.map((item) => (
              <BottomNavigationAction
                key={item.value}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
