-- =======================================================================
-- SCRIPT 04: Mock Data - Órdenes, Configuraciones y Plantillas
-- Autor: Marcos Lewandowski
-- Tablas: OrdenCompra, DetalleOrden, ConfiguracionPC, DetalleConfiguracion, PlantillaPC, DetallePlantillaPC
-- Requisito previo: Haber ejecutado 01, 02 y 03.
-- =======================================================================

-- =======================================================================
-- 1. Módulo: Órdenes de Compra
-- =======================================================================

-- Insertamos 2 órdenes: una pagada con tarjeta, otra pendiente por transferencia
INSERT INTO OrdenCompra (IdUsuario, IdMetodoPago, FechaOrden, Total, Estado)
VALUES 
(1, 1, GETDATE(), 450000.00, 'Pagado'),      -- Orden 1: Guillermo (RTX 4060)
(2, 2, GETDATE(), 560000.00, 'Pendiente');   -- Orden 2: Marcos (Ryzen 7 7800X3D)

-- Insertamos los detalles de esas órdenes
INSERT INTO DetalleOrden (IdOrden, IdProducto, Cantidad, PrecioUnitario)
VALUES 
-- Detalle Orden 1 (Guillermo compró 1 RTX 4060)
(1, 5, 1, 450000.00),

-- Detalle Orden 2 (Marcos compró 1 Ryzen 7 7800X3D)
(2, 3, 1, 560000.00);
GO

-- =======================================================================
-- 2. Módulo: Ensamblaje Personalizado (Arma tu PC)
-- =======================================================================

-- Creamos 2 configuraciones personalizadas
INSERT INTO ConfiguracionPC (IdUsuario, NombreConfiguracion, FechaCreacion)
VALUES 
(1, 'PC Gamer Guillermo', GETDATE()),
(2, 'PC Trabajo Marcos', GETDATE());

-- Insertamos los componentes para cada configuración
INSERT INTO DetalleConfiguracion (IdConfiguracion, IdProducto, Cantidad)
VALUES 
-- Configuración 1 (Guillermo): Ryzen 5 (1), RTX 4060 (5), RAM Kingston 16GB (9)
(1, 1, 1),
(1, 5, 1),
(1, 9, 1),

-- Configuración 2 (Marcos): Intel i5 (2), SSD 1TB (13), Fuente Corsair 850W (16)
(2, 2, 1),
(2, 13, 1),
(2, 16, 1);
GO

-- =======================================================================
-- 3. Módulo: Recomendaciones del Administrador (Plantillas)
-- =======================================================================

-- Insertamos 2 plantillas pre-armadas por el Admin (Usuario 3)
INSERT INTO PlantillaPC (Nombre, Descripcion, PrecioTotalCalculado, Activo)
VALUES 
('PC Básica de Oficina', 'Ideal para trabajo y estudio', 450000.00, 1),
('PC High-End 4K', 'Máximo rendimiento para gaming 4K', 1480000.00, 1);

-- Insertamos los productos que componen a cada plantilla
INSERT INTO DetallePlantillaPC (IdPlantilla, IdProducto, Cantidad)
VALUES 
-- Plantilla 1 (Oficina): Ryzen 5 (1), RAM Kingston 16GB (9), Fuente Gigabyte 650W (15)
(1, 1, 1),
(1, 9, 1),
(1, 15, 1),

-- Plantilla 2 (High-End): Ryzen 7 7800X3D (3), RTX 4070 Super (7), RAM Corsair 32GB (10), SSD Samsung 2TB (14)
(2, 3, 1),
(2, 7, 1),
(2, 10, 1),
(2, 14, 1);
GO
