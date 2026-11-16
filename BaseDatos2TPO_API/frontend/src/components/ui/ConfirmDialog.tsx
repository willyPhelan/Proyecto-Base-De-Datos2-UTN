import { useEffect, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' (rojo) para acciones que borran datos */
  variant?: 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
};

const VARIANTS = {
  warning: {
    icon: 'bg-amber-500/10 text-amber-400',
    button: 'border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25',
  },
  danger: {
    icon: 'bg-red-500/10 text-red-400',
    button: 'border-red-500/40 bg-red-500/15 text-red-200 hover:bg-red-500/25',
  },
};

// Popup de confirmación: se muestra encima de todo (incluido otro popup)
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Volver',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = VARIANTS[variant];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        className="w-full max-w-md rounded-xl border border-[#24293B] bg-[#11131C] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${styles.icon}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 id="confirm-titulo" className="font-display text-lg font-bold text-white">
              {title}
            </h2>
            <div className="mt-2 text-sm leading-relaxed text-slate-300">{message}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#24293B] bg-[#171A26] px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-lg border px-4 py-2 text-xs font-semibold ${styles.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
