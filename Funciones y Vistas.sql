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


--VISTA RESUMEN DE CLIENTES

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

---------------------

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

