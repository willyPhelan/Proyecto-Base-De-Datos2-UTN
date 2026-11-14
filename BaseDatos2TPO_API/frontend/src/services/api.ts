import type {
  Carrito,
  CatalogoProducto,
  Categoria,
  CategoriaRequest,
  ConfiguracionPC,
  ConfiguracionRequest,
  EstadoOrden,
  ItemRequest,
  MetodoPago,
  MetodoPagoRequest,
  OrdenCompra,
  PlantillaPC,
  PlantillaRequest,
  Producto,
  ProductoRequest,
  ReporteVenta,
  ResumenCliente,
  Usuario,
} from '../types/api';
import { ApiError } from './apiError';

export { ApiError };

function resolveBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, '');
  }
  return 'https://localhost:57801';
}

const BASE_URL = resolveBaseUrl();
const REQUEST_TIMEOUT_MS = 2200;

let isDemoMode = false;
const demoListeners = new Set<(demo: boolean) => void>();

function setDemoMode(next: boolean) {
  if (isDemoMode !== next) {
    isDemoMode = next;
    demoListeners.forEach((cb) => cb(next));
  }
}

export function subscribeDemoMode(cb: (demo: boolean) => void): () => void {
  demoListeners.add(cb);
  cb(isDemoMode);
  return () => {
    demoListeners.delete(cb);
  };
}

export function getDemoMode(): boolean {
  return isDemoMode;
}

async function requestApi<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      signal: controller.signal,
    });
    window.clearTimeout(timer);

    if (response.status === 204) {
      setDemoMode(false);
      return undefined as T;
    }

    if (!response.ok) {
      setDemoMode(false);
      if (response.status === 500 && path === '/ordenes/procesar-compra') {
        throw new ApiError(500, 'La compra no está disponible todavía');
      }
      const errorText = (await response.text()).trim();
      throw new ApiError(
        response.status,
        errorText || `Error ${response.status} al procesar la solicitud.`
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      setDemoMode(false);
      return (await response.json()) as T;
    }

    // Si devolvió HTML u otro tipo inesperado, se trata como API no disponible
    throw new Error('La respuesta de la API no es JSON válido.');
  } catch (err) {
    window.clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    // Sin respuesta de la API: no se muestran datos de prueba
    setDemoMode(true);
    throw new ApiError(0, 'Sin conexión con la API.');
  }
}

export const api = {
  // Categorías
  getCategorias: () =>
    requestApi<Categoria[]>('/categorias', undefined),

  createCategoria: (body: CategoriaRequest) =>
    requestApi<Categoria>(
      '/categorias',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  updateCategoria: (id: number, body: CategoriaRequest) =>
    requestApi<Categoria>(
      `/categorias/${id}`,
      { method: 'PUT', body: JSON.stringify(body) }
    ),

  deleteCategoria: (id: number) =>
    requestApi<void>(
      `/categorias/${id}`,
      { method: 'DELETE' }
    ),

  // Productos
  getProductos: (idCategoria?: number) => {
    const qs = idCategoria ? `?idCategoria=${idCategoria}` : '';
    return requestApi<CatalogoProducto[]>(`/productos${qs}`, undefined
    );
  },

  getProducto: (id: number) =>
    requestApi<Producto>(`/productos/${id}`, undefined),

  createProducto: (body: ProductoRequest) =>
    requestApi<Producto>(
      '/productos',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  updateProducto: (id: number, body: ProductoRequest) =>
    requestApi<Producto>(
      `/productos/${id}`,
      { method: 'PUT', body: JSON.stringify(body) }
    ),

  deleteProducto: (id: number) =>
    requestApi<void>(
      `/productos/${id}`,
      { method: 'DELETE' }
    ),

  // Métodos de pago
  getMetodosPago: () =>
    requestApi<MetodoPago[]>('/metodos-pago', undefined),

  createMetodoPago: (body: MetodoPagoRequest) =>
    requestApi<MetodoPago>(
      '/metodos-pago',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  updateMetodoPago: (id: number, body: MetodoPagoRequest) =>
    requestApi<MetodoPago>(
      `/metodos-pago/${id}`,
      { method: 'PUT', body: JSON.stringify(body) }
    ),

  deleteMetodoPago: (id: number) =>
    requestApi<void>(
      `/metodos-pago/${id}`,
      { method: 'DELETE' }
    ),

  // Usuarios
  getUsuarios: () =>
    requestApi<Usuario[]>('/usuarios', undefined),

  getResumenClientes: () =>
    requestApi<ResumenCliente[]>('/usuarios/resumen-clientes', undefined
    ),

  // Carrito
  getCarritoUsuario: async (idUsuario: number): Promise<Carrito | null> => {
    try {
      return await requestApi<Carrito | null>(
        `/carritos/usuario/${idUsuario}`,
        undefined
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  },

  addItemCarrito: (idUsuario: number, body: ItemRequest) =>
    requestApi<Carrito>(
      `/carritos/usuario/${idUsuario}/items`,
      { method: 'POST', body: JSON.stringify(body) }
    ),

  updateItemCarrito: (idUsuario: number, idProducto: number, cantidad: number) =>
    requestApi<Carrito>(
      `/carritos/usuario/${idUsuario}/items/${idProducto}`,
      { method: 'PUT', body: JSON.stringify({ cantidad }) }
    ),

  removeItemCarrito: (idUsuario: number, idProducto: number) =>
    requestApi<void>(
      `/carritos/usuario/${idUsuario}/items/${idProducto}`,
      { method: 'DELETE' }
    ),

  vaciarCarrito: (idUsuario: number) =>
    requestApi<void>(
      `/carritos/usuario/${idUsuario}/items`,
      { method: 'DELETE' }
    ),

  // Órdenes
  getOrdenes: (params?: { idUsuario?: number; estado?: EstadoOrden }) => {
    const query = new URLSearchParams();
    if (params?.idUsuario) query.set('idUsuario', String(params.idUsuario));
    if (params?.estado) query.set('estado', params.estado);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return requestApi<OrdenCompra[]>(`/ordenes${qs}`, undefined
    );
  },

  getOrden: (id: number) =>
    requestApi<OrdenCompra>(`/ordenes/${id}`, undefined),

  procesarCompra: (idUsuario: number, idMetodoPago: number) =>
    requestApi<OrdenCompra>(
      '/ordenes/procesar-compra',
      { method: 'POST', body: JSON.stringify({ idUsuario, idMetodoPago }) }
    ),

  updateEstadoOrden: (id: number, estado: EstadoOrden) =>
    requestApi<OrdenCompra>(
      `/ordenes/${id}/estado`,
      { method: 'PUT', body: JSON.stringify({ estado }) }
    ),

  deleteOrden: (id: number) =>
    requestApi<void>(
      `/ordenes/${id}`,
      { method: 'DELETE' }
    ),

  getReporteVentas: (desde: string, hasta: string) => {
    const query = new URLSearchParams();
    if (desde) query.set('desde', desde);
    if (hasta) query.set('hasta', hasta);
    return requestApi<ReporteVenta[]>(`/ordenes/reporte?${query.toString()}`, undefined
    );
  },

  // Arma tu PC (Configuraciones)
  getConfiguracionesUsuario: (idUsuario: number) =>
    requestApi<ConfiguracionPC[]>(`/configuraciones/usuario/${idUsuario}`, undefined
    ),

  getConfiguracion: (id: number) =>
    requestApi<ConfiguracionPC>(`/configuraciones/${id}`, undefined
    ),

  createConfiguracion: (body: ConfiguracionRequest) =>
    requestApi<ConfiguracionPC>(
      '/configuraciones',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  renameConfiguracion: (id: number, body: ConfiguracionRequest) =>
    requestApi<ConfiguracionPC>(
      `/configuraciones/${id}`,
      { method: 'PUT', body: JSON.stringify(body) }
    ),

  deleteConfiguracion: (id: number) =>
    requestApi<void>(
      `/configuraciones/${id}`,
      { method: 'DELETE' }
    ),

  addProductoConfiguracion: (id: number, body: ItemRequest) =>
    requestApi<ConfiguracionPC>(
      `/configuraciones/${id}/productos`,
      { method: 'POST', body: JSON.stringify(body) }
    ),

  removeProductoConfiguracion: (id: number, idProducto: number) =>
    requestApi<void>(
      `/configuraciones/${id}/productos/${idProducto}`,
      { method: 'DELETE' }
    ),

  // Plantillas PC
  getPlantillas: () =>
    requestApi<PlantillaPC[]>('/plantillas', undefined),

  getPlantilla: (id: number) =>
    requestApi<PlantillaPC>(`/plantillas/${id}`, undefined),

  createPlantilla: (body: PlantillaRequest) =>
    requestApi<PlantillaPC>(
      '/plantillas',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  updatePlantilla: (id: number, body: PlantillaRequest) =>
    requestApi<PlantillaPC>(
      `/plantillas/${id}`,
      { method: 'PUT', body: JSON.stringify(body) }
    ),

  deletePlantilla: (id: number) =>
    requestApi<void>(
      `/plantillas/${id}`,
      { method: 'DELETE' }
    ),

  addProductoPlantilla: (id: number, body: ItemRequest) =>
    requestApi<PlantillaPC>(
      `/plantillas/${id}/productos`,
      { method: 'POST', body: JSON.stringify(body) }
    ),

  removeProductoPlantilla: (id: number, idProducto: number) =>
    requestApi<void>(
      `/plantillas/${id}/productos/${idProducto}`,
      { method: 'DELETE' }
    ),
};
