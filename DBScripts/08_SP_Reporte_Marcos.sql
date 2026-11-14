CREATE PROCEDURE SP_REPORTE_VENTA_ENTRE_2_FECHAS(
    -- El SP de reporte debe recibir parámetros de entrada 
    -- (rango de fechas) e implementar bloque TRY / CATCH.
    @FECHA_INICIAL AS DATE,
    @FECHA_FINAL AS DATE
)
AS
BEGIN
    BEGIN TRY
        SELECT 
            O.IdOrden,
            O.FechaOrden,
            U.Nombre + ' ' + U.Apellido AS [Nombre del Cliente],
            M.Nombre AS [Método de Pago],
            O.Total
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
        RAISERROR('Ocurrió un error al generar el reporte: %s', 16, 1, @MensajeError);
    END CATCH
END
