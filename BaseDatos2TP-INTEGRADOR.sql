-- =========================================================================
-- CREACIÓN DE LA BASE DE DATOS Y ESQUEMA CORREGIDO (TPI E-Commerce Hardware)
-- =========================================================================

CREATE DATABASE BaseDatos2TPO;
GO

USE BaseDatos2TPO;
GO

-- Usuarios ------------------------------------------------------------------------------------------------------------------------

CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    ContraseñaHash NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(20) NOT NULL CHECK (Rol IN ('Cliente', 'Administrador'))
);

-- Catalogo de Productos ----------------------------------------------------------------------------------------------------------

CREATE TABLE Categoria (
    IdCategoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    EsEsencial BIT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1 -- Baja lógica solicitada
);

CREATE TABLE Producto (
    IdProducto INT IDENTITY(1,1) PRIMARY KEY,
    IdCategoria INT NOT NULL,
    Nombre NVARCHAR(200) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    Precio DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1, -- Baja lógica solicitada
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY (IdCategoria) REFERENCES Categoria(IdCategoria)
);

-- Transacciones y Carrito ----------------------------------------------------------------------------------------------------------

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


-- Arma tu PC -------------------------------------------------------------------------------------------------------------------------------

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
    Cantidad INT NOT NULL DEFAULT 1, -- Cantidad agregada por corrección
    CONSTRAINT FK_DetalleConfiguracion_Configuracion FOREIGN KEY (IdConfiguracion) REFERENCES ConfiguracionPC(IdConfiguracion),
    CONSTRAINT FK_DetalleConfiguracion_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    CONSTRAINT UQ_Configuracion_Producto UNIQUE (IdConfiguracion, IdProducto)
);

-- Recomendaciones del Administrador (PCs Pre-armadas) ----------------------------------------------------------------------------------------------------------

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

-------------------------------------------------------------------------------------------------------------------------------------------------------
-- FUNCIONES
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

CREATE FUNCTION dbo.fn_CalcularTotalGastadoPorUsuario ( @IdUsuario INT )

RETURNS DECIMAL(18,2)
AS
BEGIN

    DECLARE @TotalGastado DECIMAL(18,2);

    -- Sumamos el total de las órdenes pagadas del usuario

    SELECT @TotalGastado = ISNULL(SUM(Total), 0)

    FROM OrdenCompra

    WHERE IdUsuario = @IdUsuario 

      AND Estado = 'Pagado' ;

    RETURN @TotalGastado ;
END ;

GO

-----------------------------------------------------------------------------------------------------------------------------------------------
-- VISTAS
-----------------------------------------------------------------------------------------------------------------------------------------------

--RESUMEN DE CLIENTES

CREATE VIEW dbo.VW_Resumen_Clientes

AS

SELECT 
    u.IdUsuario,
    u.Nombre,
    u.Apellido,
    u.Email,
    u.Rol,
    -- Invoca UDF creada previamente por cada fila de cliente
    dbo.fn_CalcularTotalGastadoPorUsuario(u.IdUsuario) AS TotalGastado

FROM Usuario u
WHERE u.Rol = 'Cliente';
GO

------------------------------------------------------------------------------------------------------------------------------------------------------
-- Vista VW_Catalogo_Productos une ambas tablas para mostrar de forma limpia el catálogo con su respectivo stock

USE BaseDatos2TPO ;

GO

CREATE VIEW dbo.VW_Catalogo_Productos
AS
SELECT 
    p.IdProducto,
    p.Nombre AS NombreProducto,
    p.Descripcion AS DescripcionProducto,
    p.Precio,
    p.Stock,
    c.IdCategoria,
    c.Nombre AS NombreCategoria,
    c.EsEsencial,
    p.Activo AS ProductoActivo

FROM Producto p

INNER JOIN Categoria c ON p.IdCategoria = c.IdCategoria

WHERE p.Activo = 1 AND c.Activo = 1; -- Filtro para mostrar solo productos y categorias activos
GO

--------------------------------------------------------------------------------------------------------------------------------------------------------
-- Pruebas Vistas

-- Inserto categorias de prueba

INSERT INTO Categoria (Nombre, EsEsencial, Activo) VALUES 
('Tarjetas Gráficas', 1, 1),
('Microprocesadores', 1, 1);
GO

-- 2. Inserto productos de prueba

INSERT INTO Producto (IdCategoria, Nombre, Descripcion, Precio, Stock, Activo) VALUES 
(1, 'NVIDIA GeForce RTX 4060', 'Tarjeta gráfica de 8GB GDDR6', 450000.00, 10, 1),
(2, 'AMD Ryzen 5 5600X', 'Procesador de 6 núcleos y 12 hilos', 250000.00, 15, 1);
GO

SELECT * FROM dbo.VW_Catalogo_Productos ;
-------------------------------------------------------------------------------------------------------------------------------------------------------


-------------------------------------------------------------------------------
-- Insertar datos de prueba
------------------------------------------------------------------------------

-- 1. Insertar Métodos de Pago (Necesarios para la Orden de Compra)

INSERT INTO MetodoPago (Nombre, Activo) VALUES 
('Tarjeta de Crédito', 1),
('Transferencia Bancaria', 1);
GO

-- 2. Insertar Usuarios (Clientes y Administrador)

INSERT INTO Usuario (Nombre, Apellido, Email, ContraseñaHash, Rol) VALUES 
('Guillermo', 'Phelan', 'guillermo.phelan@email.com', 'hash_seguro_123', 'Cliente'),
('Marcos', 'Lewandowski', 'marcos.lewandowski@email.com', 'hash_seguro_456', 'Cliente'),
('Admin', 'Sistema', 'admin.sistema@email.com', 'hash_seguro_789', 'Administrador');
GO

-- 3. Insertar Órdenes de Compra
-- - Guillermo (IdUsuario = 1) tiene una orden pagada de 150,000 y una pendiente de 50,000. Total esperado en UDF: 150,000.
-- - Marcos (IdUsuario = 2) tiene una orden pagada de 300,000. Total esperado en UDF: 300,000.
-- - El Administrador (IdUsuario = 3) no tiene órdenes y no debe figurar en la vista de clientes.

INSERT INTO OrdenCompra (IdUsuario, IdMetodoPago, FechaOrden, Total, Estado) VALUES 
(1, 1, GETDATE(), 150000.00, 'Pagado'),
(1, 2, GETDATE(), 50000.00, 'Pendiente'),
(2, 1, GETDATE(), 300000.00, 'Pagado');
GO


-------------------------------
-- Pruebas 
-------------------------------

SELECT * FROM dbo.VW_Resumen_Clientes;

-- Prueba A: Probar la Función de forma individual para un usuario específico (Ej: Guillermo - Id 1)
-- Debe retornar únicamente 150000.00 porque ignora la orden en estado 'Pendiente'.

SELECT dbo.fn_CalcularTotalGastadoPorUsuario(1) AS TotalGastadoGuillermo;
GO

-- Prueba B: Probar la Función (UDF) para el usuario Marcos (Id 2)
-- Debe retornar 300000.00.

SELECT dbo.fn_CalcularTotalGastadoPorUsuario(2) AS TotalGastadoMarcos;
GO

-- Prueba C: Consultar la Vista de Resumen de Clientes
-- Debe mostrar a Guillermo y a Marcos con sus respectivos totales calculados, 
-- y excluir automáticamente al usuario con rol 'Administrador'.

SELECT * FROM dbo.VW_Resumen_Clientes;
GO