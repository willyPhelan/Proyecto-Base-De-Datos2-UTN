USE BaseDatos2TPO;
GO

-- =======================================================================
-- SCRIPT 03: Mock Data - Catálogo Completo y Carritos de Compra
-- Autor: Pablo Brito
-- Tablas: Producto, Carrito, DetalleCarrito
-- Requisito previo: Haber ejecutado 01_DDL_Tablas.sql y 02_MockData_Guillermo.sql
-- =======================================================================

-- 1. INSERTS TABLA: Producto
-- IdCategoria: 1=GPU, 2=Micro, 3=RAM, 4=Mother, 5=Almacenamiento, 6=Fuente
INSERT INTO Producto (IdCategoria, Nombre, Descripcion, Precio, Stock, Activo)
VALUES 
-- Procesadores (IdCategoria = 2)
(2, 'AMD Ryzen 5 5600X', '6 núcleos, 12 hilos, 4.6GHz Max Boost, AM4', 250000.00, 15, 1),
(2, 'Intel Core i5-13400F', '10 núcleos, 16 hilos, hasta 4.6GHz, LGA1700', 290000.00, 12, 1),
(2, 'AMD Ryzen 7 7800X3D', '8 núcleos, 16 hilos con 3D V-Cache, AM5', 560000.00, 6, 1),
(2, 'Intel Core i7-13700K', '16 núcleos, 24 hilos, hasta 5.4GHz, LGA1700', 480000.00, 8, 1),

-- Tarjetas Gráficas (IdCategoria = 1)
(1, 'NVIDIA GeForce RTX 4060 8GB', 'MSI Ventus 2X Black OC GDDR6', 450000.00, 10, 1),
(1, 'AMD Radeon RX 7600 8GB', 'Sapphire Pulse Gaming OC GDDR6', 380000.00, 14, 1),
(1, 'NVIDIA GeForce RTX 4070 Super 12GB', 'ASUS Dual OC GDDR6X', 780000.00, 5, 1),
(1, 'AMD Radeon RX 7800 XT 16GB', 'XFX Speedster QICK 319 GDDR6', 720000.00, 7, 1),

-- Memorias RAM (IdCategoria = 3)
(3, 'Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz', 'Kit dual channel CL16', 65000.00, 25, 1),
(3, 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', 'Kit dual channel CL36 AMD Expo/XMP', 155000.00, 18, 1),

-- Motherboards (IdCategoria = 4)
(4, 'ASUS TUF GAMING B550M-PLUS WIFI II', 'Socket AM4, Micro ATX, PCIe 4.0', 175000.00, 9, 1),
(4, 'MSI MAG B650 TOMAHAWK WIFI', 'Socket AM5, ATX, DDR5, PCIe 4.0', 260000.00, 7, 1),

-- Almacenamiento (IdCategoria = 5)
(5, 'SSD Kingston NV2 1TB NVMe PCIe 4.0', 'Lectura hasta 3500MB/s, Escritura hasta 2100MB/s', 82000.00, 30, 1),
(5, 'SSD Samsung 980 PRO 2TB NVMe PCIe 4.0', 'Lectura hasta 7000MB/s con disipador', 210000.00, 11, 1),

-- Fuentes de Poder (IdCategoria = 6)
(6, 'Gigabyte P650B 650W', 'Certificación 80 Plus Bronze, ventilador silencioso 120mm', 85000.00, 15, 1),
(6, 'Corsair RM850e 850W', 'Totalmente modular, Certificación 80 Plus Gold, ATX 3.0', 175000.00, 8, 1);
GO

-- 2. INSERTS TABLA: Carrito
-- Clientes: IdUsuario 1 (Guillermo) e IdUsuario 2 (Marcos)
INSERT INTO Carrito (IdUsuario, FechaCreacion)
VALUES 
(1, GETDATE()), 
(2, GETDATE()); 
GO

-- 3. INSERTS TABLA: DetalleCarrito
INSERT INTO DetalleCarrito (IdCarrito, IdProducto, Cantidad)
VALUES 
-- Carrito 1: 1 Ryzen 5 5600X (Id 1) y 1 RTX 4060 (Id 5)
(1, 1, 1),
(1, 5, 1),

-- Carrito 2: 1 Ryzen 7 7800X3D (Id 3) y 2 RTX 4070 Super (Id 7)
(2, 3, 1),
(2, 7, 2);
GO
