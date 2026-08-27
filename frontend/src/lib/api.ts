const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8069');

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'promoter';
  rnc?: string;
  business_name?: string;
  wallet_balance?: number;
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  seats_available: number;
}

export interface EventItem {
  id: number;
  name: string;
  date_begin: string;
  date_end: string;
  seats_available: number;
  images: string[];
  tickets: TicketType[];
}

export interface UserTicket {
  registration_id: number;
  event_id: number;
  event_name: string;
  date_begin: string;
  date_end: string;
  ticket_name: string;
  attendee_name: string;
  qr_token: string;
  flyer_image: string | null;
  state: string;
  purchase_date: string;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cover_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'promoter';
    phone?: string;
    rnc?: string;
    business_name?: string;
  }) {
    const res = await fetch(`${API_URL}/cover/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_URL}/cover/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe(): Promise<{ status: string; user?: User; message?: string }> {
    const res = await fetch(`${API_URL}/cover/api/v1/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Wallet
  async topupWallet(amount: number = 5000): Promise<{ status: string; message?: string; user?: User }> {
    const res = await fetch(`${API_URL}/cover/api/v1/user/topup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return res.json();
  },

  // Events
  async getEvents(): Promise<{ status: string; data: EventItem[] }> {
    const res = await fetch(`${API_URL}/cover/api/v1/events`, {
      cache: 'no-store',
    });
    return res.json();
  },

  async getEventDetail(id: number): Promise<{ status: string; data: EventItem }> {
    const res = await fetch(`${API_URL}/cover/api/v1/events/${id}`, {
      cache: 'no-store',
    });
    return res.json();
  },

  // Checkout
  async checkout(data: {
    event_id: number;
    ticket_id?: number;
    name: string;
    email: string;
    phone?: string;
  }) {
    const res = await fetch(`${API_URL}/cover/api/v1/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // User Tickets
  async getUserTickets(): Promise<{ status: string; data: UserTicket[]; message?: string }> {
    const res = await fetch(`${API_URL}/cover/api/v1/user/tickets`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // QR Scan
  async scanQR(qr_token: string) {
    const res = await fetch(`${API_URL}/cover/api/v1/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_token }),
    });
    return res.json();
  },
};
