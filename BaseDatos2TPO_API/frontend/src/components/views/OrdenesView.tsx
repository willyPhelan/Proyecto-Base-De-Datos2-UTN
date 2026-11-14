import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Package, XCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { EstadoOrden, OrdenCompra } from '../../types/api';
import { formatARS, formatDateTime } from '../../utils/format';

const ESTADOS: ('Todas' | EstadoOrden)[] = ['Todas', 'Pendiente', 'Pagado', 'Cancelado'];

function statusStyle(estado: EstadoOrden): string {
  switch (estado) {
    case 'Pagado':
      return 'text-emerald-400';
    case 'Pendiente':
      return 'text-amber-400';
    case 'Cancelado':
      return 'text-red-400';
  }
}

export function OrdenesView() {
  const { currentUser, refreshCatalogo, navigateTo } = useStore();
  const { showToast, showError } = useToast();

  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState<'Todas' | EstadoOrden>('Todas');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detallesMap, setDetallesMap] = useState<Record<number, OrdenCompra>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const fetchOrdenes = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await api.getOrdenes({
        idUsuario: currentUser.idUsuario,
        estado: estadoFiltro === 'Todas' ? undefined : estadoFiltro,
      });
      setOrdenes(data);
    } catch (err) {
      showError(err, 'No se pudieron cargar tus órdenes.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, estadoFiltro, showError]);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  const toggleExpand = async (idOrden: number) => {
    if (expandedId === idOrden) {
      setExpandedId(null);
      return;
    }
    setExpandedId(idOrden);
    if (!detallesMap[idOrden]) {
      setLoadingDetailId(idOrden);
      try {
        const full = await api.getOrden(idOrden);
        setDetallesMap((prev) => ({ ...prev, [idOrden]: full }));
      } catch (err) {
        showError(err, 'No se pudo cargar el detalle de la orden.');
      } finally {
        setLoadingDetailId(null);
      }
    }
  };

  const handleCancelar = async (idOrden: number) => {
    setCancelingId(idOrden);
    try {
      const updated = await api.updateEstadoOrden(idOrden, 'Cancelado');
      setDetallesMap((prev) => ({ ...prev, [idOrden]: updated }));
      await Promise.all([fetchOrdenes(), refreshCatalogo()]);
      showToast(`Orden #${idOrden} cancelada. Stock reintegrado.`, 'info');
    } catch (err) {
      showError(err);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Mis órdenes
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Historial de compras de {currentUser?.nombre} {currentUser?.apellido}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filtrar órdenes por estado"
          className="flex flex-wrap items-center gap-1.5"
        >
          {ESTADOS.map((est) => {
            const active = estadoFiltro === est;
            return (
              <button
                key={est}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setEstadoFiltro(est)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#A3FF12] text-[#090A0F]'
                    : 'border border-[#24293B] bg-[#11131C] text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {est}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-[#24293B] bg-[#11131C]"
            />
          ))}
        </div>
      ) : ordenes.length === 0 ? (
        <div className="rounded-xl border border-[#24293B] bg-[#11131C] p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-500" strokeWidth={1.5} />
          <p className="mt-3 text-base font-medium text-white">
            No tenés órdenes {estadoFiltro !== 'Todas' ? `en estado ${estadoFiltro}` : 'registradas'}.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('tienda')}
            className="mt-4 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
          >
            Ir a la tienda
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {ordenes.map((orden) => {
            const isExpanded = expandedId === orden.idOrden;
            const detail = detallesMap[orden.idOrden];
            const canCancel = orden.estado !== 'Cancelado';

            return (
              <article
                key={orden.idOrden}
                className="overflow-hidden rounded-xl border border-[#24293B] bg-[#11131C]"
              >
                <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono font-semibold text-white tabular-nums">
                        Orden #{orden.idOrden}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateTime(orden.fechaOrden)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{orden.metodoPago}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${statusStyle(orden.estado)}`}>
                        Estado: {orden.estado}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-lg font-bold text-white tabular-nums">
                      {formatARS(orden.total)}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(orden.idOrden)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#24293B] bg-[#171A26] px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white"
                    >
                      <span>{isExpanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancelingId === orden.idOrden}
                        onClick={() => handleCancelar(orden.idOrden)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>
                          {cancelingId === orden.idOrden ? 'Cancelando...' : 'Cancelar orden'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#24293B] bg-[#090A0F]/60 px-5 py-4">
                    {loadingDetailId === orden.idOrden ? (
                      <p className="text-xs text-slate-400">Cargando detalle de productos...</p>
                    ) : !detail || detail.detalles.length === 0 ? (
                      <p className="text-xs text-slate-400">Sin ítems registrados en la orden.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-[#24293B] text-xs text-slate-400">
                              <th className="py-2 pr-4 font-medium">Producto</th>
                              <th className="px-4 py-2 text-right font-medium">Cant.</th>
                              <th className="px-4 py-2 text-right font-medium">Unitario</th>
                              <th className="py-2 pl-4 text-right font-medium">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#24293B]/60">
                            {detail.detalles.map((d) => (
                              <tr key={d.idDetalleOrden}>
                                <td className="py-2.5 pr-4 font-medium text-slate-200">
                                  {d.producto}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-300 tabular-nums">
                                  {d.cantidad}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-300 tabular-nums">
                                  {formatARS(d.precioUnitario)}
                                </td>
                                <td className="py-2.5 pl-4 text-right font-mono font-semibold text-white tabular-nums">
                                  {formatARS(d.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
