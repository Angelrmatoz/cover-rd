'use client';

import React from 'react';
import Image from 'next/image';
import { EventItem } from '@/lib/api';
import { Calendar, MapPin, Ticket, Flame } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const flyer = event.images && event.images.length > 0 ? event.images[0] : null;
  const minPrice = event.tickets.length > 0
    ? Math.min(...event.tickets.map((t) => t.price))
    : 0;

  return (
    <div className="group relative bg-zinc-900/90 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-fuchsia-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-fuchsia-950/30 flex flex-col">
      {/* Flyer Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        {flyer ? (
          <Image
            src={flyer}
            alt={event.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-600">
            <Flame className="w-12 h-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-zinc-200 border border-white/10 backdrop-blur-md flex items-center gap-1">
            <MapPin className="w-3 h-3 text-fuchsia-400" /> RD
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-black backdrop-blur-md">
            RD$ {minPrice.toLocaleString()}
          </span>
        </div>

        {/* Date on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>
            {event.date_begin
              ? new Date(event.date_begin).toLocaleDateString('es-DO', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Fecha por confirmar'}
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight group-hover:text-fuchsia-400 transition-colors line-clamp-1">
            {event.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.tickets.slice(0, 2).map((t) => (
              <span
                key={t.id}
                className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/40"
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSelect(event)}
          className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-gradient-to-r hover:from-fuchsia-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1.5 group-hover:bg-fuchsia-600"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Comprar Entrada</span>
        </button>
      </div>
    </div>
  );
};
