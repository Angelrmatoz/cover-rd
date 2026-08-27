import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserTicketsModal } from '../components/UserTicketsModal';
import { api } from '../lib/api';

jest.mock('../lib/api', () => ({
  api: {
    getUserTickets: jest.fn(),
  },
}));

describe('UserTicketsModal Component', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially and then shows empty message if no tickets', async () => {
    (api.getUserTickets as jest.Mock).mockResolvedValueOnce({
      status: 'success',
      data: [],
    });

    render(<UserTicketsModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText(/Mis Flyers & Tickets/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No tienes flyers o entradas compradas aún/i)).toBeInTheDocument();
    });
  });

  it('renders purchased tickets list with event information and ticket type', async () => {
    (api.getUserTickets as jest.Mock).mockResolvedValueOnce({
      status: 'success',
      data: [
        {
          registration_id: 1,
          event_id: 6,
          event_name: 'Neon Nights Santo Domingo',
          date_begin: '2026-08-30T22:00:00Z',
          ticket_name: 'VIP Admission',
          attendee_name: 'Carlos Gomez',
          qr_token: 'test_token_sha256_abcdef123',
          flyer_image: '/events/party1.webp',
          state: 'open',
          purchase_date: '2026-08-26T20:00:00Z',
        },
      ],
    });

    render(<UserTicketsModal isOpen={true} onClose={onCloseMock} />);

    await waitFor(() => {
      expect(screen.getByText('Neon Nights Santo Domingo')).toBeInTheDocument();
      expect(screen.getByText(/VIP Admission/i)).toBeInTheDocument();
    });
  });
});
