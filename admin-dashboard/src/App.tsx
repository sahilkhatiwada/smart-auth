import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Box, ListItemButton, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import UsersPage from './UsersPage';
import AuditLogPage from './AuditLogPage';
import LoginPage from './LoginPage';

const drawerWidth = 220;

function SettingsPage() {
  return <Box p={2}><Typography variant="h5">Settings</Typography><p>Configure system settings here.</p></Box>;
}

// Mock function to get user info from token (replace with real JWT decode)
function getUserFromToken() {
  const token = localStorage.getItem('token');
  // In a real app, decode JWT and extract role
  if (token) return { username: 'admin', role: 'admin' };
  return null;
}

const navItems = [
  { text: 'Users', icon: <PeopleIcon />, path: '/', roles: ['admin', 'user'] },
  { text: 'Audit Log', icon: <ListAltIcon />, path: '/audit', roles: ['admin'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin'] },
];

function RequireRole({ role, children }: { role: string; children: React.ReactNode }) {
  const user = getUserFromToken();
  if (!user || user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function DashboardApp({ onLogout }: { onLogout: () => void }) {
  const user = getUserFromToken();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <div>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.filter(item => item.roles.includes(user?.role || '')).map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton component={Link} to={path} onClick={() => setMobileOpen(false)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Smart Auth Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>Logged in as: {user?.username} ({user?.role})</Typography>
          <Button color="inherit" onClick={onLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        {drawer}
      </Drawer>
      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: { xs: 1, sm: 3 }, ml: { sm: `${drawerWidth}px` }, width: '100vw', minHeight: '100vh' }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/audit" element={<RequireRole role="admin"><AuditLogPage /></RequireRole>} />
          <Route path="/settings" element={<RequireRole role="admin"><SettingsPage /></RequireRole>} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!localStorage.getItem('token'));
  }, []);

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
  };

  return authed ? (
    <Router>
      <DashboardApp onLogout={handleLogout} />
    </Router>
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
} 