import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  FolderOpen,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { ConfiguracionPC } from '../../types/api';
import { formatARS, formatShortDate } from '../../utils/format';
import { getCategoryVisual } from '../ui/CategoryIconPanel';

export function ArmadorView() {
  const { currentUser, categorias, productos, refreshCarrito, navigateTo } = useStore();
  const { showToast, showError } = useToast();

  // Estado del configurador activo: idCategoria -> idProducto
  const [selectedByCat, setSelectedByCat] = useState<Record<number, number>>({});
  const [buildName, setBuildName] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingToCart, setSendingToCart] = useState(false);

  // Configuraciones guardadas del usuario
  const [savedConfigs, setSavedConfigs] = useState<ConfiguracionPC[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [editingConfig, setEditingConfig] = useState<ConfiguracionPC | null>(null);
  const [renameText, setRenameText] = useState('');
  const [addProdId, setAddProdId] = useState<number>(0);

  const sortedCategorias = useMemo(
    () =>
      [...categorias].sort((a, b) => Number(b.esEsencial) - Number(a.esEsencial)),
    [categorias]
  );

  const loadSaved = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConfigs(true);
    try {
      const list = await api.getConfiguracionesUsuario(currentUser.idUsuario);
      setSavedConfigs(list);
    } catch (err) {
      showError(err, 'No se pudieron cargar tus configuraciones guardadas.');
    } finally {
      setLoadingConfigs(false);
    }
  }, [currentUser, showError]);

  useEffect(() => {
    loadSaved();
    setEditingConfig(null);
  }, [loadSaved]);

  const selectedProducts = useMemo(() => {
    return Object.entries(selectedByCat)
      .map(([, idProd]) => productos.find((p) => p.idProducto === idProd))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [selectedByCat, productos]);

  const totalArmador = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.precio, 0),
    [selectedProducts]
  );

  const handleSelectComponent = (idCategoria: number, idProductoRaw: string) => {
    setSelectedByCat((prev) => {
      const next = { ...prev };
      if (!idProductoRaw) {
        delete next[idCategoria];
      } else {
        next[idCategoria] = Number(idProductoRaw);
      }
      return next;
    });
  };

  const handleGuardarBuild = async () => {
    if (!currentUser) return;
    if (!buildName.trim()) {
      showToast('Escribí un nombre para guardar tu configuración.', 'error');
      return;
    }
    if (selectedProducts.length === 0) {
      showToast('Elegí al menos un componente antes de guardar.', 'error');
      return;
    }

    setSaving(true);
    try {
      const created = await api.createConfiguracion({
        idUsuario: currentUser.idUsuario,
        nombreConfiguracion: buildName.trim(),
        items: selectedProducts.map((p) => ({ idProducto: p.idProducto, cantidad: 1 })),
      });
      setBuildName('');
      setEditingConfig(created);
      setRenameText(created.nombreConfiguracion);
      await loadSaved();
      showToast(`Configuración "${created.nombreConfiguracion}" guardada.`, 'success');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendBuildToCart = async (
    items: { idProducto: number; cantidad: number }[]
  ) => {
    if (!currentUser || items.length === 0) return;
    setSendingToCart(true);
    try {
      for (const item of items) {
        await api.addItemCarrito(currentUser.idUsuario, item);
      }
      await refreshCarrito();
      showToast('Componentes de la PC agregados al carrito.', 'success');
      navigateTo('carrito');
    } catch (err) {
      await refreshCarrito();
      showError(err);
    } finally {
      setSendingToCart(false);
    }
  };

  const handleOpenConfig = async (idConfiguracion: number) => {
    try {
      const full = await api.getConfiguracion(idConfiguracion);
      setEditingConfig(full);
      setRenameText(full.nombreConfiguracion);
      if (productos.length > 0 && !addProdId) {
        setAddProdId(productos[0].idProducto);
      }
    } catch (err) {
      showError(err);
    }
  };

  const handleRenameConfig = async () => {
    if (!currentUser || !editingConfig) return;
    try {
      const updated = await api.renameConfiguracion(editingConfig.idConfiguracion, {
        idUsuario: currentUser.idUsuario,
        nombreConfiguracion: renameText,
        items: [],
      });
      setEditingConfig(updated);
      await loadSaved();
      showToast('Nombre actualizado.', 'success');
    } catch (err) {
      showError(err);
    }
  };

  const handleAddProductoToSaved = async () => {
    if (!editingConfig || !addProdId) return;
    try {
      const updated = await api.addProductoConfiguracion(editingConfig.idConfiguracion, {
        idProducto: addProdId,
        cantidad: 1,
      });
      setEditingConfig(updated);
      await loadSaved();
      showToast('Componente agregado a la configuración.', 'success');
    } catch (err) {
      showError(err);
    }
  };

  const handleRemoveProductoFromSaved = async (idProducto: number) => {
    if (!editingConfig) return;
    try {
      await api.removeProductoConfiguracion(editingConfig.idConfiguracion, idProducto);
      const updated = await api.getConfiguracion(editingConfig.idConfiguracion);
      setEditingConfig(updated);
      await loadSaved();
      showToast('Componente quitado de la configuración.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteConfig = async (idConfiguracion: number) => {
    try {
      await api.deleteConfiguracion(idConfiguracion);
      if (editingConfig?.idConfiguracion === idConfiguracion) {
        setEditingConfig(null);
      }
      await loadSaved();
      showToast('Configuración eliminada.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Sección 1: Armador paso a paso */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-medium text-[#A3FF12]">Configurador por categoría</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
            Arma tu PC
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Elegí un componente por categoría, revisá el total en ARS y guardá tu build o mandala
            directo al carrito.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Selectores por categoría */}
          <div className="space-y-3 lg:col-span-2">
            {sortedCategorias.map((cat) => {
              const { Icon, accentClass } = getCategoryVisual(cat.nombre);
              const catProducts = productos.filter((p) => p.categoria === cat.nombre);
              const selectedId = selectedByCat[cat.idCategoria] ?? '';
              const chosen = catProducts.find((p) => p.idProducto === selectedId);

              return (
                <div
                  key={cat.idCategoria}
                  className="rounded-xl border border-[#24293B] bg-[#11131C] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#24293B] bg-[#090A0F]">
                        <Icon className={`h-5 w-5 ${accentClass}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span>{cat.nombre}</span>
                          <span className="text-xs font-normal text-slate-400">
                            · {cat.esEsencial ? 'Esencial' : 'Opcional'}
                          </span>
                        </div>
                        {chosen && (
                          <p className="mt-0.5 font-mono text-xs text-[#A3FF12] tabular-nums">
                            {formatARS(chosen.precio)} · Stock: {chosen.stock}
                          </p>
                        )}
                      </div>
                    </div>

                    <select
                      aria-label={`Seleccionar ${cat.nombre}`}
                      value={selectedId}
                      onChange={(e) => handleSelectComponent(cat.idCategoria, e.target.value)}
                      className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-slate-100 focus:border-[#A3FF12] focus:outline-none sm:max-w-xs"
                    >
                      <option value="">-- Sin seleccionar --</option>
                      {catProducts.map((prod) => (
                        <option
                          key={prod.idProducto}
                          value={prod.idProducto}
                          disabled={prod.stock <= 0}
                        >
                          {prod.producto} — {formatARS(prod.precio)}
                          {prod.stock <= 0 ? ' (Sin stock)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen lateral del armador */}
          <aside className="space-y-5 rounded-xl border border-[#24293B] bg-[#11131C] p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[#A3FF12]" />
              <h2 className="font-display text-lg font-semibold text-white">
                Tu configuración
              </h2>
            </div>

            {selectedProducts.length === 0 ? (
              <p className="text-xs leading-relaxed text-slate-400">
                Todavía no elegiste componentes. Seleccioná al menos uno de la lista izquierda.
              </p>
            ) : (
              <ul className="divide-y divide-[#24293B] text-xs">
                {selectedProducts.map((p) => (
                  <li key={p.idProducto} className="flex items-center justify-between gap-2 py-2">
                    <span className="truncate text-slate-200">{p.producto}</span>
                    <span className="shrink-0 font-mono text-slate-300 tabular-nums">
                      {formatARS(p.precio)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-[#24293B] pt-4">
              <p className="text-xs text-slate-400">Total estimado</p>
              <p className="mt-0.5 font-mono text-2xl font-bold text-[#A3FF12] tabular-nums">
                {formatARS(totalArmador)}
              </p>
            </div>

            <div className="space-y-2 border-t border-[#24293B] pt-4">
              <label htmlFor="build-name-input" className="block text-xs font-medium text-slate-300">
                Guardar configuración como
              </label>
              <input
                id="build-name-input"
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Ej: Mi PC Stream 1440p"
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-[#A3FF12] focus:outline-none"
              />
              <button
                type="button"
                disabled={saving || selectedProducts.length === 0}
                onClick={handleGuardarBuild}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#A3FF12]/60 bg-[#A3FF12]/10 px-4 py-2.5 text-sm font-semibold text-[#A3FF12] transition-colors hover:bg-[#A3FF12]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Guardando...' : 'Guardar configuración'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={sendingToCart || selectedProducts.length === 0}
              onClick={() =>
                handleSendBuildToCart(
                  selectedProducts.map((p) => ({ idProducto: p.idProducto, cantidad: 1 }))
                )
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#A3FF12] px-4 py-2.5 text-sm font-semibold text-[#090A0F] transition-colors hover:bg-[#B8FF47] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{sendingToCart ? 'Agregando...' : 'Agregar PC al carrito'}</span>
            </button>
          </aside>
        </div>
      </section>

      {/* Sección 2: Configuraciones guardadas */}
      <section className="space-y-5 border-t border-[#24293B] pt-10">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            Mis configuraciones guardadas
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Consultá, editá componentes, renombrá o enviá al carrito tus armado previos.
          </p>
        </div>

        {loadingConfigs ? (
          <div className="h-28 animate-pulse rounded-xl border border-[#24293B] bg-[#11131C]" />
        ) : savedConfigs.length === 0 ? (
          <div className="rounded-xl border border-[#24293B] bg-[#11131C] p-8 text-center text-sm text-slate-400">
            Todavía no guardaste ninguna configuración con {currentUser?.nombre}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Listado */}
            <div className="space-y-3">
              {savedConfigs.map((cfg) => {
                const isSelected = editingConfig?.idConfiguracion === cfg.idConfiguracion;
                return (
                  <div
                    key={cfg.idConfiguracion}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'border-[#A3FF12] bg-[#171A26]'
                        : 'border-[#24293B] bg-[#11131C]'
                    }`}
                  >
                    <div>
                      <h3 className="font-display text-base font-semibold text-white">
                        {cfg.nombreConfiguracion}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-slate-400 tabular-nums">
                        {formatShortDate(cfg.fechaCreacion)} · {formatARS(cfg.total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenConfig(cfg.idConfiguracion)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#A3FF12]"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>Editar / Ver</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteConfig(cfg.idConfiguracion)}
                        aria-label={`Eliminar ${cfg.nombreConfiguracion}`}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Editor de configuración seleccionada */}
            {editingConfig && (
              <div className="space-y-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-[#A3FF12]" />
                  <h3 className="font-display text-base font-semibold text-white">
                    Detalle y edición
                  </h3>
                </div>

                {/* Renombrar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    aria-label="Nombre de la configuración"
                    className="flex-1 rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRenameConfig}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#24293B] bg-[#171A26] px-3 py-2 text-xs font-medium text-white hover:border-[#A3FF12]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Renombrar</span>
                  </button>
                </div>

                {/* Componentes guardados */}
                <div className="divide-y divide-[#24293B] rounded-lg border border-[#24293B] bg-[#090A0F]/60">
                  {editingConfig.detalles.length === 0 ? (
                    <p className="p-3 text-xs text-slate-400">
                      Esta configuración no tiene componentes.
                    </p>
                  ) : (
                    editingConfig.detalles.map((d) => (
                      <div
                        key={d.idProducto}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-200">
                            {d.cantidad > 1 ? `${d.cantidad}x ` : ''}
                            {d.producto}
                          </p>
                          <p className="text-slate-500">{d.categoria}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300 tabular-nums">
                            {formatARS(d.subtotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProductoFromSaved(d.idProducto)}
                            aria-label={`Quitar ${d.producto}`}
                            className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Agregar producto a configuración guardada */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    aria-label="Agregar componente a configuración"
                    value={addProdId}
                    onChange={(e) => setAddProdId(Number(e.target.value))}
                    className="flex-1 rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-xs text-slate-100 focus:border-[#A3FF12] focus:outline-none"
                  >
                    {productos.map((p) => (
                      <option key={p.idProducto} value={p.idProducto}>
                        {p.producto} ({formatARS(p.precio)})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddProductoToSaved}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#24293B] bg-[#171A26] px-3 py-2 text-xs font-medium text-white hover:border-[#A3FF12]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar componente</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#24293B] pt-4">
                  <div>
                    <p className="text-xs text-slate-400">Total guardado</p>
                    <p className="font-mono text-xl font-bold text-[#A3FF12] tabular-nums">
                      {formatARS(editingConfig.total)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={editingConfig.detalles.length === 0 || sendingToCart}
                    onClick={() =>
                      handleSendBuildToCart(
                        editingConfig.detalles.map((d) => ({
                          idProducto: d.idProducto,
                          cantidad: d.cantidad,
                        }))
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47] disabled:opacity-40"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Agregar todo al carrito</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
