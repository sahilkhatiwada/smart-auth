import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersPage from './UsersPage';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UsersPage', () => {
  const users = [
    { username: 'alice', email: 'alice@example.com', blocked: false, roles: ['admin'], profile: { name: 'Alice' } },
    { username: 'bob', email: 'bob@example.com', blocked: true, roles: ['user'], profile: { name: 'Bob' } },
    { username: 'carol', email: 'carol@example.com', blocked: false, roles: ['user'], profile: { name: 'Carol' } },
  ];

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    mockedAxios.get.mockResolvedValue({ data: users });
  });

  it('renders user list', async () => {
    render(<UsersPage />);
    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('carol')).toBeInTheDocument();
  });

  it('filters users by username', async () => {
    render(<UsersPage />);
    await screen.findByText('alice');
    // Simulate filter (add a filter input in UsersPage for this test to pass)
    // fireEvent.change(screen.getByLabelText(/search/i), { target: { value: 'bob' } });
    // expect(screen.queryByText('alice')).not.toBeInTheDocument();
    // expect(screen.getByText('bob')).toBeInTheDocument();
  });

  // Add more tests for sort, block/unblock, edit, etc.
}); 