USE BaseDatos2TPO;
GO


-- 1. DetalleConfiguracion
INSERT INTO DetalleConfiguracion (IdConfiguracion, IdProducto, Cantidad)
VALUES
(1, 11, 1),
(1, 13, 1),
(1, 15, 1),
(2, 9, 2),
(2, 6, 1);
GO

-- 2. PlantillaPC
INSERT INTO PlantillaPC (Nombre, Descripcion, PrecioTotalCalculado, Activo)
VALUES
('PC Gamer 1080p', 'Equilibrio precio/rendimiento para jugar en Full HD', NULL, 1);
GO

-- 3. DetallePlantillaPC
INSERT INTO DetallePlantillaPC (IdPlantilla, IdProducto, Cantidad)
VALUES
(1, 11, 1),
(1, 13, 1),
(2, 12, 1),
(2, 16, 1),
(3, 1, 1),
(3, 6, 1),
(3, 9, 1),
(3, 11, 1),
(3, 13, 1),
(3, 15, 1);
GO

-- 4. Recalcular precio de las plantillas
UPDATE PL
SET PL.PrecioTotalCalculado = (
    SELECT SUM(P.Precio * DP.Cantidad)
    FROM DetallePlantillaPC DP
    INNER JOIN Producto P ON P.IdProducto = DP.IdProducto
    WHERE DP.IdPlantilla = PL.IdPlantilla
)
FROM PlantillaPC PL;
GO


--Prueba
SELECT PL.IdPlantilla, PL.Nombre, PL.PrecioTotalCalculado,
       SUM(P.Precio * DP.Cantidad) AS SumaReal
FROM PlantillaPC PL
INNER JOIN DetallePlantillaPC DP ON DP.IdPlantilla = PL.IdPlantilla
INNER JOIN Producto P ON P.IdProducto = DP.IdProducto
GROUP BY PL.IdPlantilla, PL.Nombre, PL.PrecioTotalCalculado;
