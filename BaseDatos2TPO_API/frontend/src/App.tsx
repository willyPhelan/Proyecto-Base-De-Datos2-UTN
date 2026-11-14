import { Header } from './components/layout/Header';
import { AdminView } from './components/views/AdminView';
import { ArmadorView } from './components/views/ArmadorView';
import { CarritoView } from './components/views/CarritoView';
import { OrdenesView } from './components/views/OrdenesView';
import { PlantillasView } from './components/views/PlantillasView';
import { ProductoDetailView } from './components/views/ProductoDetailView';
import { SinConexionView } from './components/views/SinConexionView';
import { TiendaView } from './components/views/TiendaView';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';

function AppShell() {
  const { activeView, isDemoMode, loadingInitial } = useStore();

  return (
    <div className="flex min-h-screen flex-col bg-[#090A0F] text-[#F1F5F9]">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {isDemoMode ? (
          <SinConexionView />
        ) : loadingInitial ? (
          <p className="py-20 text-center text-sm text-slate-400">Conectando con la API...</p>
        ) : (
          <>
            {activeView === 'tienda' && <TiendaView />}
            {activeView === 'producto' && <ProductoDetailView />}
            {activeView === 'carrito' && <CarritoView />}
            {activeView === 'ordenes' && <OrdenesView />}
            {activeView === 'plantillas' && <PlantillasView />}
            {activeView === 'armador' && <ArmadorView />}
            {activeView === 'admin' && <AdminView />}
          </>
        )}
      </main>

      <footer className="border-t border-[#24293B] bg-[#090A0F] py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <span className="font-display font-semibold text-slate-300">VOLTFORGE</span>
          <span>Hardware gamer y PCs armadas · Precios expresados en ARS</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </ToastProvider>
  );
}

