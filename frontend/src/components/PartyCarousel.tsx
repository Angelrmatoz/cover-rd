'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { EventItem } from '@/lib/api';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Sparkles, Tag } from 'lucide-react';

interface PartyCarouselProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const PartyCarousel: React.FC<PartyCarouselProps> = ({ events, onSelectEvent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter events that have images
  const featured = events.filter((e) => e.images && e.images.length > 0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const current = featured[currentIndex];
  const activeImage = current.images[0];
  const minPrice = current.tickets.length > 0
    ? Math.min(...current.tickets.map((t) => t.price))
    : 0;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

      {/* Main Image Banner */}
      <div className="relative h-[380px] sm:h-[480px] w-full">
        <Image
          src={activeImage}
          alt={current.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition-all duration-700 ease-out transform scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-600/90 text-white backdrop-blur-md shadow-lg shadow-fuchsia-600/40 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> FIESTA DESTACADA
          </span>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-amber-400 border border-amber-500/30 backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5" /> Santo Domingo, RD
          </span>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium mb-2">
              <Calendar className="w-4 h-4 text-fuchsia-400" />
              <span>
                {current.date_begin
                  ? new Date(current.date_begin).toLocaleDateString('es-DO', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })
                  : 'Próximamente'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              {current.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2">
              Consigue tus accesos VIP, Open Bar y entradas generales con código QR instantáneo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400">Desde</div>
              <div className="text-2xl font-black text-amber-400">
                RD$ {minPrice.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onSelectEvent(current)}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-fuchsia-600/30"
            >
              <Tag className="w-4 h-4" />
              <span>Comprar Boletos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md border border-white/10 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 backdrop-blur-md border border-white/10 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {featured.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex ? 'w-6 bg-fuchsia-500' : 'w-2 bg-zinc-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
