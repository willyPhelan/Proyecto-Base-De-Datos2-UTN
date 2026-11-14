import { useEffect, useState } from 'react';
import { Layers, Monitor, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { PlantillaPC } from '../../types/api';
import { formatARS } from '../../utils/format';
import { getCategoryVisual } from '../ui/CategoryIconPanel';

export function PlantillasView() {
  const { currentUser, refreshCarrito, navigateTo } = useStore();
  const { showToast, showError } = useToast();

  const [plantillas, setPlantillas] = useState<PlantillaPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const list = await api.getPlantillas();
        const hydrated = await Promise.all(list.map((p) => api.getPlantilla(p.idPlantilla)));
        if (mounted) setPlantillas(hydrated);
      } catch (err) {
        showError(err, 'No se pudieron cargar las PCs armadas.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [showError]);

  const handleAgregarTodo = async (plantilla: PlantillaPC) => {
    if (!currentUser) return;
    if (plantilla.detalles.length === 0) {
      showToast('Esta plantilla todavía no tiene componentes asignados.', 'info');
      return;
    }

    setAddingId(plantilla.idPlantilla);
    try {
      for (const item of plantilla.detalles) {
        await api.addItemCarrito(currentUser.idUsuario, {
          idProducto: item.idProducto,
          cantidad: item.cantidad,
        });
      }
      await refreshCarrito();
      showToast(`"${plantilla.nombre}" agregada al carrito.`, 'success');
      navigateTo('carrito');
    } catch (err) {
      await refreshCarrito();
      showError(err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#A3FF12]">Equipos recomendados</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
            PCs Armadas
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configuraciones equilibradas listas para agregar completas al carrito en un solo clic.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-xl border border-[#24293B] bg-[#11131C]"
            />
          ))}
        </div>
      ) : plantillas.length === 0 ? (
        <div className="rounded-xl border border-[#24293B] bg-[#11131C] p-12 text-center">
          <Monitor className="mx-auto h-10 w-10 text-slate-500" strokeWidth={1.5} />
          <p className="mt-3 text-base font-medium text-white">
            No hay PCs armadas publicadas en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {plantillas.map((p) => {
            const totalCalculado =
              p.precioTotalCalculado ?? p.detalles.reduce((s, d) => s + d.subtotal, 0);

            return (
              <article
                key={p.idPlantilla}
                className="flex flex-col justify-between rounded-xl border border-[#24293B] bg-[#11131C] p-6 transition-colors hover:border-[#A3FF12]/50"
              >
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#24293B] bg-gradient-to-br from-[#171A26] via-[#11131C] to-[#090A0F]">
                      <Layers className="h-8 w-8 text-[#A3FF12]" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400">
                        {p.detalles.length} componentes seleccionados
                      </p>
                      <h2 className="mt-0.5 font-display text-xl font-bold text-white">
                        {p.nombre}
                      </h2>
                      {p.descripcion && (
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">
                          {p.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lista de componentes */}
                  <div className="divide-y divide-[#24293B] rounded-lg border border-[#24293B] bg-[#090A0F]/60">
                    {p.detalles.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400">
                        Sin componentes asignados todavía.
                      </p>
                    ) : (
                      p.detalles.map((item) => {
                        const { Icon, accentClass } = getCategoryVisual(item.categoria);
                        return (
                          <div
                            key={`${p.idPlantilla}-${item.idProducto}`}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs sm:text-sm"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <Icon className={`h-4 w-4 shrink-0 ${accentClass}`} />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-200">
                                  {item.cantidad > 1 ? `${item.cantidad}x ` : ''}
                                  {item.producto}
                                </p>
                                <p className="text-xs text-slate-500">{item.categoria}</p>
                              </div>
                            </div>
                            <span className="shrink-0 font-mono text-slate-300 tabular-nums">
                              {formatARS(item.subtotal)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#24293B] pt-5">
                  <div>
                    <p className="text-xs text-slate-400">Precio total del equipo</p>
                    <p className="font-mono text-2xl font-bold text-white tabular-nums">
                      {formatARS(totalCalculado)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={addingId === p.idPlantilla || p.detalles.length === 0}
                    onClick={() => handleAgregarTodo(p)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#A3FF12] px-5 py-2.5 text-sm font-semibold text-[#090A0F] transition-colors hover:bg-[#B8FF47] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {addingId === p.idPlantilla
                        ? 'Agregando...'
                        : 'Agregar todo al carrito'}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
