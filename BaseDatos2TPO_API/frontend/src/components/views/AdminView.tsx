import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CreditCard,
  Edit2,
  Layers,
  Package,
  Plus,
  ShieldAlert,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type {
  Categoria,
  EstadoOrden,
  MetodoPago,
  OrdenCompra,
  PlantillaPC,
  ReporteVenta,
  ResumenCliente,
} from '../../types/api';
import { formatARS, formatDateTime, formatShortDate } from '../../utils/format';

type AdminTab =
  | 'productos'
  | 'categorias'
  | 'metodos'
  | 'plantillas'
  | 'ordenes'
  | 'reportes';

export function AdminView() {
  const { currentUser, categorias, productos, metodosPago, refreshCatalogo } = useStore();
  const { showToast, showError } = useToast();

  const [tab, setTab] = useState<AdminTab>('productos');

  // --- Estado Productos ---
  const [prodEditingId, setProdEditingId] = useState<number | null>(null);
  const [prodForm, setProdForm] = useState({
    idCategoria: categorias[0]?.idCategoria ?? 1,
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
  });

  // --- Estado Categorías ---
  const [catEditingId, setCatEditingId] = useState<number | null>(null);
  const [catForm, setCatForm] = useState({ nombre: '', esEsencial: true });

  // --- Estado Métodos de pago ---
  const [mpEditingId, setMpEditingId] = useState<number | null>(null);
  const [mpNombre, setMpNombre] = useState('');

  // --- Estado Plantillas ---
  const [plantillas, setPlantillas] = useState<PlantillaPC[]>([]);
  const [plantEditingId, setPlantEditingId] = useState<number | null>(null);
  const [plantForm, setPlantForm] = useState({ nombre: '', descripcion: '' });
  const [plantDetail, setPlantDetail] = useState<PlantillaPC | null>(null);
  const [plantAddProdId, setPlantAddProdId] = useState<number>(0);

  // --- Estado Órdenes globales ---
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);

  // --- Estado Clientes y Reporte ---
  const [clientes, setClientes] = useState<ResumenCliente[]>([]);
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState('2026-12-31');
  const [reporte, setReporte] = useState<ReporteVenta[]>([]);

  useEffect(() => {
    if (categorias.length > 0 && !categorias.some((c) => c.idCategoria === prodForm.idCategoria)) {
      setProdForm((prev) => ({ ...prev, idCategoria: categorias[0].idCategoria }));
    }
  }, [categorias, prodForm.idCategoria]);

  useEffect(() => {
    if (productos.length > 0 && !plantAddProdId) {
      setPlantAddProdId(productos[0].idProducto);
    }
  }, [productos, plantAddProdId]);

  const loadPlantillas = useCallback(async () => {
    try {
      const list = await api.getPlantillas();
      setPlantillas(list);
    } catch (err) {
      showError(err);
    }
  }, [showError]);

  const loadOrdenes = useCallback(async () => {
    try {
      const list = await api.getOrdenes();
      setOrdenes(list);
    } catch (err) {
      showError(err);
    }
  }, [showError]);

  const loadClientesYReporte = useCallback(async () => {
    try {
      const [resClientes, rep] = await Promise.all([
        api.getResumenClientes(),
        api.getReporteVentas(desde, hasta),
      ]);
      setClientes(resClientes);
      setReporte(rep);
    } catch (err) {
      showError(err);
    }
  }, [desde, hasta, showError]);

  useEffect(() => {
    if (tab === 'plantillas') loadPlantillas();
    if (tab === 'ordenes') loadOrdenes();
    if (tab === 'reportes') loadClientesYReporte();
  }, [tab, loadPlantillas, loadOrdenes, loadClientesYReporte]);

  if (currentUser?.rol !== 'Administrador') {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-500/30 bg-[#11131C] p-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
        <h1 className="mt-3 font-display text-xl font-bold text-white">Acceso restringido</h1>
        <p className="mt-1 text-sm text-slate-400">
          Esta sección solo está disponible para usuarios con rol Administrador.
        </p>
      </div>
    );
  }

  // Handlers Productos
  const handleSaveProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      idCategoria: Number(prodForm.idCategoria),
      nombre: prodForm.nombre,
      descripcion: prodForm.descripcion || null,
      precio: Number(prodForm.precio),
      stock: Number(prodForm.stock),
    };
    try {
      if (prodEditingId) {
        await api.updateProducto(prodEditingId, payload);
        showToast('Producto actualizado (y plantillas recalculadas).', 'success');
      } else {
        await api.createProducto(payload);
        showToast('Producto creado.', 'success');
      }
      setProdEditingId(null);
      setProdForm({
        idCategoria: categorias[0]?.idCategoria ?? 1,
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
      });
      await refreshCatalogo();
    } catch (err) {
      showError(err);
    }
  };

  const handleEditProducto = async (idProducto: number) => {
    try {
      const full = await api.getProducto(idProducto);
      setProdEditingId(full.idProducto);
      setProdForm({
        idCategoria: full.idCategoria,
        nombre: full.nombre,
        descripcion: full.descripcion ?? '',
        precio: String(full.precio),
        stock: String(full.stock),
      });
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteProducto = async (idProducto: number) => {
    try {
      await api.deleteProducto(idProducto);
      await refreshCatalogo();
      showToast('Producto dado de baja.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  // Handlers Categorías
  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (catEditingId) {
        await api.updateCategoria(catEditingId, catForm);
        showToast('Categoría actualizada.', 'success');
      } else {
        await api.createCategoria(catForm);
        showToast('Categoría creada.', 'success');
      }
      setCatEditingId(null);
      setCatForm({ nombre: '', esEsencial: true });
      await refreshCatalogo();
    } catch (err) {
      showError(err);
    }
  };

  const handleEditCategoria = (cat: Categoria) => {
    setCatEditingId(cat.idCategoria);
    setCatForm({ nombre: cat.nombre, esEsencial: cat.esEsencial });
  };

  const handleDeleteCategoria = async (idCategoria: number) => {
    try {
      await api.deleteCategoria(idCategoria);
      await refreshCatalogo();
      showToast('Categoría dada de baja.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  // Handlers Métodos de pago
  const handleSaveMetodoPago = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mpEditingId) {
        await api.updateMetodoPago(mpEditingId, { nombre: mpNombre });
        showToast('Método de pago actualizado.', 'success');
      } else {
        await api.createMetodoPago({ nombre: mpNombre });
        showToast('Método de pago creado.', 'success');
      }
      setMpEditingId(null);
      setMpNombre('');
      await refreshCatalogo();
    } catch (err) {
      showError(err);
    }
  };

  const handleEditMetodo = (mp: MetodoPago) => {
    setMpEditingId(mp.idMetodoPago);
    setMpNombre(mp.nombre);
  };

  const handleDeleteMetodo = async (idMetodoPago: number) => {
    try {
      await api.deleteMetodoPago(idMetodoPago);
      await refreshCatalogo();
      showToast('Método de pago eliminado.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  // Handlers Plantillas
  const handleSavePlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (plantEditingId) {
        const updated = await api.updatePlantilla(plantEditingId, {
          nombre: plantForm.nombre,
          descripcion: plantForm.descripcion || null,
          items: [],
        });
        if (plantDetail?.idPlantilla === plantEditingId) {
          setPlantDetail(updated);
        }
        showToast('Plantilla actualizada.', 'success');
      } else {
        const created = await api.createPlantilla({
          nombre: plantForm.nombre,
          descripcion: plantForm.descripcion || null,
          items: [],
        });
        setPlantDetail(created);
        showToast('Plantilla creada. Ahora podés agregarle componentes.', 'success');
      }
      setPlantEditingId(null);
      setPlantForm({ nombre: '', descripcion: '' });
      await loadPlantillas();
    } catch (err) {
      showError(err);
    }
  };

  const handleInspectPlantilla = async (idPlantilla: number) => {
    try {
      const full = await api.getPlantilla(idPlantilla);
      setPlantDetail(full);
    } catch (err) {
      showError(err);
    }
  };

  const handleAddPlantillaProd = async () => {
    if (!plantDetail || !plantAddProdId) return;
    try {
      const updated = await api.addProductoPlantilla(plantDetail.idPlantilla, {
        idProducto: plantAddProdId,
        cantidad: 1,
      });
      setPlantDetail(updated);
      await loadPlantillas();
      showToast('Componente agregado a la plantilla.', 'success');
    } catch (err) {
      showError(err);
    }
  };

  const handleRemovePlantillaProd = async (idProducto: number) => {
    if (!plantDetail) return;
    try {
      await api.removeProductoPlantilla(plantDetail.idPlantilla, idProducto);
      const updated = await api.getPlantilla(plantDetail.idPlantilla);
      setPlantDetail(updated);
      await loadPlantillas();
      showToast('Componente quitado de la plantilla.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  const handleDeletePlantilla = async (idPlantilla: number) => {
    try {
      await api.deletePlantilla(idPlantilla);
      if (plantDetail?.idPlantilla === idPlantilla) setPlantDetail(null);
      await loadPlantillas();
      showToast('Plantilla dada de baja.', 'info');
    } catch (err) {
      showError(err);
    }
  };

  // Handlers Órdenes
  const handleChangeEstadoOrden = async (idOrden: number, estado: EstadoOrden) => {
    try {
      await api.updateEstadoOrden(idOrden, estado);
      await Promise.all([loadOrdenes(), refreshCatalogo()]);
      showToast(`Orden #${idOrden} marcada como ${estado}.`, 'success');
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteOrden = async (idOrden: number) => {
    try {
      await api.deleteOrden(idOrden);
      await Promise.all([loadOrdenes(), refreshCatalogo()]);
      showToast(`Orden #${idOrden} eliminada.`, 'info');
    } catch (err) {
      showError(err);
    }
  };

  const totalReporte = useMemo(
    () => reporte.reduce((sum, r) => sum + r.total, 0),
    [reporte]
  );

  const tabs: { id: AdminTab; label: string; Icon: typeof Package }[] = [
    { id: 'productos', label: 'Productos', Icon: Package },
    { id: 'categorias', label: 'Categorías', Icon: Tag },
    { id: 'metodos', label: 'Métodos de Pago', Icon: CreditCard },
    { id: 'plantillas', label: 'Plantillas PC', Icon: Layers },
    { id: 'ordenes', label: 'Órdenes', Icon: Users },
    { id: 'reportes', label: 'Clientes y Ventas', Icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-[#A3FF12]">Consola de administración</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
          Panel Admin
        </h1>
      </div>

      {/* Sub-navegación */}
      <div
        role="tablist"
        aria-label="Secciones de administración"
        className="flex flex-wrap gap-2 border-b border-[#24293B] pb-4"
      >
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'bg-[#A3FF12] text-[#090A0F]'
                  : 'border border-[#24293B] bg-[#11131C] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTOS */}
      {tab === 'productos' && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <form
            onSubmit={handleSaveProducto}
            className="space-y-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5"
          >
            <h2 className="font-display text-base font-semibold text-white">
              {prodEditingId ? `Editar producto #${prodEditingId}` : 'Nuevo producto'}
            </h2>

            <div>
              <label className="mb-1 block text-xs text-slate-300">Categoría</label>
              <select
                value={prodForm.idCategoria}
                onChange={(e) =>
                  setProdForm((p) => ({ ...p, idCategoria: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              >
                {categorias.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">Nombre</label>
              <input
                type="text"
                required
                value={prodForm.nombre}
                onChange={(e) => setProdForm((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">Descripción</label>
              <textarea
                rows={3}
                value={prodForm.descripcion}
                onChange={(e) => setProdForm((p) => ({ ...p, descripcion: e.target.value }))}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-slate-300">Precio (ARS)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={prodForm.precio}
                  onChange={(e) => setProdForm((p) => ({ ...p, precio: e.target.value }))}
                  className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 font-mono text-sm text-white focus:border-[#A3FF12] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">Stock</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={prodForm.stock}
                  onChange={(e) => setProdForm((p) => ({ ...p, stock: e.target.value }))}
                  className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 font-mono text-sm text-white focus:border-[#A3FF12] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
              >
                {prodEditingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              {prodEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setProdEditingId(null);
                    setProdForm({
                      idCategoria: categorias[0]?.idCategoria ?? 1,
                      nombre: '',
                      descripcion: '',
                      precio: '',
                      stock: '',
                    });
                  }}
                  className="rounded-lg border border-[#24293B] px-3 py-2 text-xs text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C] lg:col-span-2">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#24293B] text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 text-right font-medium">Precio</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24293B]">
                {productos.map((p) => (
                  <tr key={p.idProducto} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{p.producto}</td>
                    <td className="px-4 py-3 text-slate-400">{p.categoria}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200 tabular-nums">
                      {formatARS(p.precio)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      <span className={p.stock <= 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditProducto(p.idProducto)}
                          aria-label={`Editar ${p.producto}`}
                          className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProducto(p.idProducto)}
                          aria-label={`Eliminar ${p.producto}`}
                          className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORÍAS */}
      {tab === 'categorias' && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <form
            onSubmit={handleSaveCategoria}
            className="space-y-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5"
          >
            <h2 className="font-display text-base font-semibold text-white">
              {catEditingId ? `Editar categoría #${catEditingId}` : 'Nueva categoría'}
            </h2>
            <div>
              <label className="mb-1 block text-xs text-slate-300">Nombre</label>
              <input
                type="text"
                required
                value={catForm.nombre}
                onChange={(e) => setCatForm((c) => ({ ...c, nombre: e.target.value }))}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={catForm.esEsencial}
                onChange={(e) => setCatForm((c) => ({ ...c, esEsencial: e.target.checked }))}
                className="h-4 w-4 rounded border-[#24293B] bg-[#090A0F] accent-[#A3FF12]"
              />
              <span>Esencial para armar PC</span>
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
              >
                {catEditingId ? 'Guardar cambios' : 'Crear categoría'}
              </button>
              {catEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setCatEditingId(null);
                    setCatForm({ nombre: '', esEsencial: true });
                  }}
                  className="rounded-lg border border-[#24293B] px-3 py-2 text-xs text-slate-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C] lg:col-span-2">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#24293B] text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24293B]">
                {categorias.map((c) => (
                  <tr key={c.idCategoria} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">
                      #{c.idCategoria}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{c.nombre}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {c.esEsencial ? 'Esencial' : 'Opcional'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditCategoria(c)}
                          className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategoria(c.idCategoria)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MÉTODOS DE PAGO */}
      {tab === 'metodos' && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <form
            onSubmit={handleSaveMetodoPago}
            className="space-y-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5"
          >
            <h2 className="font-display text-base font-semibold text-white">
              {mpEditingId ? `Editar método #${mpEditingId}` : 'Nuevo método de pago'}
            </h2>
            <div>
              <label className="mb-1 block text-xs text-slate-300">Nombre</label>
              <input
                type="text"
                required
                value={mpNombre}
                onChange={(e) => setMpNombre(e.target.value)}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
              >
                {mpEditingId ? 'Guardar cambios' : 'Crear método'}
              </button>
              {mpEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setMpEditingId(null);
                    setMpNombre('');
                  }}
                  className="rounded-lg border border-[#24293B] px-3 py-2 text-xs text-slate-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C] lg:col-span-2">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#24293B] text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24293B]">
                {metodosPago.map((m) => (
                  <tr key={m.idMetodoPago} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">
                      #{m.idMetodoPago}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{m.nombre}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditMetodo(m)}
                          className="rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMetodo(m.idMetodoPago)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLANTILLAS PC */}
      {tab === 'plantillas' && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <form
            onSubmit={handleSavePlantilla}
            className="space-y-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5"
          >
            <h2 className="font-display text-base font-semibold text-white">
              {plantEditingId ? `Editar plantilla #${plantEditingId}` : 'Nueva plantilla PC'}
            </h2>
            <div>
              <label className="mb-1 block text-xs text-slate-300">Nombre</label>
              <input
                type="text"
                required
                value={plantForm.nombre}
                onChange={(e) => setPlantForm((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-300">Descripción</label>
              <textarea
                rows={3}
                value={plantForm.descripcion}
                onChange={(e) => setPlantForm((p) => ({ ...p, descripcion: e.target.value }))}
                className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-sm text-white focus:border-[#A3FF12] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
              >
                {plantEditingId ? 'Actualizar datos' : 'Crear plantilla'}
              </button>
              {plantEditingId && (
                <button
                  type="button"
                  onClick={() => {
                    setPlantEditingId(null);
                    setPlantForm({ nombre: '', descripcion: '' });
                  }}
                  className="rounded-lg border border-[#24293B] px-3 py-2 text-xs text-slate-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#24293B] text-xs text-slate-400">
                    <th className="px-4 py-3 font-medium">Plantilla</th>
                    <th className="px-4 py-3 text-right font-medium">Total calculado</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24293B]">
                  {plantillas.map((p) => (
                    <tr key={p.idPlantilla} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{p.nombre}</p>
                        {p.descripcion && (
                          <p className="line-clamp-1 text-xs text-slate-400">{p.descripcion}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-white tabular-nums">
                        {formatARS(p.precioTotalCalculado)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInspectPlantilla(p.idPlantilla)}
                            className="rounded border border-[#24293B] bg-[#171A26] px-2.5 py-1 text-xs text-slate-200 hover:border-[#A3FF12]"
                          >
                            Componentes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPlantEditingId(p.idPlantilla);
                              setPlantForm({
                                nombre: p.nombre,
                                descripcion: p.descripcion ?? '',
                              });
                            }}
                            className="rounded p-1.5 text-slate-300 hover:bg-white/10"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePlantilla(p.idPlantilla)}
                            className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {plantDetail && (
              <div className="space-y-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">
                      Componentes de {plantDetail.nombre}
                    </h3>
                    <p className="font-mono text-xs text-[#A3FF12] tabular-nums">
                      Total recalculado: {formatARS(plantDetail.precioTotalCalculado)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={plantAddProdId}
                    onChange={(e) => setPlantAddProdId(Number(e.target.value))}
                    className="flex-1 rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-[#A3FF12] focus:outline-none"
                  >
                    {productos.map((p) => (
                      <option key={p.idProducto} value={p.idProducto}>
                        {p.producto} — {formatARS(p.precio)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddPlantillaProd}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#A3FF12] px-3.5 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar componente</span>
                  </button>
                </div>

                <div className="divide-y divide-[#24293B] rounded-lg border border-[#24293B] bg-[#090A0F]/60">
                  {plantDetail.detalles.length === 0 ? (
                    <p className="p-3 text-xs text-slate-400">Sin componentes asignados.</p>
                  ) : (
                    plantDetail.detalles.map((d) => (
                      <div
                        key={d.idProducto}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                      >
                        <span className="truncate text-slate-200">
                          {d.cantidad > 1 ? `${d.cantidad}x ` : ''}
                          {d.producto} ({d.categoria})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300 tabular-nums">
                            {formatARS(d.subtotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePlantillaProd(d.idProducto)}
                            className="rounded p-1 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ÓRDENES */}
      {tab === 'ordenes' && (
        <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#24293B] text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24293B]">
              {ordenes.map((o) => (
                <tr key={o.idOrden} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-white tabular-nums">#{o.idOrden}</td>
                  <td className="px-4 py-3 text-slate-200">{o.cliente}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(o.fechaOrden)}</td>
                  <td className="px-4 py-3 text-slate-300">{o.metodoPago}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        o.estado === 'Pagado'
                          ? 'text-emerald-400'
                          : o.estado === 'Pendiente'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {o.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-white tabular-nums">
                    {formatARS(o.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {o.estado === 'Pendiente' && (
                        <button
                          type="button"
                          onClick={() => handleChangeEstadoOrden(o.idOrden, 'Pagado')}
                          className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                        >
                          Marcar Pagado
                        </button>
                      )}
                      {o.estado !== 'Cancelado' && (
                        <button
                          type="button"
                          onClick={() => handleChangeEstadoOrden(o.idOrden, 'Cancelado')}
                          className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteOrden(o.idOrden)}
                        aria-label={`Eliminar orden #${o.idOrden}`}
                        className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: CLIENTES Y REPORTE DE VENTAS */}
      {tab === 'reportes' && (
        <div className="space-y-10">
          {/* Reporte de ventas entre dos fechas */}
          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#24293B] bg-[#11131C] p-5 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  Reporte de ventas (órdenes pagadas)
                </h2>
                <p className="mt-1 font-mono text-sm text-[#A3FF12] tabular-nums">
                  Total en rango: {formatARS(totalReporte)} · {reporte.length} operaciones
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Desde</label>
                  <input
                    type="date"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                    className="rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-1.5 font-mono text-xs text-white focus:border-[#A3FF12] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Hasta</label>
                  <input
                    type="date"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                    className="rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-1.5 font-mono text-xs text-white focus:border-[#A3FF12] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadClientesYReporte}
                  className="rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
                >
                  Consultar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#24293B] text-xs text-slate-400">
                    <th className="px-4 py-3 font-medium">Orden</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Método de pago</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24293B]">
                  {reporte.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-400">
                        Sin ventas pagadas en el período seleccionado.
                      </td>
                    </tr>
                  ) : (
                    reporte.map((r) => (
                      <tr key={r.idOrden}>
                        <td className="px-4 py-3 font-mono text-white tabular-nums">
                          #{r.idOrden}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300 tabular-nums">
                          {formatShortDate(r.fechaOrden)}
                        </td>
                        <td className="px-4 py-3 text-slate-200">{r.nombreCliente}</td>
                        <td className="px-4 py-3 text-slate-300">{r.metodoPago}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-white tabular-nums">
                          {formatARS(r.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Resumen de clientes */}
          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-white">
              Resumen de clientes
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#24293B] bg-[#11131C]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#24293B] text-xs text-slate-400">
                    <th className="px-4 py-3 font-medium">Usuario</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 text-right font-medium">Total gastado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24293B]">
                  {clientes.map((c) => (
                    <tr key={c.idUsuario}>
                      <td className="px-4 py-3 font-medium text-white">
                        {c.nombre} {c.apellido}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{c.email}</td>
                      <td className="px-4 py-3 text-slate-300">{c.rol}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#A3FF12] tabular-nums">
                        {formatARS(c.totalGastado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
