import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { ApiError } from '../services/apiError';

export type ToastVariant = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  showError: (error: unknown, fallbackMessage?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastSeq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const showError = useCallback(
    (error: unknown, fallbackMessage = 'No se pudo completar la operación.') => {
      // La falta de conexión ya se muestra en la pantalla "Sin conexión"
      if (error instanceof ApiError && error.status === 0) return;
      const msg = error instanceof Error && error.message ? error.message : fallbackMessage;
      showToast(msg, 'error');
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showError }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const borderColor =
            toast.variant === 'error'
              ? 'border-red-500/40 bg-[#171116]'
              : toast.variant === 'success'
              ? 'border-[#A3FF12]/40 bg-[#111712]'
              : 'border-[#24293B] bg-[#171A26]';

          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-start gap-3 rounded-lg border p-3.5 shadow-xl transition-all duration-200 ${borderColor}`}
            >
              {toast.variant === 'error' && (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              )}
              {toast.variant === 'success' && (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#A3FF12]" />
              )}
              {toast.variant === 'info' && (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              )}
              <p className="flex-1 text-sm leading-snug text-slate-100">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
                className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider.');
  return ctx;
}
