import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartyCarousel } from '@/components/PartyCarousel';
import { EventItem } from '@/lib/api';

describe('PartyCarousel Component', () => {
  const mockEvents: EventItem[] = [
    {
      id: 1,
      name: 'Punta Cana Sunset Fest',
      date_begin: '2026-09-10T18:00:00',
      date_end: '2026-09-11T02:00:00',
      seats_available: 800,
      images: ['/events/party_02_1.webp'],
      tickets: [{ id: 20, name: 'General', price: 1500, seats_available: 500 }],
    },
    {
      id: 2,
      name: 'Santiago Reggaeton Night',
      date_begin: '2026-09-15T21:00:00',
      date_end: '2026-09-16T04:00:00',
      seats_available: 400,
      images: ['/events/party_03_1.webp'],
      tickets: [{ id: 21, name: 'VIP', price: 2000, seats_available: 200 }],
    },
  ];

  const mockSelectEvent = jest.fn();

  it('renders active carousel item and triggers buy tickets button', () => {
    render(<PartyCarousel events={mockEvents} onSelectEvent={mockSelectEvent} />);

    expect(screen.getByText('Punta Cana Sunset Fest')).toBeInTheDocument();
    expect(screen.getByText('RD$ 1,500')).toBeInTheDocument();

    const buyBtn = screen.getByRole('button', { name: /Comprar Boletos/i });
    fireEvent.click(buyBtn);
    expect(mockSelectEvent).toHaveBeenCalledWith(mockEvents[0]);
  });
});
