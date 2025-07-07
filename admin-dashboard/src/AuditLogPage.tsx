import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';

interface AuditEvent {
  timestamp: number;
  type: string;
  username?: string;
  ip?: string;
  details?: Record<string, any>;
}

const mockEvents: AuditEvent[] = [
  { timestamp: Date.now() - 100000, type: 'login-success', username: 'alice', ip: '1.2.3.4', details: {} },
  { timestamp: Date.now() - 50000, type: 'login-failure', username: 'bob', ip: '2.2.2.2', details: { reason: 'Invalid password' } },
  { timestamp: Date.now() - 20000, type: 'register', username: 'carol', ip: '3.3.3.3', details: {} },
];

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    // TODO: Replace with API call
    // axios.get('/api/admin/audit-log').then(res => setEvents(res.data));
    setEvents(mockEvents);
  }, []);

  const filtered = events.filter(e =>
    e.username?.toLowerCase().includes(filter.toLowerCase()) ||
    e.type.toLowerCase().includes(filter.toLowerCase()) ||
    e.ip?.includes(filter)
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Audit Log</Typography>
      <TextField label="Filter by user, event, or IP" value={filter} onChange={e => setFilter(e.target.value)} fullWidth margin="normal" />
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((event, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                <TableCell>{event.username || '-'}</TableCell>
                <TableCell>{event.type}</TableCell>
                <TableCell>{event.ip || '-'}</TableCell>
                <TableCell>{event.details ? JSON.stringify(event.details) : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 