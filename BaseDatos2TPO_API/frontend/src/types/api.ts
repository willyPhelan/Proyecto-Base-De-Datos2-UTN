export type Categoria = {
  idCategoria: number;
  nombre: string;
  esEsencial: boolean;
  activo: boolean;
};

export type Producto = {
  idProducto: number;
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  activo: boolean;
};

export type CatalogoProducto = {
  idProducto: number;
  producto: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoria: string;
};

export type MetodoPago = {
  idMetodoPago: number;
  nombre: string;
  activo: boolean;
};

export type RolUsuario = 'Cliente' | 'Administrador';

export type Usuario = {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
};

export type ResumenCliente = Usuario & {
  totalGastado: number;
};

export type DetalleCarrito = {
  idDetalleCarrito: number;
  idCarrito: number;
  idProducto: number;
  producto: string;
  precio: number;
  cantidad: number;
  subtotal: number;
};

export type Carrito = {
  idCarrito: number;
  idUsuario: number;
  fechaCreacion: string;
  items: DetalleCarrito[];
  total: number;
};

export type EstadoOrden = 'Pendiente' | 'Pagado' | 'Cancelado';

export type DetalleOrden = {
  idDetalleOrden: number;
  idOrden: number;
  idProducto: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type OrdenCompra = {
  idOrden: number;
  idUsuario: number;
  cliente: string;
  idMetodoPago: number;
  metodoPago: string;
  fechaOrden: string;
  total: number;
  estado: EstadoOrden;
  detalles: DetalleOrden[];
};

export type ReporteVenta = {
  idOrden: number;
  fechaOrden: string;
  nombreCliente: string;
  metodoPago: string;
  total: number;
};

export type ItemPC = {
  idProducto: number;
  producto: string;
  categoria: string;
  precio: number;
  cantidad: number;
  subtotal: number;
};

export type ConfiguracionPC = {
  idConfiguracion: number;
  idUsuario: number;
  nombreConfiguracion: string;
  fechaCreacion: string;
  detalles: ItemPC[];
  total: number;
};

export type PlantillaPC = {
  idPlantilla: number;
  nombre: string;
  descripcion: string | null;
  precioTotalCalculado: number | null;
  activo: boolean;
  detalles: ItemPC[];
};

export type ItemRequest = {
  idProducto: number;
  cantidad: number;
};

export type CategoriaRequest = {
  nombre: string;
  esEsencial: boolean;
};

export type ProductoRequest = {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
};

export type MetodoPagoRequest = {
  nombre: string;
};

export type ConfiguracionRequest = {
  idUsuario: number;
  nombreConfiguracion: string;
  items: ItemRequest[];
};

export type PlantillaRequest = {
  nombre: string;
  descripcion: string | null;
  items: ItemRequest[];
};

export type AppView =
  | 'tienda'
  | 'producto'
  | 'plantillas'
  | 'armador'
  | 'ordenes'
  | 'carrito'
  | 'admin';
