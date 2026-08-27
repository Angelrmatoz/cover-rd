import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '@/components/AuthModal';
import { AuthProvider } from '@/context/AuthContext';

describe('AuthModal Component', () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockClose} />
      </AuthProvider>
    );

    expect(screen.getByText('Bienvenido a Cover.do')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar a Cover/i })).toBeInTheDocument();
  });

  it('switches to register mode and displays RNC field when selecting Empresa / Discoteca', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockClose} />
      </AuthProvider>
    );

    // Switch to register
    const registerLink = screen.getByText('Regístrate aquí');
    fireEvent.click(registerLink);

    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Juan Pérez')).toBeInTheDocument();

    // Select Empresa / Discoteca role
    const promoterRoleBtn = screen.getByRole('button', { name: /Empresa \/ Discoteca/i });
    fireEvent.click(promoterRoleBtn);

    // Verify RNC input appears
    expect(screen.getByPlaceholderText('Ej. 131-45678-9')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Euphoria Nightclub SRL')).toBeInTheDocument();
  });
});
