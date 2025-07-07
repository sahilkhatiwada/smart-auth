import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Alert, TableSortLabel } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

interface User {
  username: string;
  email: string;
  blocked: boolean;
  roles: string[];
  profile?: { name?: string; avatar?: string };
}

interface LoginEvent {
  timestamp: number;
  ip: string;
  device: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRoles, setEditRoles] = useState('');
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'username' | 'email' | 'status'>('username');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoles, setNewRoles] = useState('user');
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activityUser, setActivityUser] = useState<User | null>(null);
  const [activityEvents, setActivityEvents] = useState<LoginEvent[]>([]);

  // Axios instance with JWT
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to fetch users'))
      .finally(() => setLoading(false));
  }, []);

  const handleBlockToggle = (user: User) => {
    // TODO: API call to block/unblock user
    // api.post(`/admin/users/${user.username}/block`, { blocked: !user.blocked })
    setUsers(users => users.map(u => u.username === user.username ? { ...u, blocked: !u.blocked } : u));
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditRoles(user.roles.join(','));
    setEditName(user.profile?.name || '');
  };

  const handleSave = () => {
    if (editUser) {
      // TODO: API call to update roles/profile
      // api.put(`/admin/users/${editUser.username}`, { roles: editRoles.split(','), profile: { name: editName } })
      setUsers(users => users.map(u => u.username === editUser.username ? { ...u, roles: editRoles.split(',').map(r => r.trim()), profile: { ...u.profile, name: editName } } : u));
      setEditUser(null);
    }
  };

  const handleSort = (field: 'username' | 'email' | 'status') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleCreate = () => {
    if (!newUsername || !newEmail || !newPassword) {
      setCreateError('Username, email, and password are required');
      return;
    }
    // TODO: Replace with real API call
    setUsers(users => [
      ...users,
      {
        username: newUsername,
        email: newEmail,
        blocked: false,
        roles: newRoles.split(',').map(r => r.trim()),
        profile: { name: newName },
      },
    ]);
    setCreateOpen(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRoles('user');
    setNewName('');
    setCreateError('');
  };

  const handleDelete = () => {
    if (deleteUser) {
      // TODO: Replace with real API call
      setUsers(users => users.filter(u => u.username !== deleteUser.username));
      setDeleteUser(null);
    }
  };

  const handleResetPassword = () => {
    if (resetUser && resetPassword) {
      // TODO: Replace with real API call
      setResetSuccess(true);
      setTimeout(() => {
        setResetUser(null);
        setResetPassword('');
        setResetSuccess(false);
      }, 1500);
    }
  };

  const handleViewActivity = (user: User) => {
    // TODO: Replace with real API call
    setActivityUser(user);
    setActivityEvents([
      { timestamp: Date.now() - 100000, ip: '1.2.3.4', device: 'Chrome on Windows' },
      { timestamp: Date.now() - 50000, ip: '2.2.2.2', device: 'Safari on iPhone' },
      { timestamp: Date.now() - 20000, ip: '3.3.3.3', device: 'Firefox on Linux' },
    ]);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(filter.toLowerCase()))
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string | boolean = '';
    let bValue: string | boolean = '';
    if (sortBy === 'username') {
      aValue = a.username.toLowerCase();
      bValue = b.username.toLowerCase();
    } else if (sortBy === 'email') {
      aValue = a.email.toLowerCase();
      bValue = b.email.toLowerCase();
    } else if (sortBy === 'status') {
      aValue = a.blocked;
      bValue = b.blocked;
    }
    if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Management</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <TextField
          label="Search users"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ 'aria-label': 'search' }}
          sx={{ maxWidth: 400 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 2, minWidth: 150, height: 40 }}
          onClick={() => setCreateOpen(true)}
        >
          Create User
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'username'}
                  direction={sortBy === 'username' ? sortDir : 'asc'}
                  onClick={() => handleSort('username')}
                >
                  Username
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'email'}
                  direction={sortBy === 'email' ? sortDir : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortDir : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map(user => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roles.map(role => <Chip key={role} label={role} size="small" sx={{ mr: 0.5 }} />)}</TableCell>
                <TableCell>{user.blocked ? <Chip label="Blocked" color="error" /> : <Chip label="Active" color="success" />}</TableCell>
                <TableCell>{user.profile?.name || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleBlockToggle(user)} title={user.blocked ? 'Unblock' : 'Block'}>
                    {user.blocked ? <CheckCircleIcon color="success" /> : <BlockIcon color="error" />}
                  </IconButton>
                  <IconButton onClick={() => handleEdit(user)} title="Edit Roles/Profile">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setResetUser(user)} title="Reset Password" color="primary">
                    <LockResetIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteUser(user)} title="Delete User" color="error">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleViewActivity(user)} title="View Activity" color="info">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField label="Roles (comma separated)" value={editRoles} onChange={e => setEditRoles(e.target.value)} fullWidth margin="normal" />
          <TextField label="Name" value={editName} onChange={e => setEditName(e.target.value)} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField label="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} fullWidth margin="normal" autoFocus />
          <TextField label="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} fullWidth margin="normal" />
          <TextField label="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} fullWidth margin="normal" />
          <TextField label="Roles (comma separated)" value={newRoles} onChange={e => setNewRoles(e.target.value)} fullWidth margin="normal" />
          <TextField label="Name" value={newName} onChange={e => setNewName(e.target.value)} fullWidth margin="normal" />
          {createError && <Typography color="error" variant="body2">{createError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete user <b>{deleteUser?.username}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUser(null)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!resetUser} onClose={() => setResetUser(null)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography>Set a new password for <b>{resetUser?.username}</b>:</Typography>
          <TextField
            label="New Password"
            type="password"
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
            fullWidth
            margin="normal"
            autoFocus
          />
          {resetSuccess && <Typography color="success.main">Password reset!</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetUser(null)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={!resetPassword || resetSuccess}>Reset</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!activityUser} onClose={() => setActivityUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Login Activity for {activityUser?.username}</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Device</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activityEvents.map((event, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{event.ip}</TableCell>
                  <TableCell>{event.device}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 