CREATE TRIGGER TR_AGREGAR_PRODUCTO_CARRITO 
ON DetalleCarrito
INSTEAD OF INSERT
AS
BEGIN
    BEGIN TRY
        -- 1. ACTUALIZAR: Si el producto ya existe en el carrito, sumamos la cantidad
        UPDATE DC
        SET DC.Cantidad = DC.Cantidad + I.Cantidad
        FROM DetalleCarrito DC
        INNER JOIN INSERTED I 
            ON DC.IdCarrito = I.IdCarrito 
           AND DC.IdProducto = I.IdProducto;

        -- 2. INSERTAR: Si el producto NO existe en el carrito, lo insertamos de cero
        INSERT INTO DetalleCarrito (IdCarrito, IdProducto, Cantidad)
        SELECT I.IdCarrito, I.IdProducto, I.Cantidad
        FROM INSERTED I
        WHERE NOT EXISTS (
            SELECT 1 
            FROM DetalleCarrito DC
            WHERE DC.IdCarrito = I.IdCarrito 
              AND DC.IdProducto = I.IdProducto
        );

    END TRY
    BEGIN CATCH
        -- Si algo falla, avisamos con RAISERROR
        DECLARE @MensajeError NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR('Error al agregar el producto al carrito: %s', 16, 1, @MensajeError);
    END CATCH
END
