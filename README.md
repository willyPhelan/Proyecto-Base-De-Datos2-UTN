# 🖥️ PROYECTO BASE DE DATOS 2 - Sistema de Gestión Tipo "CompraGamer"

## 📝 Descripción del Proyecto
Este proyecto consiste en el diseño e implementación de una base de datos relacional para un e-commerce minorista especializado en la venta de componentes de PC y el ensamblaje de equipos personalizados. 

El sistema resuelve la problemática de gestionar un catálogo de productos, controlar el stock en tiempo real, procesar compras de manera transaccional, permitir a los usuarios armar sus propias PCs (guardando configuraciones) y ofrecer plantillas de equipos pre-armados por administradores.

## 👥 Integrantes del Equipo
*   **Guillermo Phelan** - Diseño de tablas, MockData base, Vistas y UDF.
*   **Pablo Brito** - MockData de catálogo, Stored Procedure transaccional y Vistas.
*   **Marcos Lewandowski** - MockData transaccional, Stored Procedure de reporte y Trigger de carrito.
*   **Luka** - MockData de ensamblaje, Triggers de integridad de stock y recálculo de precios.

---

## 🚀 Orden de Ejecución de Scripts
Para desplegar correctamente la base de datos y probar todos los objetos de programación, los scripts deben ejecutarse en el siguiente orden estricto:

### 1. Estructura Base
*   `01_DDL_Tablas.sql`: Crea la base de datos `BaseDatos2TPO`, todas las tablas, Primary Keys, Foreign Keys y Constraints (CHECK).

### 2. Carga de Datos (Mock Data)
*   `02_MockData_Guillermo.sql`: Usuarios, Categorías y Métodos de Pago.
*   `03_MockData_Pablo.sql`: Productos, Carritos y Detalles de Carrito.
*   `04_MockData_Marcos.sql`: Órdenes de Compra, Detalles de Orden, Configuraciones PC y Plantillas.
*   `05_MockData_Luka.sql`: Detalles de Configuración y Detalles de Plantillas.

### 3. Programación Avanzada (Objetos de BD)
*   `06_Vistas_y_UDF_Guillermo.sql`: Vistas de catálogo/resumen y Función Escalar (UDF).
*   `07_SP_Compra_Pablo.sql`: Stored Procedure de acción (`sp_ProcesarCompra`).
*   `08_SP_Reporte_Marcos.sql`: Stored Procedure de reporte de ventas.
*   `09_Triggers_Marcos.sql`: Trigger `INSTEAD OF INSERT` en el carrito.
*   `10_Triggers_Luka.sql`: Triggers `AFTER DELETE` (stock) y `AFTER UPDATE` (precios).

---

## ⚙️ Objetos de Base de Datos Implementados

### 📊 Vistas (Views)
1.  **`VW_Catalogo_Productos`**: Muestra el catálogo de productos activos con el nombre de su categoría (INNER JOIN).
2.  **`VW_Resumen_Clientes`**: Resumen de usuarios con rol 'Cliente' que **consume la función UDF** para mostrar el total gastado por cada uno.
3.  **`VW_Detalle_Ordenes_Exitosas`**: Reporte de ventas concretadas.

### 🧮 Funciones de Usuario (UDF)
*   **`fn_CalcularTotalGastadoPorUsuario(@IdUsuario)`**: Función escalar que suma el total de las compras en estado 'Pagado' de un usuario, manejando nulos con `ISNULL`.

### 🛠️ Procedimientos Almacenados (Stored Procedures)
*   **De Acción (`sp_ProcesarCompra`)**: Gestiona la lógica de venta completa. Valida stock, inserta la cabecera de la orden, el detalle, descuenta stock y vacía el carrito. Utiliza `BEGIN TRAN`, `COMMIT` y `ROLLBACK` con bloque `TRY/CATCH`.
*   **De Reporte (`SP_REPORTE_VENTA_ENTRE_2_FECHAS`)**: Recibe un rango de fechas parametrizado (`@FECHA_INICIAL`, `@FECHA_FINAL`) y devuelve un reporte con los datos del cliente, método de pago y total. Implementa control de errores con `TRY/CATCH` y `RAISERROR`.

### 🎯 Triggers
*   **INSERT (`TR_AGREGAR_PRODUCTO_CARRITO`)**: Trigger `INSTEAD OF INSERT` en `DetalleCarrito`. Aplica la regla de negocio: si el usuario agrega un producto que ya tiene en el carrito, **suma la cantidad** en lugar de generar una fila duplicada (Upsert).
*   **DELETE (`TR_RESTAURAR_STOCK`)**: Trigger `AFTER DELETE` en `OrdenCompra`. Si una orden se elimina/cancela, restaura automáticamente el stock físico de los productos asociados.
*   **UPDATE (`TR_RECALCULAR_PRECIO_PLANTILLA`)**: Trigger `AFTER UPDATE` en `Producto`. Si cambia el precio de un componente, recalcula automáticamente el `PrecioTotalCalculado` de las plantillas pre-armadas que lo contienen (Bonus).

---

## 🛡️ Conceptos Técnicos Aplicados
*   **Integridad Referencial:** Uso estricto de Foreign Keys y restricciones `CHECK` (ej. roles y estados válidos).
*   **Manejo de Transacciones:** Los Stored Procedures y Triggers críticos aseguran la atomicidad de los datos (todo o nada) mediante `TRY/CATCH` y `ROLLBACK`.
*   **Tablas Virtuales:** Uso de `INSERTED` y `DELETED` en los triggers para auditar y actuar sobre los datos modificados.
*   **Consultas Parametrizadas:** Prevención de inyecciones y flexibilidad en los reportes.

---

## 🧪 Pruebas y Depuración
El proyecto incluye al final de cada script bloques de prueba comentados (`/* ... */`) que permiten verificar el correcto funcionamiento de las vistas, la ejecución de los SPs con fechas de prueba, y el comportamiento de los triggers al insertar, modificar o eliminar registros.
