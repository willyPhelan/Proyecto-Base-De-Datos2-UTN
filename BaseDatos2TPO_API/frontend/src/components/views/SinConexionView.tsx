import { useState } from 'react';
import { RefreshCw, ServerOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

// Se muestra en lugar de cualquier pantalla cuando la API no responde: no hay datos de prueba
export function SinConexionView() {
  const { retryConnection } = useStore();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retryConnection();
    setRetrying(false);
  };

  return (
    <section
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-xl border border-[#24293B] bg-[#11131C] px-6 py-14 text-center"
    >
      <ServerOff className="h-12 w-12 text-red-400" aria-hidden="true" />
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-slate-100">Sin conexión con la API</h1>
        <p className="text-sm text-slate-400">
          No se pudo conectar con el servidor. Verificá que la Web API esté levantada y volvé a intentar.
        </p>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        className="inline-flex items-center gap-2 rounded-lg bg-[#A3FF12] px-5 py-2.5 text-sm font-semibold text-[#090A0F] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{retrying ? 'Conectando...' : 'Reintentar conexión'}</span>
      </button>
    </section>
  );
}
