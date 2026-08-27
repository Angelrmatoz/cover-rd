'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle, AlertTriangle, RefreshCw, KeyRound } from 'lucide-react';

interface DoorScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoorScannerModal: React.FC<DoorScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    attendee?: string;
    event?: string;
    used_date?: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunningRef = useRef(false);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleValidate(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      isScannerRunningRef.current = true;
      setIsScanning(true);
    } catch {
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScannerRunningRef.current) {
      try {
        await scannerRef.current.stop();
        isScannerRunningRef.current = false;
      } catch {
        // ignore
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
      setScanResult(null);
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const handleValidate = async (token: string) => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const res = await api.scanQR(token.trim());
      if (res.status === 'success' && res.data?.success) {
        setScanResult({
          success: true,
          message: '¡ACCESO PERMITIDO!',
          attendee: res.data.attendee,
          event: res.data.event,
        });
      } else {
        setScanResult({
          success: false,
          message: res.data?.error || res.message || 'Ticket no válido o ya utilizado',
          used_date: res.data?.used_date,
        });
      }
    } catch {
      setScanResult({
        success: false,
        message: 'Error al contactar con el servidor de validación',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-fuchsia-400" />
            <div>
              <h2 className="text-base font-bold">Escáner de Puerta</h2>
              <p className="text-[11px] text-zinc-400">Validación de tickets y control de acceso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Area */}
        <div className="p-5 space-y-4">
          {scanResult ? (
            /* SCAN RESULT MODAL */
            <div
              className={`p-6 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-150 ${
                scanResult.success
                  ? 'bg-emerald-950/70 border-2 border-emerald-500 text-emerald-200'
                  : 'bg-red-950/70 border-2 border-red-500 text-red-200'
              }`}
            >
              <div className="mx-auto inline-flex p-3 rounded-full bg-black/40">
                {scanResult.success ? (
                  <CheckCircle className="w-12 h-12 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-black">{scanResult.message}</h3>
                {scanResult.attendee && (
                  <p className="text-sm font-semibold text-white mt-1">
                    Titular: {scanResult.attendee}
                  </p>
                )}
                {scanResult.event && (
                  <p className="text-xs text-zinc-300">
                    Evento: {scanResult.event}
                  </p>
                )}
                {scanResult.used_date && (
                  <p className="text-[11px] text-red-300 mt-1">
                    Ya escaneado en: {new Date(scanResult.used_date).toLocaleTimeString('es-DO')}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setScanResult(null);
                  startScanner();
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-zinc-200 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Escanear Siguiente Entrada</span>
              </button>
            </div>
          ) : (
            /* CAMERA SCANNER VIEW */
            <div>
              <div
                id="qr-reader"
                className="w-full aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800"
              />

              {!isScanning && (
                <div className="mt-2 text-center text-xs text-zinc-500">
                  Cámara no disponible o permiso denegado. Puedes ingresar el token abajo.
                </div>
              )}
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="pt-3 border-t border-zinc-800">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Token Manual / Código de Registro
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Pegar token SHA256..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500"
              />
              <button
                onClick={() => handleValidate(manualToken)}
                disabled={loading || !manualToken}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white disabled:opacity-50 transition"
              >
                {loading ? '...' : 'Validar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
