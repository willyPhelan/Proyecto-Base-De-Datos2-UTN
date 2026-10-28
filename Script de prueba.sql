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