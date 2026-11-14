import { useEffect, useState } from 'react';
import { ArrowRight, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatARS } from '../../utils/format';

export function CarritoView() {
  const {
    carrito,
    metodosPago,
    currentUser,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    procesarCompra,
    navigateTo,
  } = useStore();

  const [selectedMetodo, setSelectedMetodo] = useState<number>(
    () => metodosPago[0]?.idMetodoPago ?? 0
  );
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (metodosPago.length > 0 && !metodosPago.some((m) => m.idMetodoPago === selectedMetodo)) {
      setSelectedMetodo(metodosPago[0].idMetodoPago);
    }
  }, [metodosPago, selectedMetodo]);

  const items = carrito?.items ?? [];

  const handleCheckout = async () => {
    if (!selectedMetodo) return;
    setPurchasing(true);
    await procesarCompra(selectedMetodo);
    setPurchasing(false);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-[#24293B] bg-[#11131C] p-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-slate-500" strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-2xl font-bold text-white">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Agregá componentes individuales desde la tienda o elegí una PC armada recomendada.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('tienda')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#A3FF12] px-5 py-2.5 text-sm font-semibold text-[#090A0F] hover:bg-[#B8FF47]"
          >
            <span>Explorar tienda</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigateTo('plantillas')}
            className="rounded-lg border border-[#24293B] bg-[#171A26] px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-500"
          >
            Ver PCs Armadas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Carrito de compras
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Cliente activo: {currentUser?.nombre} {currentUser?.apellido}
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Vaciar carrito</span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Lista de items */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.idProducto}
              className="flex flex-col justify-between gap-4 rounded-xl border border-[#24293B] bg-[#11131C] p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => navigateTo('producto', item.idProducto)}
                  className="text-left font-display text-base font-semibold text-white hover:text-[#A3FF12]"
                >
                  {item.producto}
                </button>
                <p className="mt-1 font-mono text-xs text-slate-400 tabular-nums">
                  Unitario: {formatARS(item.precio)}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center rounded-lg border border-[#24293B] bg-[#090A0F]">
                  <button
                    type="button"
                    onClick={() =>
                      item.cantidad <= 1
                        ? removeCartItem(item.idProducto)
                        : updateCartQuantity(item.idProducto, item.cantidad - 1)
                    }
                    aria-label={`Disminuir cantidad de ${item.producto}`}
                    className="flex h-9 w-9 items-center justify-center text-slate-300 hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-semibold text-white tabular-nums">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.idProducto, item.cantidad + 1)}
                    aria-label={`Aumentar cantidad de ${item.producto}`}
                    className="flex h-9 w-9 items-center justify-center text-slate-300 hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="w-28 text-right font-mono text-base font-semibold text-white tabular-nums">
                  {formatARS(item.subtotal)}
                </span>

                <button
                  type="button"
                  onClick={() => removeCartItem(item.idProducto)}
                  aria-label={`Quitar ${item.producto}`}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen y compra */}
        <aside className="rounded-xl border border-[#24293B] bg-[#11131C] p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-white">Resumen de compra</h2>

          <div className="mt-4 space-y-3 border-b border-[#24293B] pb-4 text-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span>Productos ({items.reduce((s, i) => s + i.cantidad, 0)})</span>
              <span className="font-mono tabular-nums">{formatARS(carrito?.total ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between text-white">
              <span className="font-semibold">Total</span>
              <span className="font-mono text-2xl font-bold text-[#A3FF12] tabular-nums">
                {formatARS(carrito?.total ?? 0)}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label
              htmlFor="metodo-pago-select"
              className="flex items-center gap-2 text-xs font-medium text-slate-300"
            >
              <CreditCard className="h-4 w-4 text-[#A3FF12]" aria-hidden="true" />
              <span>Método de pago</span>
            </label>
            <select
              id="metodo-pago-select"
              value={selectedMetodo}
              onChange={(e) => setSelectedMetodo(Number(e.target.value))}
              className="w-full rounded-lg border border-[#24293B] bg-[#090A0F] px-3 py-2.5 text-sm text-slate-100 focus:border-[#A3FF12] focus:outline-none"
            >
              {metodosPago.map((mp) => (
                <option key={mp.idMetodoPago} value={mp.idMetodoPago}>
                  {mp.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={purchasing || !selectedMetodo}
            onClick={handleCheckout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#A3FF12] px-5 py-3 text-sm font-semibold text-[#090A0F] transition-colors hover:bg-[#B8FF47] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{purchasing ? 'Procesando compra...' : 'Comprar'}</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
