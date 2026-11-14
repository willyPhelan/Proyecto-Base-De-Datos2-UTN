import { useState } from 'react';
import { Menu, ShoppingCart, User, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { AppView } from '../../types/api';

export function Header() {
  const {
    activeView,
    navigateTo,
    usuarios,
    currentUser,
    setCurrentUserId,
    carrito,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = carrito?.items.reduce((sum, item) => sum + item.cantidad, 0) ?? 0;
  const isAdmin = currentUser?.rol === 'Administrador';

  const navItems: { id: AppView; label: string }[] = [
    { id: 'tienda', label: 'Tienda' },
    { id: 'plantillas', label: 'PCs Armadas' },
    { id: 'armador', label: 'Arma tu PC' },
    { id: 'ordenes', label: 'Mis Órdenes' },
    ...(isAdmin ? [{ id: 'admin' as AppView, label: 'Admin' }] : []),
  ];

  const handleNavClick = (view: AppView) => {
    navigateTo(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#24293B] bg-[#090A0F]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-8">
          {/* Zona 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('tienda')}
            className="font-display shrink-0 whitespace-nowrap text-xl font-bold tracking-tight text-white transition-colors hover:text-[#A3FF12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12]"
          >
            VOLTFORGE
          </button>

          {/* Zona 2: Navegación principal (desktop) */}
          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-6 md:flex"
          >
            {navItems.map((item) => {
              const active =
                activeView === item.id ||
                (item.id === 'tienda' && activeView === 'producto');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`shrink-0 whitespace-nowrap border-b-2 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12] ${
                    active
                      ? 'border-[#A3FF12] text-[#A3FF12]'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zona 3: Selector de usuario + Carrito */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-[#24293B] bg-[#11131C] px-2.5 py-1.5 sm:flex">
              <User className="h-3.5 w-3.5 shrink-0 text-[#A3FF12]" aria-hidden="true" />
              <label htmlFor="usuario-actual-select" className="sr-only">
                Usuario actual
              </label>
              <select
                id="usuario-actual-select"
                value={currentUser?.idUsuario ?? ''}
                onChange={(e) => setCurrentUserId(Number(e.target.value))}
                className="max-w-[180px] truncate bg-transparent text-xs font-medium text-slate-100 focus:outline-none"
              >
                {usuarios.map((u) => (
                  <option
                    key={u.idUsuario}
                    value={u.idUsuario}
                    className="bg-[#11131C] text-slate-100"
                  >
                    {u.nombre} {u.apellido} ({u.rol})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('carrito')}
              aria-label={`Abrir carrito (${totalItems} productos)`}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12] ${
                activeView === 'carrito'
                  ? 'bg-[#B8FF47] text-[#090A0F]'
                  : 'bg-[#A3FF12] text-[#090A0F] hover:bg-[#B8FF47]'
              }`}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Carrito</span>
              <span className="font-mono tabular-nums">({totalItems})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#24293B] bg-[#11131C] text-slate-200 hover:text-white md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menú desplegable mobile */}
        {mobileMenuOpen && (
          <div className="border-t border-[#24293B] bg-[#11131C] px-4 py-4 md:hidden">
            <div className="mb-4">
              <label
                htmlFor="usuario-actual-mobile"
                className="mb-1.5 block text-xs font-medium text-slate-400"
              >
                Usuario actual
              </label>
              <select
                id="usuario-actual-mobile"
                value={currentUser?.idUsuario ?? ''}
                onChange={(e) => setCurrentUserId(Number(e.target.value))}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-slate-100 focus:border-[#A3FF12] focus:outline-none"
              >
                {usuarios.map((u) => (
                  <option key={u.idUsuario} value={u.idUsuario}>
                    {u.nombre} {u.apellido} ({u.rol})
                  </option>
                ))}
              </select>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                      active
                        ? 'bg-[#A3FF12]/10 text-[#A3FF12]'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
