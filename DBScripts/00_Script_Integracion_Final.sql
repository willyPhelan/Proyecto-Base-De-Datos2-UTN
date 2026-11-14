-- =======================================================================
-- SCRIPT MAESTRO DE INTEGRACIÓN - TP BASE DE DATOS 2
-- Autores: Guillermo Phelan, Pablo Brito, Marcos Lewandowski, Luka Gallo
-- Descripción: Script unificado que reconstruye la BD completa desde cero.
-- =======================================================================

-- 0. BORRADO Y CREACIÓN DE BASE DE DATOS
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'BaseDatos2TPO')
BEGIN
    ALTER DATABASE BaseDatos2TPO SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BaseDatos2TPO;
    PRINT 'Base de datos anterior eliminada exitosamente.';
END
GO

CREATE DATABASE BaseDatos2TPO;
PRINT 'Base de datos BaseDatos2TPO creada correctamente.';
GO

USE BaseDatos2TPO;
GO

-- =======================================================================
-- 1. SCRIPT 01: DDL - Creación de Tablas (Pablo)
-- =======================================================================
CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    ContraseñaHash NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(20) NOT NULL CHECK (Rol IN ('Cliente', 'Administrador'))
);

CREATE TABLE Categoria (
    IdCategoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    EsEsencial BIT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1 
);

CREATE TABLE Producto (
    IdProducto INT IDENTITY(1,1) PRIMARY KEY,
    IdCategoria INT NOT NULL,
    Nombre NVARCHAR(200) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    Precio DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1, 
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY (IdCategoria) REFERENCES Categoria(IdCategoria)
);

CREATE TABLE Carrito (
    IdCarrito INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT NOT NULL UNIQUE,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Carrito_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);

CREATE TABLE DetalleCarrito (
    IdDetalleCarrito INT IDENTITY(1,1) PRIMARY KEY,
    IdCarrito INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_DetalleCarrito_Carrito FOREIGN KEY (IdCarrito) REFERENCES Carrito(IdCarrito),
    CONSTRAINT FK_DetalleCarrito_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    CONSTRAINT UQ_Carrito_Producto UNIQUE (IdCarrito, IdProducto) 
);

CREATE TABLE MetodoPago (
    IdMetodoPago INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE OrdenCompra (
    IdOrden INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT NOT NULL,
    IdMetodoPago INT NOT NULL,
    FechaOrden DATETIME NOT NULL DEFAULT GETDATE(),
    Total DECIMAL(18,2) NOT NULL,
    Estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Pagado', 'Cancelado')),
    CONSTRAINT FK_OrdenCompra_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario),
    CONSTRAINT FK_OrdenCompra_MetodoPago FOREIGN KEY (IdMetodoPago) REFERENCES MetodoPago(IdMetodoPago)
);

CREATE TABLE DetalleOrden (
    IdDetalleOrden INT IDENTITY(1,1) PRIMARY KEY,
    IdOrden INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_DetalleOrden_OrdenCompra FOREIGN KEY (IdOrden) REFERENCES OrdenCompra(IdOrden),
    CONSTRAINT FK_DetalleOrden_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    CONSTRAINT UQ_Orden_Producto UNIQUE (IdOrden, IdProducto) 
);

CREATE TABLE ConfiguracionPC (
    IdConfiguracion INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT NOT NULL,
    NombreConfiguracion NVARCHAR(100) NOT NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ConfiguracionPC_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);

CREATE TABLE DetalleConfiguracion (
    IdDetalleConfiguracion INT IDENTITY(1,1) PRIMARY KEY,
    IdConfiguracion INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1, 
    CONSTRAINT FK_DetalleConfiguracion_Configuracion FOREIGN KEY (IdConfiguracion) REFERENCES ConfiguracionPC(IdConfiguracion),
    CONSTRAINT FK_DetalleConfiguracion_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    CONSTRAINT UQ_Configuracion_Producto UNIQUE (IdConfiguracion, IdProducto)
);

CREATE TABLE PlantillaPC (
    IdPlantilla INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(200) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    PrecioTotalCalculado DECIMAL(18,2) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE DetallePlantillaPC (
    IdDetallePlantilla INT IDENTITY(1,1) PRIMARY KEY,
    IdPlantilla INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_DetallePlantillaPC_Plantilla FOREIGN KEY (IdPlantilla) REFERENCES PlantillaPC(IdPlantilla),
    CONSTRAINT FK_DetallePlantillaPC_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    CONSTRAINT UQ_Plantilla_Producto UNIQUE (IdPlantilla, IdProducto)
);
GO

-- =======================================================================
-- 2. SCRIPT 02: Mock Data - Seguridad, Pagos, Categorías (Guillermo)
-- =======================================================================
INSERT INTO MetodoPago (Nombre, Activo) VALUES 
('Tarjeta de Crédito', 1),
('Transferencia Bancaria', 1);

INSERT INTO Usuario (Nombre, Apellido, Email, ContraseñaHash, Rol) VALUES 
('Guillermo', 'Phelan', 'guillermo.phelan@email.com', 'hash_seguro_123', 'Cliente'),
('Marcos', 'Lewandowski', 'marcos.lewandowski@email.com', 'hash_seguro_456', 'Cliente'),
('Admin', 'Sistema', 'admin.sistema@email.com', 'hash_seguro_789', 'Administrador');

INSERT INTO Categoria (Nombre, EsEsencial, Activo) VALUES 
('Tarjetas Gráficas', 1, 1),
('Microprocesadores', 1, 1),
('Memorias RAM', 1, 1),
('Motherboards', 1, 1),
('Almacenamiento', 1, 1),
('Fuentes de Poder', 1, 1);
GO

-- =======================================================================
-- 3. SCRIPT 03: Mock Data - Productos y Carritos (Pablo)
-- =======================================================================
INSERT INTO Producto (IdCategoria, Nombre, Descripcion, Precio, Stock, Activo) VALUES 
(2, 'AMD Ryzen 5 5600X', '6 núcleos, 12 hilos, 4.6GHz Max Boost, AM4', 250000.00, 15, 1),
(2, 'Intel Core i5-13400F', '10 núcleos, 16 hilos, hasta 4.6GHz, LGA1700', 290000.00, 12, 1),
(2, 'AMD Ryzen 7 7800X3D', '8 núcleos, 16 hilos con 3D V-Cache, AM5', 560000.00, 6, 1),
(2, 'Intel Core i7-13700K', '16 núcleos, 24 hilos, hasta 5.4GHz, LGA1700', 480000.00, 8, 1),
(1, 'NVIDIA GeForce RTX 4060 8GB', 'MSI Ventus 2X Black OC GDDR6', 450000.00, 10, 1),
(1, 'AMD Radeon RX 7600 8GB', 'Sapphire Pulse Gaming OC GDDR6', 380000.00, 14, 1),
(1, 'NVIDIA GeForce RTX 4070 Super 12GB', 'ASUS Dual OC GDDR6X', 780000.00, 5, 1),
(1, 'AMD Radeon RX 7800 XT 16GB', 'XFX Speedster QICK 319 GDDR6', 720000.00, 7, 1),
(3, 'Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz', 'Kit dual channel CL16', 65000.00, 25, 1),
(3, 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz', 'Kit dual channel CL36 AMD Expo/XMP', 155000.00, 18, 1),
(4, 'ASUS TUF GAMING B550M-PLUS WIFI II', 'Socket AM4, Micro ATX, PCIe 4.0', 175000.00, 9, 1),
(4, 'MSI MAG B650 TOMAHAWK WIFI', 'Socket AM5, ATX, DDR5, PCIe 4.0', 260000.00, 7, 1),
(5, 'SSD Kingston NV2 1TB NVMe PCIe 4.0', 'Lectura hasta 3500MB/s', 82000.00, 30, 1),
(5, 'SSD Samsung 980 PRO 2TB NVMe PCIe 4.0', 'Lectura hasta 7000MB/s', 210000.00, 11, 1),
(6, 'Gigabyte P650B 650W', 'Certificación 80 Plus Bronze', 85000.00, 15, 1),
(6, 'Corsair RM850e 850W', 'Certificación 80 Plus Gold, ATX 3.0', 175000.00, 8, 1);

INSERT INTO Carrito (IdUsuario, FechaCreacion) VALUES 
(1, GETDATE()), 
(2, GETDATE()); 

INSERT INTO DetalleCarrito (IdCarrito, IdProducto, Cantidad) VALUES 
(1, 1, 1),
(1, 5, 1),
(2, 3, 1),
(2, 7, 2);
GO

-- =======================================================================
-- 4. SCRIPT 04: Mock Data - Órdenes y Ensambles (Marcos)
-- =======================================================================
INSERT INTO OrdenCompra (IdUsuario, IdMetodoPago, FechaOrden, Total, Estado) VALUES 
(1, 1, GETDATE(), 450000.00, 'Pagado'),
(2, 2, GETDATE(), 560000.00, 'Pendiente');

INSERT INTO DetalleOrden (IdOrden, IdProducto, Cantidad, PrecioUnitario) VALUES 
(1, 5, 1, 450000.00),
(2, 3, 1, 560000.00);

INSERT INTO ConfiguracionPC (IdUsuario, NombreConfiguracion, FechaCreacion) VALUES 
(1, 'PC Gamer Guillermo', GETDATE()),
(2, 'PC Trabajo Marcos', GETDATE());

INSERT INTO DetalleConfiguracion (IdConfiguracion, IdProducto, Cantidad) VALUES 
(1, 1, 1), (1, 5, 1), (1, 9, 1),
(2, 2, 1), (2, 13, 1), (2, 16, 1);
GO

-- =======================================================================
-- 5. SCRIPT 05: Mock Data - Plantillas (Luka)
-- =======================================================================
INSERT INTO PlantillaPC (Nombre, Descripcion, PrecioTotalCalculado, Activo) VALUES 
('PC Básica de Oficina', 'Ideal para trabajo y estudio', 450000.00, 1),
('PC High-End 4K', 'Máximo rendimiento para gaming 4K', 1480000.00, 1),
('PC Gamer 1080p', 'Equilibrio precio/rendimiento para jugar en Full HD', NULL, 1);

INSERT INTO DetallePlantillaPC (IdPlantilla, IdProducto, Cantidad) VALUES 
(1, 1, 1), (1, 9, 1), (1, 15, 1),
(2, 3, 1), (2, 7, 1), (2, 10, 1), (2, 14, 1),
(3, 1, 1), (3, 6, 1), (3, 9, 1), (3, 11, 1), (3, 13, 1), (3, 15, 1);

-- Recalcular precios
UPDATE PL
SET PL.PrecioTotalCalculado = (
    SELECT SUM(P.Precio * DP.Cantidad)
    FROM DetallePlantillaPC DP
    INNER JOIN Producto P ON P.IdProducto = DP.IdProducto
    WHERE DP.IdPlantilla = PL.IdPlantilla
)
FROM PlantillaPC PL;
GO

-- =======================================================================
-- 6. SCRIPT 06: Vistas y UDF (Guillermo)
-- =======================================================================
CREATE OR ALTER VIEW dbo.VW_Catalogo_Productos
AS
SELECT 
    p.IdProducto, p.Nombre AS Producto, p.Descripcion,
    p.Precio, p.Stock, c.Nombre AS Categoria
FROM dbo.Producto p
INNER JOIN dbo.Categoria c ON p.IdCategoria = c.IdCategoria
WHERE p.Activo = 1;
GO

CREATE OR ALTER FUNCTION dbo.fn_CalcularTotalGastadoPorUsuario (@IdUsuario INT)
RETURNS DECIMAL(10, 2)
AS
BEGIN
    DECLARE @TotalGastado DECIMAL(10, 2);
    SELECT @TotalGastado = ISNULL(SUM(Total), 0.00)
    FROM dbo.OrdenCompra
    WHERE IdUsuario = @IdUsuario AND Estado = 'Pagado';
    RETURN @TotalGastado;
END;
GO

CREATE OR ALTER VIEW dbo.VW_Resumen_Clientes
AS
SELECT 
    u.IdUsuario, u.Nombre, u.Apellido, u.Email, u.Rol,
    dbo.fn_CalcularTotalGastadoPorUsuario(u.IdUsuario) AS TotalGastado
FROM dbo.Usuario u
WHERE u.Rol = 'Cliente';
GO

-- =======================================================================
-- 7. SCRIPT 07: SP de Compras y Vista Historial (Pablo)
-- =======================================================================
CREATE OR ALTER VIEW dbo.vw_HistorialVentas
AS
SELECT 
    O.IdOrden, O.FechaOrden, U.Nombre + ' ' + U.Apellido AS Cliente,
    M.Nombre AS MetodoPago, P.Nombre AS Producto, DO.Cantidad,
    DO.PrecioUnitario, (DO.Cantidad * DO.PrecioUnitario) AS Subtotal,
    O.Total AS TotalOrden, O.Estado
FROM dbo.OrdenCompra O
INNER JOIN dbo.Usuario U ON O.IdUsuario = U.IdUsuario
INNER JOIN dbo.MetodoPago M ON O.IdMetodoPago = M.IdMetodoPago
INNER JOIN dbo.DetalleOrden DO ON O.IdOrden = DO.IdOrden
INNER JOIN dbo.Producto P ON DO.IdProducto = P.IdProducto;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ProcesarCompra
    @IdUsuario INT,
    @IdMetodoPago INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @IdCarrito INT, @TotalOrden DECIMAL(18,2) = 0, @NuevaOrdenId INT;

    BEGIN TRY
        BEGIN TRAN;

        SELECT @IdCarrito = IdCarrito FROM dbo.Carrito WHERE IdUsuario = @IdUsuario;
        IF @IdCarrito IS NULL RAISERROR('El usuario no tiene un carrito.', 16, 1);
        
        IF NOT EXISTS (SELECT 1 FROM dbo.DetalleCarrito WHERE IdCarrito = @IdCarrito)
            RAISERROR('El carrito está vacío.', 16, 1);

        DECLARE @ProductoSinStock NVARCHAR(200);
        SELECT TOP 1 @ProductoSinStock = P.Nombre
        FROM dbo.DetalleCarrito DC
        INNER JOIN dbo.Producto P ON DC.IdProducto = P.IdProducto
        WHERE DC.IdCarrito = @IdCarrito AND DC.Cantidad > P.Stock;

        IF @ProductoSinStock IS NOT NULL
        BEGIN
            DECLARE @ErrorStock NVARCHAR(400) = 'Stock insuficiente: ' + @ProductoSinStock;
            RAISERROR(@ErrorStock, 16, 1);
        END

        SELECT @TotalOrden = SUM(DC.Cantidad * P.Precio)
        FROM dbo.DetalleCarrito DC
        INNER JOIN dbo.Producto P ON DC.IdProducto = P.IdProducto
        WHERE DC.IdCarrito = @IdCarrito;

        INSERT INTO dbo.OrdenCompra (IdUsuario, IdMetodoPago, FechaOrden, Total, Estado)
        VALUES (@IdUsuario, @IdMetodoPago, GETDATE(), @TotalOrden, 'Pagado');
        SET @NuevaOrdenId = SCOPE_IDENTITY();

        INSERT INTO dbo.DetalleOrden (IdOrden, IdProducto, Cantidad, PrecioUnitario)
        SELECT @NuevaOrdenId, DC.IdProducto, DC.Cantidad, P.Precio
        FROM dbo.DetalleCarrito DC
        INNER JOIN dbo.Producto P ON DC.IdProducto = P.IdProducto
        WHERE DC.IdCarrito = @IdCarrito;

        UPDATE P
        SET P.Stock = P.Stock - DC.Cantidad
        FROM dbo.Producto P
        INNER JOIN dbo.DetalleCarrito DC ON P.IdProducto = DC.IdProducto
        WHERE DC.IdCarrito = @IdCarrito;

        DELETE FROM dbo.DetalleCarrito WHERE IdCarrito = @IdCarrito;

        COMMIT TRAN;
        PRINT 'Compra procesada. Orden: ' + CAST(@NuevaOrdenId AS NVARCHAR(10));
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error: %s', 16, 1, @MensajeError);
    END CATCH
END;
GO

-- =======================================================================
-- 8. SCRIPT 08: SP Reporte de Ventas (Marcos)
-- =======================================================================
CREATE OR ALTER PROCEDURE dbo.SP_REPORTE_VENTA_ENTRE_2_FECHAS(
    @FECHA_INICIAL AS DATE,
    @FECHA_FINAL AS DATE
)
AS
BEGIN
    BEGIN TRY
        SELECT 
            O.IdOrden, O.FechaOrden, U.Nombre + ' ' + U.Apellido AS [Nombre del Cliente],
            M.Nombre AS [Método de Pago], O.Total
        FROM OrdenCompra O
        INNER JOIN Usuario U ON O.IdUsuario = U.IdUsuario
        INNER JOIN MetodoPago M ON O.IdMetodoPago = M.IdMetodoPago
        WHERE O.Estado = 'Pagado'
          AND O.FechaOrden >= @FECHA_INICIAL 
          AND O.FechaOrden < DATEADD(day, 1, @FECHA_FINAL)
        ORDER BY O.FechaOrden DESC;
    END TRY
    BEGIN CATCH
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al generar el reporte: %s', 16, 1, @MensajeError);
    END CATCH
END;
GO

-- =======================================================================
-- 9. SCRIPT 09: Trigger INSTEAD OF INSERT (Marcos)
-- =======================================================================
CREATE OR ALTER TRIGGER TR_AGREGAR_PRODUCTO_CARRITO 
ON DetalleCarrito
INSTEAD OF INSERT
AS
BEGIN
    BEGIN TRY
        UPDATE DC
        SET DC.Cantidad = DC.Cantidad + I.Cantidad
        FROM DetalleCarrito DC
        INNER JOIN INSERTED I 
            ON DC.IdCarrito = I.IdCarrito AND DC.IdProducto = I.IdProducto;

        INSERT INTO DetalleCarrito (IdCarrito, IdProducto, Cantidad)
        SELECT I.IdCarrito, I.IdProducto, I.Cantidad
        FROM INSERTED I
        WHERE NOT EXISTS (
            SELECT 1 FROM DetalleCarrito DC
            WHERE DC.IdCarrito = I.IdCarrito AND DC.IdProducto = I.IdProducto
        );
    END TRY
    BEGIN CATCH
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al agregar el producto al carrito: %s', 16, 1, @MensajeError);
    END CATCH
END;
GO

-- =======================================================================
-- 10. SCRIPT 10: Triggers DELETE y UPDATE (Luka)
-- =======================================================================
CREATE OR ALTER TRIGGER TR_RESTAURAR_STOCK
ON OrdenCompra
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(Estado) RETURN;

    BEGIN TRY
        UPDATE P
        SET P.Stock = P.Stock + R.CantidadADevolver
        FROM Producto P
        INNER JOIN (
            SELECT DO.IdProducto, SUM(DO.Cantidad) AS CantidadADevolver
            FROM DetalleOrden DO
            INNER JOIN INSERTED I ON I.IdOrden = DO.IdOrden
            INNER JOIN DELETED D ON D.IdOrden = I.IdOrden
            WHERE I.Estado = 'Cancelado' AND D.Estado <> 'Cancelado'
            GROUP BY DO.IdProducto
        ) R ON R.IdProducto = P.IdProducto;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al restaurar el stock: %s', 16, 1, @MensajeError);
    END CATCH
END;
GO

CREATE OR ALTER TRIGGER TR_ELIMINAR_ORDEN
ON OrdenCompra
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM DELETED) RETURN;

    BEGIN TRY
        UPDATE P
        SET P.Stock = P.Stock + R.CantidadADevolver
        FROM Producto P
        INNER JOIN (
            SELECT DO.IdProducto, SUM(DO.Cantidad) AS CantidadADevolver
            FROM DetalleOrden DO
            INNER JOIN DELETED D ON D.IdOrden = DO.IdOrden
            WHERE D.Estado <> 'Cancelado'
            GROUP BY DO.IdProducto
        ) R ON R.IdProducto = P.IdProducto;

        DELETE DO FROM DetalleOrden DO INNER JOIN DELETED D ON D.IdOrden = DO.IdOrden;
        DELETE OC FROM OrdenCompra OC INNER JOIN DELETED D ON D.IdOrden = OC.IdOrden;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al eliminar la orden: %s', 16, 1, @MensajeError);
    END CATCH
END;
GO

CREATE OR ALTER TRIGGER TR_RECALCULAR_PRECIO_PLANTILLA
ON Producto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE(Precio) RETURN;

    BEGIN TRY
        UPDATE PL
        SET PL.PrecioTotalCalculado = (
            SELECT SUM(P.Precio * DP.Cantidad)
            FROM DetallePlantillaPC DP
            INNER JOIN Producto P ON P.IdProducto = DP.IdProducto
            WHERE DP.IdPlantilla = PL.IdPlantilla
        )
        FROM PlantillaPC PL
        WHERE PL.IdPlantilla IN (
            SELECT DP.IdPlantilla
            FROM DetallePlantillaPC DP
            INNER JOIN INSERTED I ON I.IdProducto = DP.IdProducto
            INNER JOIN DELETED D ON D.IdProducto = I.IdProducto
            WHERE I.Precio <> D.Precio
        );
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al recalcular precio de plantillas: %s', 16, 1, @MensajeError);
    END CATCH
END;
GO

PRINT '=======================================================';
PRINT '  EJECUCIÓN DEL SCRIPT MAESTRO FINALIZADA CON ÉXITO    ';
PRINT '=======================================================';