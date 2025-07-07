import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real API call
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('token', 'mock-jwt-token');
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" px={2}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, minWidth: { xs: '100%', sm: 320 }, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Demo: <b>admin</b> / <b>admin</b>
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" autoFocus />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
        </form>
      </Paper>
    </Box>
  );
} 