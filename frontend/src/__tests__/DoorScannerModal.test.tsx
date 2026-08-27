import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DoorScannerModal } from '../components/DoorScannerModal';
import { api } from '../lib/api';

jest.mock('../lib/api', () => ({
  api: {
    scanQR: jest.fn(),
  },
}));

describe('DoorScannerModal Component', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal header, camera scanner area and manual token input', () => {
    render(<DoorScannerModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText(/Escáner de Puerta/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Pegar token SHA256.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Validar$/i })).toBeInTheDocument();
  });

  it('validates a valid QR token successfully and displays attendee info', async () => {
    (api.scanQR as jest.Mock).mockResolvedValueOnce({
      status: 'success',
      data: {
        success: true,
        attendee: 'Carlos Gomez',
        event: 'Neon Nights Santo Domingo',
      },
    });

    render(<DoorScannerModal isOpen={true} onClose={onCloseMock} />);

    const input = screen.getByPlaceholderText(/Pegar token SHA256.../i);
    const validateBtn = screen.getByRole('button', { name: /^Validar$/i });

    fireEvent.change(input, { target: { value: 'valid_qr_token_123' } });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(api.scanQR).toHaveBeenCalledWith('valid_qr_token_123');
      expect(screen.getByText(/¡ACCESO PERMITIDO!/i)).toBeInTheDocument();
      expect(screen.getByText(/Carlos Gomez/i)).toBeInTheDocument();
      expect(screen.getByText(/Neon Nights Santo Domingo/i)).toBeInTheDocument();
    });
  });

  it('rejects a fake / non-existent QR token with alert notice', async () => {
    (api.scanQR as jest.Mock).mockResolvedValueOnce({
      status: 'error',
      message: 'Token no encontrado en el sistema',
      data: null,
    });

    render(<DoorScannerModal isOpen={true} onClose={onCloseMock} />);

    const input = screen.getByPlaceholderText(/Pegar token SHA256.../i);
    const validateBtn = screen.getByRole('button', { name: /^Validar$/i });

    fireEvent.change(input, { target: { value: 'fake_invented_qr_99999' } });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(api.scanQR).toHaveBeenCalledWith('fake_invented_qr_99999');
      expect(screen.getByText(/Token no encontrado en el sistema/i)).toBeInTheDocument();
    });
  });

  it('handles already scanned / used QR token and displays rejection notice', async () => {
    (api.scanQR as jest.Mock).mockResolvedValueOnce({
      status: 'rejected',
      message: 'Ticket no válido o ya utilizado',
      data: {
        success: false,
        error: 'Entrada YA UTILIZADA previamente',
        used_date: '2026-08-26T19:30:00Z',
      },
    });

    render(<DoorScannerModal isOpen={true} onClose={onCloseMock} />);

    const input = screen.getByPlaceholderText(/Pegar token SHA256.../i);
    const validateBtn = screen.getByRole('button', { name: /^Validar$/i });

    fireEvent.change(input, { target: { value: 'already_used_token' } });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(api.scanQR).toHaveBeenCalledWith('already_used_token');
      expect(screen.getByText(/Entrada YA UTILIZADA previamente/i)).toBeInTheDocument();
    });
  });
});
