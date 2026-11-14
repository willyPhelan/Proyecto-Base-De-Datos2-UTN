USE BaseDatos2TPO;
GO

-- =======================================================================
-- SCRIPT 02: Mock Data - Seguridad, Métodos de Pago y Categorías
-- Autor: Guillermo Phelan
-- Tablas: MetodoPago, Usuario, Categoria
-- Requisito previo: Haber ejecutado 01_DDL_Tablas.sql
-- =======================================================================

-- 1. Métodos de Pago
INSERT INTO MetodoPago (Nombre, Activo) VALUES 
('Tarjeta de Crédito', 1),
('Transferencia Bancaria', 1);
GO

-- 2. Usuarios (Clientes y Administrador)
INSERT INTO Usuario (Nombre, Apellido, Email, ContraseñaHash, Rol) VALUES 
('Guillermo', 'Phelan', 'guillermo.phelan@email.com', 'hash_seguro_123', 'Cliente'),
('Marcos', 'Lewandowski', 'marcos.lewandowski@email.com', 'hash_seguro_456', 'Cliente'),
('Admin', 'Sistema', 'admin.sistema@email.com', 'hash_seguro_789', 'Administrador');
GO

-- 3. Categorías de Hardware
INSERT INTO Categoria (Nombre, EsEsencial, Activo) VALUES 
('Tarjetas Gráficas', 1, 1),
('Microprocesadores', 1, 1),
('Memorias RAM', 1, 1),
('Motherboards', 1, 1),
('Almacenamiento', 1, 1),
('Fuentes de Poder', 1, 1);
GO