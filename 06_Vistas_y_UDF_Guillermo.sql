-- =======================================================================
-- SCRIPT 06: Vistas y Funciones Definidas por el Usuario (UDF)
-- Autor: Guillermo Phelan
-- Requisito previo: Haber ejecutado scripts del 01 al 05
-- =======================================================================

use BaseDatos2TPO ;

-- 1. Vista: Catálogo de productos activos con su categoría

CREATE OR ALTER VIEW dbo.VW_Catalogo_Productos
AS
SELECT 
    p.IdProducto,
    p.Nombre AS Producto,
    p.Descripcion,
    p.Precio,
    p.Stock,
    c.Nombre AS Categoria
FROM dbo.Producto p
INNER JOIN dbo.Categoria c ON p.IdCategoria = c.IdCategoria
WHERE p.Activo = 1;
GO

-- 2. Función Escalar: Total acumulado en compras pagadas por un usuario


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



-- 3. Vista: Resumen de clientes registrados con total calculado

CREATE OR ALTER VIEW dbo.VW_Resumen_Clientes
AS
SELECT 
    u.IdUsuario,
    u.Nombre,
    u.Apellido,
    u.Email,
    u.Rol,
    dbo.fn_CalcularTotalGastadoPorUsuario(u.IdUsuario) AS TotalGastado
FROM dbo.Usuario u
WHERE u.Rol = 'Cliente';
GO

-- =======================================================================
-- PRUEBAS DE EJECUCIÓN (Verificación de resultados)
-- =======================================================================

/*
-- Verificar catálogo
SELECT * FROM dbo.VW_Catalogo_Productos;

-- Verificar clientes
SELECT * FROM dbo.VW_Resumen_Clientes;

-- Verificar cálculo de gasto por cliente
SELECT 
    u.IdUsuario,
    u.Nombre + ' ' + u.Apellido AS Cliente,
    dbo.fn_CalcularTotalGastadoPorUsuario(u.IdUsuario) AS TotalGastado
FROM dbo.Usuario u;
*/
GO