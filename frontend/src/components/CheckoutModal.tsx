'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { EventItem, api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, Ticket, User as UserIcon, Mail, Phone, Wallet, Plus, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  event: EventItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  const { user, updateUserBalance } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event && event.tickets && event.tickets.length > 0) {
      setSelectedTicketId(event.tickets[0].id);
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [event, user]);

  // Completed purchase state with QR
  const [completedData, setCompletedData] = useState<{
    qr_token: string;
    attendee_name: string;
    event_name: string;
  } | null>(null);

  if (!event) return null;

  const activeTicket = event.tickets.find((t) => t.id === selectedTicketId) || event.tickets[0];
  const ticketPrice = activeTicket ? activeTicket.price : 0;
  const userBalance = user?.wallet_balance ?? 20000;
  const hasSufficientBalance = userBalance >= ticketPrice;
  const remainingBalance = userBalance - ticketPrice;

  const handleTopup = async () => {
    setIsTopupLoading(true);
    setError(null);
    try {
      const res = await api.topupWallet(5000);
      if (res.status === 'success' && res.user?.wallet_balance !== undefined) {
        updateUserBalance(res.user.wallet_balance);
      }
    } catch {
      setError('No se pudo recargar el saldo');
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasSufficientBalance) {
      setError('Saldo insuficiente en tu Billetera Cover. Haz clic en recargar.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.checkout({
        event_id: event.id,
        ticket_id: activeTicket?.id,
        name: name || user?.name || 'Asistente Cover',
        email: email || user?.email || 'asistente@cover.do',
        phone,
      });

      if (res.status === 'success' && res.data) {
        if (res.data.wallet_balance !== undefined && res.data.wallet_balance !== null) {
          updateUserBalance(res.data.wallet_balance);
        }
        setCompletedData(res.data);
        onSuccess();
      } else {
        setError(res.message || 'Error al procesar la compra de entrada');
      }
    } catch {
      setError('Error al conectar con el servidor de pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {completedData ? (
          /* SUCCESS VIEW WITH QR */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">¡Entrada Pagada y Confirmada!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                El monto fue debitado de tu Billetera Cover. Presenta este código QR en la puerta.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-6 rounded-2xl bg-white mx-auto inline-block shadow-xl shadow-fuchsia-500/10">
              <QRCodeSVG
                value={completedData.qr_token}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="bg-zinc-900/90 rounded-xl p-3 text-xs border border-zinc-800 text-left space-y-1">
              <div className="text-zinc-400">Evento: <span className="font-bold text-white">{completedData.event_name}</span></div>
              <div className="text-zinc-400">Asistente: <span className="font-semibold text-fuchsia-400">{completedData.attendee_name}</span></div>
              <div className="text-[10px] text-zinc-500 font-mono break-all pt-1 border-t border-zinc-800">
                Token QR: {completedData.qr_token.substring(0, 24)}...
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:opacity-90 transition"
            >
              Listo / Ir a Mis Flyers
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div className="flex flex-col">
            {/* Header with flyer preview */}
            <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
              {event.images && event.images[0] && (
                <Image
                  src={event.images[0]}
                  alt={event.name}
                  fill
                  className="object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
              <div className="absolute bottom-3 left-6 right-6">
                <span className="text-[10px] uppercase font-bold text-fuchsia-400 tracking-wider">
                  Pago con Billetera Digital
                </span>
                <h3 className="text-xl font-black text-white leading-tight">{event.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                  {error}
                </div>
              )}

              {/* Wallet Summary Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Tu Billetera Cover</div>
                    <div className="text-sm font-bold text-emerald-400">
                      RD$ {userBalance.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTopup}
                  disabled={isTopupLoading}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition"
                  title="Recargar saldo de prueba"
                >
                  <Plus className={`w-3.5 h-3.5 ${isTopupLoading ? 'animate-spin' : ''}`} />
                  <span>Recargar +5k</span>
                </button>
              </div>

              {/* Ticket Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Selecciona tu Pase
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.tickets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedTicketId === t.id
                          ? 'border-fuchsia-500 bg-fuchsia-950/30 ring-1 ring-fuchsia-500'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{t.name}</span>
                        <Ticket className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <div className="mt-2 text-sm font-black text-amber-400">
                        RD$ {t.price.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendee details */}
              <form onSubmit={handleCheckout} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Nombre en Entrada
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre y Apellido"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total a Debitar</div>
                    <div className="text-xl font-black text-amber-400">
                      RD$ {ticketPrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Restante en Billetera: RD$ {Math.max(0, remainingBalance).toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !hasSufficientBalance}
                    className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-fuchsia-600/30"
                  >
                    <span>{loading ? 'Procesando Pago...' : 'Confirmar y Pagar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
