import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/EventCard';
import { EventItem } from '@/lib/api';

describe('EventCard Component', () => {
  const mockEvent: EventItem = {
    id: 1,
    name: 'Euphoria Neon Party',
    date_begin: '2026-09-01T22:00:00',
    date_end: '2026-09-02T04:00:00',
    seats_available: 500,
    images: ['/events/party_01_1.webp', '/events/party_01_2.webp'],
    tickets: [
      { id: 10, name: 'General', price: 1000, seats_available: 300 },
      { id: 11, name: 'VIP Access', price: 2500, seats_available: 50 },
    ],
  };

  const mockSelect = jest.fn();

  it('renders event details, flyer and minimum ticket price', () => {
    render(<EventCard event={mockEvent} onSelect={mockSelect} />);

    expect(screen.getByText('Euphoria Neon Party')).toBeInTheDocument();
    expect(screen.getByText('RD$ 1,000')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('VIP Access')).toBeInTheDocument();
  });

  it('calls onSelect when clicking Comprar Entrada button', () => {
    render(<EventCard event={mockEvent} onSelect={mockSelect} />);

    const buyBtn = screen.getByText('Comprar Entrada');
    fireEvent.click(buyBtn);
    expect(mockSelect).toHaveBeenCalledWith(mockEvent);
  });
});
