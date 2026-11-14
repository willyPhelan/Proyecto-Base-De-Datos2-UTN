USE BaseDatos2TPO;
GO

/*

Se crearon 2 bajas, una lógica y otra física, para la tabla OrdenCompra.
La baja lógica se realiza mediante un UPDATE que cambia el estado de la orden a "Cancelado"

*/

-- 1. UPDATE (baja lógica): restaurar stock cuando una orden pasa a Cancelado
CREATE OR ALTER TRIGGER TR_RESTAURAR_STOCK
ON OrdenCompra
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(Estado)
        RETURN;

    BEGIN TRY
        UPDATE P
        SET P.Stock = P.Stock + R.CantidadADevolver
        FROM Producto P
        INNER JOIN (
            SELECT DO.IdProducto, SUM(DO.Cantidad) AS CantidadADevolver
            FROM DetalleOrden DO
            INNER JOIN INSERTED I ON I.IdOrden = DO.IdOrden
            INNER JOIN DELETED D ON D.IdOrden = I.IdOrden
            WHERE I.Estado = 'Cancelado'
              AND D.Estado <> 'Cancelado'
            GROUP BY DO.IdProducto
        ) R ON R.IdProducto = P.IdProducto;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al restaurar el stock: %s', 16, 1, @MensajeError);
    END CATCH
END
GO

-- 2. DELETE (baja física): borrar la orden y sus detalles, restaurando stock
CREATE OR ALTER TRIGGER TR_ELIMINAR_ORDEN
ON OrdenCompra
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM DELETED)
        RETURN;

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

        DELETE DO
        FROM DetalleOrden DO
        INNER JOIN DELETED D ON D.IdOrden = DO.IdOrden;

        DELETE OC
        FROM OrdenCompra OC
        INNER JOIN DELETED D ON D.IdOrden = OC.IdOrden;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al eliminar la orden: %s', 16, 1, @MensajeError);
    END CATCH
END
GO

-- 3. UPDATE: recalcular precio de plantillas al cambiar el precio de un producto
CREATE OR ALTER TRIGGER TR_RECALCULAR_PRECIO_PLANTILLA
ON Producto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(Precio)
        RETURN;

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
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al recalcular el precio de las plantillas: %s', 16, 1, @MensajeError);
    END CATCH
END
GO

/*
Pruebas de los triggers:

-- Prueba baja lógica: la orden 1 queda Cancelado y el stock del producto 5 pasa de 10 a 11
BEGIN TRAN;
    SELECT IdProducto, Nombre, Stock FROM Producto WHERE IdProducto = 5;
    UPDATE OrdenCompra SET Estado = 'Cancelado' WHERE IdOrden = 1;
    SELECT IdOrden, Estado FROM OrdenCompra WHERE IdOrden = 1;
    SELECT IdProducto, Nombre, Stock FROM Producto WHERE IdProducto = 5;
ROLLBACK;

-- Prueba baja física: la orden 1 y su detalle desaparecen y el stock del producto 5 pasa de 10 a 11
BEGIN TRAN;
    SELECT IdProducto, Nombre, Stock FROM Producto WHERE IdProducto = 5;
    DELETE FROM OrdenCompra WHERE IdOrden = 1;
    SELECT * FROM OrdenCompra WHERE IdOrden = 1;
    SELECT * FROM DetalleOrden WHERE IdOrden = 1;
    SELECT IdProducto, Nombre, Stock FROM Producto WHERE IdProducto = 5;
ROLLBACK;

-- Prueba cancelar y después borrar: el stock del producto 5 sube una sola vez (10 a 11)
BEGIN TRAN;
    UPDATE OrdenCompra SET Estado = 'Cancelado' WHERE IdOrden = 1;
    DELETE FROM OrdenCompra WHERE IdOrden = 1;
    SELECT IdProducto, Nombre, Stock FROM Producto WHERE IdProducto = 5;
ROLLBACK;

-- Prueba UPDATE de precio: las plantillas 1 y 3 suben 20.000, la 2 no cambia
BEGIN TRAN;
    SELECT IdPlantilla, Nombre, PrecioTotalCalculado FROM PlantillaPC;
    UPDATE Producto SET Precio = 270000.00 WHERE IdProducto = 1;
    SELECT IdPlantilla, Nombre, PrecioTotalCalculado FROM PlantillaPC;
ROLLBACK;
*/