import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getDemoMode, subscribeDemoMode } from '../services/api';
import type {
  AppView,
  Carrito,
  CatalogoProducto,
  Categoria,
  MetodoPago,
  Usuario,
} from '../types/api';
import { useToast } from './ToastContext';

const STORAGE_USER_KEY = 'voltforge_id_usuario';

type StoreContextValue = {
  activeView: AppView;
  navigateTo: (view: AppView, productId?: number) => void;
  selectedProductId: number | null;
  usuarios: Usuario[];
  currentUser: Usuario | null;
  setCurrentUserId: (idUsuario: number) => void;
  categorias: Categoria[];
  productos: CatalogoProducto[];
  metodosPago: MetodoPago[];
  carrito: Carrito | null;
  loadingInitial: boolean;
  isDemoMode: boolean;
  retryConnection: () => Promise<void>;
  refreshCatalogo: () => Promise<void>;
  refreshCarrito: () => Promise<void>;
  addToCart: (idProducto: number, cantidad?: number) => Promise<boolean>;
  updateCartQuantity: (idProducto: number, cantidad: number) => Promise<void>;
  removeCartItem: (idProducto: number) => Promise<void>;
  clearCart: () => Promise<void>;
  procesarCompra: (idMetodoPago: number) => Promise<boolean>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readSavedUserId(): number | null {
  try {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    return saved ? Number(saved) : null;
  } catch {
    return null;
  }
}

function writeSavedUserId(id: number): void {
  try {
    localStorage.setItem(STORAGE_USER_KEY, String(id));
  } catch {
    // Ignorar en entornos sin localStorage disponible
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { showToast, showError } = useToast();

  const [activeView, setActiveView] = useState<AppView>('tienda');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => getDemoMode());

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(() => readSavedUserId());

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<CatalogoProducto[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Sin conexión con la API: se descartan los datos cargados para no mostrar nada desactualizado
  useEffect(() => {
    return subscribeDemoMode((offline) => {
      setIsDemoMode(offline);
      if (offline) {
        setUsuarios([]);
        setCategorias([]);
        setProductos([]);
        setMetodosPago([]);
        setCarrito(null);
      }
    });
  }, []);

  const safeUsuarios = Array.isArray(usuarios) ? usuarios : [];
  const currentUser =
    safeUsuarios.find((u) => u.idUsuario === currentUserId) ?? safeUsuarios[0] ?? null;

  const navigateTo = useCallback((view: AppView, productId?: number) => {
    if (productId !== undefined) {
      setSelectedProductId(productId);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setCurrentUserId = useCallback((idUsuario: number) => {
    setCurrentUserIdState(idUsuario);
    writeSavedUserId(idUsuario);
  }, []);

  const refreshCatalogo = useCallback(async () => {
    try {
      const [cats, prods, mps] = await Promise.all([
        api.getCategorias(),
        api.getProductos(),
        api.getMetodosPago(),
      ]);
      setCategorias(Array.isArray(cats) ? cats : []);
      setProductos(Array.isArray(prods) ? prods : []);
      setMetodosPago(Array.isArray(mps) ? mps : []);
    } catch (err) {
      showError(err, 'No se pudo cargar el catálogo.');
    }
  }, [showError]);

  const refreshCarrito = useCallback(async () => {
    if (!currentUser) return;
    try {
      const c = await api.getCarritoUsuario(currentUser.idUsuario);
      setCarrito(c);
    } catch (err) {
      showError(err, 'No se pudo obtener el carrito.');
    }
  }, [currentUser, showError]);

  const retryConnection = useCallback(async () => {
    try {
      const [users, cats, prods, mps] = await Promise.all([
        api.getUsuarios(),
        api.getCategorias(),
        api.getProductos(),
        api.getMetodosPago(),
      ]);
      setUsuarios(Array.isArray(users) ? users : []);
      setCategorias(Array.isArray(cats) ? cats : []);
      setProductos(Array.isArray(prods) ? prods : []);
      setMetodosPago(Array.isArray(mps) ? mps : []);
      if (currentUser) {
        const c = await api.getCarritoUsuario(currentUser.idUsuario);
        setCarrito(c);
      }
    } catch (err) {
      showError(err, 'No se pudo reconectar con la API.');
    }
  }, [currentUser, showError]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setLoadingInitial(true);
      try {
        const [users, cats, prods, mps] = await Promise.all([
          api.getUsuarios(),
          api.getCategorias(),
          api.getProductos(),
          api.getMetodosPago(),
        ]);
        if (!mounted) return;
        const userList = Array.isArray(users) ? users : [];
        setUsuarios(userList);
        setCategorias(Array.isArray(cats) ? cats : []);
        setProductos(Array.isArray(prods) ? prods : []);
        setMetodosPago(Array.isArray(mps) ? mps : []);

        const savedId = readSavedUserId();
        const resolved = userList.find((u) => u.idUsuario === savedId) ?? userList[0];
        if (resolved) {
          setCurrentUserIdState(resolved.idUsuario);
          writeSavedUserId(resolved.idUsuario);
        }
      } catch (err) {
        showError(err, 'Error inicializando datos de la tienda.');
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [showError]);

  useEffect(() => {
    if (currentUser) {
      refreshCarrito();
      if (activeView === 'admin' && currentUser.rol !== 'Administrador') {
        setActiveView('tienda');
      }
    }
  }, [currentUser, refreshCarrito, activeView]);

  const addToCart = useCallback(
    async (idProducto: number, cantidad = 1): Promise<boolean> => {
      if (!currentUser) return false;
      try {
        const updated = await api.addItemCarrito(currentUser.idUsuario, { idProducto, cantidad });
        setCarrito(updated);
        showToast('Producto agregado al carrito.', 'success');
        return true;
      } catch (err) {
        showError(err);
        return false;
      }
    },
    [currentUser, showError, showToast]
  );

  const updateCartQuantity = useCallback(
    async (idProducto: number, cantidad: number) => {
      if (!currentUser) return;
      try {
        const updated = await api.updateItemCarrito(currentUser.idUsuario, idProducto, cantidad);
        setCarrito(updated);
      } catch (err) {
        showError(err);
      }
    },
    [currentUser, showError]
  );

  const removeCartItem = useCallback(
    async (idProducto: number) => {
      if (!currentUser) return;
      try {
        await api.removeItemCarrito(currentUser.idUsuario, idProducto);
        await refreshCarrito();
        showToast('Producto quitado del carrito.', 'info');
      } catch (err) {
        showError(err);
      }
    },
    [currentUser, refreshCarrito, showError, showToast]
  );

  const clearCart = useCallback(async () => {
    if (!currentUser) return;
    try {
      await api.vaciarCarrito(currentUser.idUsuario);
      setCarrito(null);
      showToast('Carrito vaciado.', 'info');
    } catch (err) {
      showError(err);
    }
  }, [currentUser, showError, showToast]);

  const procesarCompra = useCallback(
    async (idMetodoPago: number): Promise<boolean> => {
      if (!currentUser) return false;
      try {
        const orden = await api.procesarCompra(currentUser.idUsuario, idMetodoPago);
        setCarrito(null);
        await refreshCatalogo();
        showToast(`Compra confirmada — Orden #${orden.idOrden}`, 'success');
        navigateTo('ordenes');
        return true;
      } catch (err) {
        showError(err);
        return false;
      }
    },
    [currentUser, navigateTo, refreshCatalogo, showError, showToast]
  );

  return (
    <StoreContext.Provider
      value={{
        activeView,
        navigateTo,
        selectedProductId,
        usuarios,
        currentUser,
        setCurrentUserId,
        categorias,
        productos,
        metodosPago,
        carrito,
        loadingInitial,
        isDemoMode,
        retryConnection,
        refreshCatalogo,
        refreshCarrito,
        addToCart,
        updateCartQuantity,
        removeCartItem,
        clearCart,
        procesarCompra,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider.');
  return ctx;
}
