USE BaseDatos2TPO;
GO

-- =======================================================================
-- SCRIPT 07: Vista de Historial y Stored Procedure Transaccional de Compra
-- Autor: Pablo Brito
-- Requisito previo: Haber ejecutado 01_DDL_Tablas.sql
-- =======================================================================

-- =======================================================================
-- 1. VISTA: Historial de Ventas (Órdenes detalladas)
-- =======================================================================
CREATE OR ALTER VIEW dbo.vw_HistorialVentas
AS
SELECT 
    O.IdOrden,
    O.FechaOrden,
    U.Nombre + ' ' + U.Apellido AS Cliente,
    M.Nombre AS MetodoPago,
    P.Nombre AS Producto,
    DO.Cantidad,
    DO.PrecioUnitario,
    (DO.Cantidad * DO.PrecioUnitario) AS Subtotal,
    O.Total AS TotalOrden,
    O.Estado
FROM dbo.OrdenCompra O
INNER JOIN dbo.Usuario U ON O.IdUsuario = U.IdUsuario
INNER JOIN dbo.MetodoPago M ON O.IdMetodoPago = M.IdMetodoPago
INNER JOIN dbo.DetalleOrden DO ON O.IdOrden = DO.IdOrden
INNER JOIN dbo.Producto P ON DO.IdProducto = P.IdProducto;
GO


-- =======================================================================
-- 2. STORED PROCEDURE: Procesar Compra (Transaccional)
-- =======================================================================
CREATE OR ALTER PROCEDURE dbo.sp_ProcesarCompra
    @IdUsuario INT,
    @IdMetodoPago INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Variables de trabajo
    DECLARE @IdCarrito INT;
    DECLARE @TotalOrden DECIMAL(18,2) = 0;
    DECLARE @NuevaOrdenId INT;

    BEGIN TRY
        -- INICIO DE LA TRANSACCIÓN
        BEGIN TRAN;

        -- 1. Identificar el carrito del usuario
        SELECT @IdCarrito = IdCarrito 
        FROM dbo.Carrito 
        WHERE IdUsuario = @IdUsuario;

        IF @IdCarrito IS NULL
        BEGIN
            RAISERROR('El usuario no tiene un carrito asignado.', 16, 1);
        END

        -- 2. Validar que el carrito no esté vacío
        IF NOT EXISTS (SELECT 1 FROM dbo.DetalleCarrito WHERE IdCarrito = @IdCarrito)
        BEGIN
            RAISERROR('El carrito está vacío. Agregue productos antes de procesar la compra.', 16, 1);
        END

        -- 3. Validar Stock: Verificar si hay algún producto que supere el stock físico disponible
        DECLARE @ProductoSinStock NVARCHAR(200);
        
        SELECT TOP 1 @ProductoSinStock = P.Nombre
        FROM dbo.DetalleCarrito DC
        INNER JOIN dbo.Producto P ON DC.IdProducto = P.IdProducto
        WHERE DC.IdCarrito = @IdCarrito AND DC.Cantidad > P.Stock;

        IF @ProductoSinStock IS NOT NULL
        BEGIN
            DECLARE @ErrorStock NVARCHAR(400) = 'Stock insuficiente para el producto: ' + @ProductoSinStock;
            RAISERROR(@ErrorStock, 16, 1);
        END

        -- 4. Calcular el Total sumando los precios actuales de los productos por su cantidad en el carrito
        SELECT @TotalOrden = SUM(DC.Cantidad * P.Precio)
        FROM dbo.DetalleCarrito DC
        INNER JOIN dbo.Producto P ON DC.IdProducto = P.IdProducto
        WHERE DC.IdCarrito = @IdCarrito;

        -- 5. Insertar la Cabecera de la Orden
        INSERT INTO dbo.OrdenCompra (IdUsuario, IdMetodoPago, FechaOrden, Total, Estado)
        VALUES (@IdUsuario, @IdMetodoPago, GETDATE(), @TotalOrden, 'Pagado');
        
        -- Capturar el ID autoincremental de la orden recién creada
        SET @NuevaOrdenId = SCOPE_IDENTITY();

        -- 6. Insertar el Detalle de la Orden clonando los datos del carrito
        INSERT INTO dbo.DetalleOrden (IdOrden, IdProducto, Cantidad, PrecioUnitario)
        SELECT 
            @NuevaOrdenId,
            DC.IdProducto,
            DC.Cantidad,
            P.Precio
        FROM dbo.DetalleCarrito DC
        INNER JOIN dbo.Producto P ON DC.IdProducto = P.IdProducto
        WHERE DC.IdCarrito = @IdCarrito;

        -- 7. Descontar el stock físico del Inventario
        UPDATE P
        SET P.Stock = P.Stock - DC.Cantidad
        FROM dbo.Producto P
        INNER JOIN dbo.DetalleCarrito DC ON P.IdProducto = DC.IdProducto
        WHERE DC.IdCarrito = @IdCarrito;

        -- 8. Vaciar el carrito tras la compra exitosa
        DELETE FROM dbo.DetalleCarrito
        WHERE IdCarrito = @IdCarrito;

        -- SI LLEGÓ HASTA ACÁ SIN ERRORES, CONFIRMAMOS LOS CAMBIOS EN LA BASE
        COMMIT TRAN;
        
        PRINT 'Compra procesada exitosamente. Nro de Orden generada: ' + CAST(@NuevaOrdenId AS NVARCHAR(10));

    END TRY
    BEGIN CATCH
        -- SI OCURRIÓ UN ERROR, DESHACEMOS CUALQUIER INSERCIÓN O UPDATE A MEDIAS
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRAN;
        END

        -- Capturar y mostrar el error exacto para debugging
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Operación abortada por error: %s', 16, 1, @MensajeError);
    END CATCH
END
GO
