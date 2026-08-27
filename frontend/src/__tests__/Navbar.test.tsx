import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

describe('Navbar Component', () => {
  const mockOpenAuth = jest.fn();
  const mockOpenTickets = jest.fn();
  const mockOpenScanner = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders brand logo and title correctly', () => {
    render(
      <AuthProvider>
        <Navbar
          onOpenAuth={mockOpenAuth}
          onOpenTickets={mockOpenTickets}
          onOpenScanner={mockOpenScanner}
        />
      </AuthProvider>
    );

    expect(screen.getByText(/COVER/i)).toBeInTheDocument();
    expect(screen.getByText(/\.RD/i)).toBeInTheDocument();
  });

  it('renders login button for guest user and does NOT show scanner button', () => {
    render(
      <AuthProvider>
        <Navbar
          onOpenAuth={mockOpenAuth}
          onOpenTickets={mockOpenTickets}
          onOpenScanner={mockOpenScanner}
        />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Iniciar Sesión');
    expect(loginBtn).toBeInTheDocument();

    expect(screen.queryByTitle('Escanear entradas en puerta')).not.toBeInTheDocument();

    fireEvent.click(loginBtn);
    expect(mockOpenAuth).toHaveBeenCalledTimes(1);
  });

  it('renders door scanner button ONLY for logged-in promoter role', () => {
    localStorage.setItem('cover_token', 'mock_jwt_token');
    localStorage.setItem(
      'cover_user',
      JSON.stringify({
        id: 1,
        name: 'Discoteca VIP',
        email: 'vip@cover.do',
        role: 'promoter',
        rnc: '131-45678-9',
      })
    );

    render(
      <AuthProvider>
        <Navbar
          onOpenAuth={mockOpenAuth}
          onOpenTickets={mockOpenTickets}
          onOpenScanner={mockOpenScanner}
        />
      </AuthProvider>
    );

    const scannerBtn = screen.getByTitle('Escanear entradas en puerta');
    expect(scannerBtn).toBeInTheDocument();
    fireEvent.click(scannerBtn);
    expect(mockOpenScanner).toHaveBeenCalledTimes(1);
  });
});
