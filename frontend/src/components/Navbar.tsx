'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Ticket, QrCode, User as UserIcon, LogOut, Flame, Building2, Wallet, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenTickets: () => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenTickets,
  onOpenScanner,
}) => {
  const { user, logout, updateUserBalance } = useAuth();
  const [isTopupLoading, setIsTopupLoading] = useState(false);

  const handleQuickTopup = async () => {
    if (isTopupLoading) return;
    setIsTopupLoading(true);
    try {
      const res = await api.topupWallet(5000);
      if (res.status === 'success' && res.user?.wallet_balance !== undefined) {
        updateUserBalance(res.user.wallet_balance);
      }
    } catch {
      // ignore
    } finally {
      setIsTopupLoading(false);
    }
  };

  const formattedBalance = (user?.wallet_balance ?? 20000).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/70 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-amber-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              COVER<span className="text-fuchsia-500">.RD</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium">
              Nightlife & Tickets
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User authenticated vs guest */}
          {user ? (
            <>
              {/* Wallet Balance Badge with Top-up */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-zinc-400 text-[11px]">Saldo:</span>
                <span>RD$ {formattedBalance}</span>
                <button
                  onClick={handleQuickTopup}
                  disabled={isTopupLoading}
                  className="ml-1 p-1 rounded-md bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-300 transition"
                  title="Recargar +RD$ 5,000 de cortesía"
                >
                  <Plus className={`w-3 h-3 ${isTopupLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Door Scanner button - ONLY visible for promoters/empresas */}
              {user.role === 'promoter' && (
                <button
                  onClick={onOpenScanner}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-amber-300 bg-amber-950/50 border border-amber-500/50 hover:bg-amber-900/60 hover:text-white transition-all shadow-md shadow-amber-500/10"
                  title="Escanear entradas en puerta"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">Escáner Puerta</span>
                </button>
              )}

              {/* My Tickets Button */}
              <button
                onClick={onOpenTickets}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 transition-all shadow-md shadow-fuchsia-600/20"
              >
                <Ticket className="w-4 h-4" />
                <span>Mis Flyers</span>
              </button>

              {/* User Profile Badge */}
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center justify-end gap-1">
                    {user.role === 'promoter' ? (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Building2 className="w-2.5 h-2.5" /> Promotor
                      </span>
                    ) : (
                      'Cliente'
                    )}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:opacity-90 transition-all shadow-md shadow-fuchsia-600/20"
            >
              <UserIcon className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
