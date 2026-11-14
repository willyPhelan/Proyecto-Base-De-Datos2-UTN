import { useEffect, useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Producto } from '../../types/api';
import { formatARS } from '../../utils/format';
import { CategoryIconPanel } from '../ui/CategoryIconPanel';

export function ProductoDetailView() {
  const { selectedProductId, categorias, navigateTo, addToCart } = useStore();
  const { showError } = useToast();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!selectedProductId) return;
      setLoading(true);
      try {
        const data = await api.getProducto(selectedProductId);
        if (mounted) {
          setProducto(data);
          setCantidad(1);
        }
      } catch (err) {
        showError(err, 'No se pudo cargar el detalle del producto.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [selectedProductId, showError]);

  const categoriaNombre =
    categorias.find((c) => c.idCategoria === producto?.idCategoria)?.nombre ?? 'Hardware';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-[#11131C]" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-xl border border-[#24293B] bg-[#11131C]" />
          <div className="h-80 animate-pulse rounded-xl border border-[#24293B] bg-[#11131C]" />
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="rounded-xl border border-[#24293B] bg-[#11131C] p-10 text-center">
        <p className="text-base font-medium text-white">Producto no encontrado.</p>
        <button
          type="button"
          onClick={() => navigateTo('tienda')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#A3FF12] px-4 py-2 text-xs font-semibold text-[#090A0F]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la tienda</span>
        </button>
      </div>
    );
  }

  const outOfStock = producto.stock <= 0;

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(producto.idProducto, cantidad);
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigateTo('tienda')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-[#A3FF12]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al catálogo</span>
      </button>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
        {/* Panel visual por categoría */}
        <div className="lg:sticky lg:top-24">
          <CategoryIconPanel category={categoriaNombre} size="lg" />
        </div>

        {/* Módulo de compra */}
        <div className="space-y-6 rounded-xl border border-[#24293B] bg-[#11131C] p-6 sm:p-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-[#A3FF12]">{categoriaNombre}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Código #{producto.idProducto}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`font-mono tabular-nums ${
                  outOfStock ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {outOfStock ? 'Sin stock disponible' : `${producto.stock} unidades disponibles`}
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-white text-balance sm:text-3xl">
              {producto.nombre}
            </h1>
          </div>

          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            {producto.descripcion || 'Componente de hardware gamer certificado con garantía oficial.'}
          </p>

          <div className="border-y border-[#24293B] py-5">
            <p className="text-xs text-slate-400">Precio unitario</p>
            <p className="mt-1 font-mono text-3xl font-bold text-white tabular-nums">
              {formatARS(producto.precio)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-[#24293B] bg-[#090A0F]">
              <button
                type="button"
                disabled={outOfStock || cantidad <= 1}
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                aria-label="Disminuir cantidad"
                className="flex h-11 w-11 items-center justify-center text-slate-300 hover:text-white disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-mono text-sm font-semibold text-white tabular-nums">
                {outOfStock ? 0 : cantidad}
              </span>
              <button
                type="button"
                disabled={outOfStock || cantidad >= producto.stock}
                onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                aria-label="Aumentar cantidad"
                className="flex h-11 w-11 items-center justify-center text-slate-300 hover:text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={outOfStock || adding}
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#A3FF12] px-6 py-3 text-sm font-semibold text-[#090A0F] transition-colors hover:bg-[#B8FF47] disabled:cursor-not-allowed disabled:bg-[#171A26] disabled:text-slate-500"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span>
                {outOfStock
                  ? 'Sin stock'
                  : adding
                  ? 'Agregando al carrito...'
                  : 'Agregar al carrito'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
