-- 1. Módulo: Seguridad y Usuarios
CREATE TABLE Usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    ContraseñaHash NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(20) NOT NULL CHECK (Rol IN ('Cliente', 'Administrador'))
);

-- 2. Módulo: Catálogo de Productos
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

-- 3. Módulo: Transacciones y Carrito
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

-- 4. Módulo: Ensamblaje Personalizado (Arma tu PC)
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

-- 5. Módulo: Recomendaciones del Administrador (PCs Pre-armadas)
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