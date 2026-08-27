'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { api, UserTicket } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, Ticket, CheckCircle2, QrCode, Sparkles, RefreshCw } from 'lucide-react';

interface UserTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserTicketsModal: React.FC<UserTicketsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getUserTickets();
      if (res.status === 'success' && res.data) {
        setTickets(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mis Flyers & Tickets</h2>
              <p className="text-xs text-zinc-400">Entradas digitales y códigos QR para escaneo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTickets}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
              title="Refrescar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar Mis Flyers"
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list or single QR detail */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {selectedTicket ? (
            /* SINGLE TICKET QR FOCUS VIEW */
            <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedTicket(null)}
                className="self-start text-xs font-semibold text-fuchsia-400 hover:underline flex items-center gap-1"
              >
                ← Volver a todos mis tickets
              </button>

              <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-zinc-900">
                {selectedTicket.flyer_image && (
                  <Image
                    src={selectedTicket.flyer_image}
                    alt={selectedTicket.event_name}
                    fill
                    className="object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-left">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Pase Digital</span>
                  <h3 className="text-lg font-black text-white">{selectedTicket.event_name}</h3>
                </div>
              </div>

              {/* QR Code Container - High Brightness */}
              <div className="p-6 rounded-3xl bg-white shadow-2xl shadow-fuchsia-500/20">
                <QRCodeSVG
                  value={selectedTicket.qr_token}
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="bg-zinc-900/90 rounded-2xl p-4 w-full border border-zinc-800 text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tipo de Entrada:</span>
                  <span className="font-bold text-white">{selectedTicket.ticket_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Titular:</span>
                  <span className="font-semibold text-fuchsia-400">{selectedTicket.attendee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Fecha del Evento:</span>
                  <span className="text-zinc-300">
                    {selectedTicket.date_begin
                      ? new Date(selectedTicket.date_begin).toLocaleDateString('es-DO', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })
                      : 'Fecha pronto'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400">Estado:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Válido para ingreso
                  </span>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-zinc-500 text-sm">
              Cargando tus flyers comprados...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-flex p-4 rounded-full bg-zinc-900 text-zinc-600">
                <Ticket className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-zinc-400">No tienes flyers o entradas compradas aún</p>
              <p className="text-xs text-zinc-500">Explora los eventos en la cartelera y consigue tu pase.</p>
            </div>
          ) : (
            /* TICKETS LIST */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tickets.map((t) => (
                <div
                  key={t.registration_id}
                  onClick={() => setSelectedTicket(t)}
                  className="group relative cursor-pointer bg-zinc-900/90 border border-zinc-800/80 hover:border-fuchsia-500/60 rounded-2xl overflow-hidden p-3 transition-all hover:shadow-xl hover:shadow-fuchsia-950/20 flex gap-3 items-center"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0">
                    {t.flyer_image ? (
                      <Image
                        src={t.flyer_image}
                        alt={t.event_name}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-fuchsia-400 uppercase">
                      {t.ticket_name}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{t.event_name}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>
                        {t.date_begin
                          ? new Date(t.date_begin).toLocaleDateString('es-DO', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'Próximamente'}
                      </span>
                    </div>
                  </div>

                  {/* QR Mini Icon Trigger */}
                  <div className="p-2.5 rounded-xl bg-zinc-800 group-hover:bg-fuchsia-600 text-zinc-400 group-hover:text-white transition">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
