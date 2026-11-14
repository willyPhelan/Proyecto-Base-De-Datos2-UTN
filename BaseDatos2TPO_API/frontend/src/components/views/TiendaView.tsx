import { useMemo, useState } from 'react';
import { ArrowRight, Cpu, Search, ShoppingCart, Wrench } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatARS } from '../../utils/format';
import { CategoryIconPanel } from '../ui/CategoryIconPanel';

export function TiendaView() {
  const {
    categorias,
    productos,
    loadingInitial,
    addToCart,
    navigateTo,
  } = useStore();

  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);

  const filteredProductos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return productos.filter((p) => {
      const matchCat = selectedCategoria === 'Todas' || p.categoria === selectedCategoria;
      const matchSearch =
        !q ||
        p.producto.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [productos, selectedCategoria, searchQuery]);

  const handleQuickAdd = async (idProducto: number) => {
    setAddingId(idProducto);
    await addToCart(idProducto, 1);
    setAddingId(null);
  };

  return (
    <div className="space-y-10">
      {/* Hero Showcase */}
      <section className="relative overflow-hidden rounded-xl border border-[#24293B] bg-[#11131C] p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(163,255,18,0.12),transparent_55%)]" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium tracking-wide text-[#A3FF12]">
              Hardware de alto rendimiento · Envíos a todo el país
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-5xl">
              Componentes de precisión para tu próximo rig gamer
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Explorá procesadores, placas de video, memorias DDR5 y almacenamiento NVMe con stock
              actualizado, precios en pesos argentinos y armado a medida por categoría.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigateTo('armador')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#A3FF12] px-5 py-2.5 text-sm font-semibold text-[#090A0F] transition-colors hover:bg-[#B8FF47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12]"
              >
                <Wrench className="h-4 w-4" aria-hidden="true" />
                <span>Arma tu PC a medida</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('plantillas')}
                className="inline-flex items-center gap-2 rounded-lg border border-[#24293B] bg-[#171A26] px-5 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:border-[#A3FF12]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12]"
              >
                <span>Ver PCs Armadas</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="hidden shrink-0 rounded-xl border border-[#24293B] bg-[#090A0F]/80 p-6 lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-3">
            <Cpu className="h-16 w-16 text-[#A3FF12]" strokeWidth={1.3} aria-hidden="true" />
            <div className="text-center">
              <p className="font-mono text-lg font-semibold text-white tabular-nums">
                {productos.length} componentes
              </p>
              <p className="text-xs text-slate-400">
                {categorias.length} categorías activas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros y búsqueda */}
      <section aria-label="Catálogo de componentes" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar GPU, procesador, RAM..."
              aria-label="Buscar componentes"
              className="w-full rounded-lg border border-[#24293B] bg-[#11131C] py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-[#A3FF12] focus:outline-none"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filtrar por categoría"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategoria === 'Todas'}
              onClick={() => setSelectedCategoria('Todas')}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategoria === 'Todas'
                  ? 'bg-[#A3FF12] text-[#090A0F]'
                  : 'border border-[#24293B] bg-[#11131C] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              Todas
            </button>
            {categorias.map((cat) => {
              const active = selectedCategoria === cat.nombre;
              return (
                <button
                  key={cat.idCategoria}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategoria(cat.nombre)}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#A3FF12] text-[#090A0F]'
                      : 'border border-[#24293B] bg-[#11131C] text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grilla de productos */}
        {loadingInitial ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 animate-pulse rounded-xl border border-[#24293B] bg-[#11131C] p-5"
              />
            ))}
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="rounded-xl border border-[#24293B] bg-[#11131C] p-12 text-center">
            <p className="text-base font-medium text-slate-200">
              No encontramos productos para esa búsqueda.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Probá limpiando el filtro de categoría o buscando otro componente.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoria('Todas');
                setSearchQuery('');
              }}
              className="mt-4 rounded-lg border border-[#24293B] bg-[#171A26] px-4 py-2 text-xs font-medium text-white hover:border-[#A3FF12]"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProductos.map((prod) => {
              const outOfStock = prod.stock <= 0;
              return (
                <article
                  key={prod.idProducto}
                  className="group flex flex-col justify-between rounded-xl border border-[#24293B] bg-[#11131C] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A3FF12]/60"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => navigateTo('producto', prod.idProducto)}
                      className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A3FF12]"
                    >
                      <CategoryIconPanel category={prod.categoria} size="md" />
                    </button>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-300">{prod.categoria}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-mono tabular-nums ${
                          outOfStock ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {outOfStock ? 'Sin stock' : `Stock: ${prod.stock}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo('producto', prod.idProducto)}
                      className="mt-1.5 block w-full text-left focus-visible:outline-none"
                    >
                      <h2 className="font-display text-base font-semibold leading-snug text-white transition-colors group-hover:text-[#A3FF12]">
                        {prod.producto}
                      </h2>
                    </button>

                    {prod.descripcion && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {prod.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#24293B] pt-4">
                    <span className="font-mono text-lg font-semibold text-white tabular-nums">
                      {formatARS(prod.precio)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigateTo('producto', prod.idProducto)}
                        className="rounded-lg border border-[#24293B] bg-[#171A26] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                      >
                        Detalle
                      </button>
                      <button
                        type="button"
                        disabled={outOfStock || addingId === prod.idProducto}
                        onClick={() => handleQuickAdd(prod.idProducto)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#A3FF12] px-3.5 py-2 text-xs font-semibold text-[#090A0F] transition-colors hover:bg-[#B8FF47] disabled:cursor-not-allowed disabled:bg-[#171A26] disabled:text-slate-500"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {outOfStock
                            ? 'Sin stock'
                            : addingId === prod.idProducto
                            ? 'Agregando...'
                            : 'Agregar'}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
