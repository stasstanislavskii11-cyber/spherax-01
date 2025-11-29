import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsernameForm from './UsernameForm';

describe('UsernameForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.alert
    window.alert = jest.fn();
  });

  it('should render form elements', () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join chat/i })).toBeInTheDocument();
  });

  it('should call onSubmit with trimmed username when form is submitted', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Username');
    const submitButton = screen.getByRole('button', { name: /join chat/i });

    await userEvent.type(input, '  alice  ');
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('alice');
  });

  it('should clear input after successful submission', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Username');
    const submitButton = screen.getByRole('button', { name: /join chat/i });

    await userEvent.type(input, 'alice');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should show alert for empty username', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const submitButton = screen.getByRole('button', { name: /join chat/i });
    await userEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a username');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show alert for whitespace-only username', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Username');
    const submitButton = screen.getByRole('button', { name: /join chat/i });

    await userEvent.type(input, '   ');
    await userEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a username');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show alert when not connected', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={false} />);
    
    const input = screen.getByPlaceholderText('Username');
    const submitButton = screen.getByRole('button', { name: /join chat/i });

    await userEvent.type(input, 'alice');
    await userEvent.click(submitButton);

    expect(window.alert).toHaveBeenCalledWith('Not connected to server. Please wait...');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should update input value when typing', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Username');
    await userEvent.type(input, 'alice');

    expect(input.value).toBe('alice');
  });

  it('should submit form on Enter key press', async () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Username');
    await userEvent.type(input, 'alice{enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('alice');
  });

  it('should respect maxLength attribute', () => {
    render(<UsernameForm onSubmit={mockOnSubmit} isConnected={true} />);
    
    const input = screen.getByPlaceholderText('Username');
    expect(input).toHaveAttribute('maxLength', '50');
  });
});

