'use client';

import React, { useState, useEffect } from 'react';
import { api, EventItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { PartyCarousel } from '@/components/PartyCarousel';
import { EventCard } from '@/components/EventCard';
import { AuthModal } from '@/components/AuthModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { UserTicketsModal } from '@/components/UserTicketsModal';
import { DoorScannerModal } from '@/components/DoorScannerModal';
import { Sparkles, Compass, Flame, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      if (res.status === 'success' && res.data) {
        setEvents(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectEvent = (event: EventItem) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setCheckoutEvent(event);
  };

  const categories = [
    { id: 'todos', name: 'Todos los Parties' },
    { id: 'sd', name: 'Santo Domingo' },
    { id: 'pc', name: 'Punta Cana' },
    { id: 'santiago', name: 'Santiago' },
    { id: 'vip', name: 'VIP & Lounge' },
  ];

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'todos') return true;
    const nameLower = e.name.toLowerCase();
    if (selectedCategory === 'sd') return nameLower.includes('santo domingo') || nameLower.includes('sd') || nameLower.includes('piantini');
    if (selectedCategory === 'pc') return nameLower.includes('punta cana');
    if (selectedCategory === 'santiago') return nameLower.includes('santiago');
    if (selectedCategory === 'vip') return nameLower.includes('vip') || nameLower.includes('lounge') || nameLower.includes('sunset');
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTickets={() => setIsTicketsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* HERO / CAROUSEL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Eventos Destacados de la Semana
              </h2>
            </div>
            <button
              onClick={fetchEvents}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar cartelera</span>
            </button>
          </div>

          <PartyCarousel
            events={events}
            onSelectEvent={handleSelectEvent}
          />
        </section>

        {/* VALUE PROPS / FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Acceso QR Inmediato</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Compra en segundos y presenta tu código en puerta sin filas.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Firma Criptográfica</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Tokens únicos anti-duplicados verificados en tiempo real.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Promotores con RNC</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Discotecas verificadas para mayor seguridad y transparencia.</p>
            </div>
          </div>
        </section>

        {/* EXPLORE / EVENTS CATALOG */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Cartelera de Discotecas y Parties</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Próximas Fiestas en RD
              </h2>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? 'bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow-md shadow-fuchsia-600/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-zinc-950 rounded-3xl border border-zinc-800">
              <Flame className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-zinc-400 font-semibold">No se encontraron eventos en esta categoría</p>
              <p className="text-xs text-zinc-500">Prueba seleccionando &quot;Todos los Parties&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={handleSelectEvent}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500 space-y-2">
        <p className="font-bold text-zinc-400">
          COVER.RD © 2026 — Plataforma de Boletos y Control de Acceso para Fiestas en RD
        </p>
        <p className="text-[11px] text-zinc-600">
          Impulsado por Odoo 19.0 Community & PostgreSQL 18
        </p>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <CheckoutModal
        event={checkoutEvent}
        onClose={() => setCheckoutEvent(null)}
        onSuccess={() => {
          fetchEvents();
        }}
      />

      <UserTicketsModal
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
      />

      <DoorScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
