namespace BaseDatos2TPO_API.Services;

public class CarritoService
{
    private readonly DapperContext _context;

    public CarritoService(DapperContext context)
    {
        _context = context;
    }

    public async Task<Carrito?> GetByUsuario(int idUsuario)
    {
        const string sql = @"
            SELECT IdCarrito, IdUsuario, FechaCreacion
            FROM Carrito WHERE IdUsuario = @IdUsuario;

            SELECT DC.IdDetalleCarrito, DC.IdCarrito, DC.IdProducto, P.Nombre AS Producto, P.Precio, DC.Cantidad
            FROM DetalleCarrito DC
            INNER JOIN Carrito C ON C.IdCarrito = DC.IdCarrito
            INNER JOIN Producto P ON P.IdProducto = DC.IdProducto
            WHERE C.IdUsuario = @IdUsuario
            ORDER BY DC.IdDetalleCarrito;";

        using var conn = await _context.CreateConnectionAsync();
        using var multi = await conn.QueryMultipleAsync(sql, new { IdUsuario = idUsuario });

        var carrito = await multi.ReadSingleOrDefaultAsync<Carrito>();
        if (carrito == null) return null;

        carrito.Items = (await multi.ReadAsync<DetalleCarrito>()).ToList();
        return carrito;
    }

    // Crea el carrito si no existe. El INSERT en DetalleCarrito dispara
    // TR_AGREGAR_PRODUCTO_CARRITO: si el producto ya está, suma la cantidad.
    public async Task AgregarItem(int idUsuario, ItemRequest item)
    {
        if (item.Cantidad <= 0)
            throw new ArgumentException("La cantidad debe ser mayor a 0");

        const string sql = @"
            IF NOT EXISTS (SELECT 1 FROM Producto WHERE IdProducto = @IdProducto AND Activo = 1)
                THROW 50001, 'El producto no existe o está inactivo', 1;

            IF NOT EXISTS (SELECT 1 FROM Carrito WHERE IdUsuario = @IdUsuario)
                INSERT INTO Carrito (IdUsuario) VALUES (@IdUsuario);

            INSERT INTO DetalleCarrito (IdCarrito, IdProducto, Cantidad)
            SELECT IdCarrito, @IdProducto, @Cantidad
            FROM Carrito WHERE IdUsuario = @IdUsuario;";

        using var conn = await _context.CreateConnectionAsync();
        await conn.ExecuteAsync(sql, new { IdUsuario = idUsuario, item.IdProducto, item.Cantidad });
    }

    public async Task<int> ActualizarCantidad(int idUsuario, int idProducto, int cantidad)
    {
        if (cantidad <= 0)
            throw new ArgumentException("La cantidad debe ser mayor a 0");

        const string sql = @"
            UPDATE DC SET DC.Cantidad = @Cantidad
            FROM DetalleCarrito DC
            INNER JOIN Carrito C ON C.IdCarrito = DC.IdCarrito
            WHERE C.IdUsuario = @IdUsuario AND DC.IdProducto = @IdProducto";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { IdUsuario = idUsuario, IdProducto = idProducto, Cantidad = cantidad });
    }

    public async Task<bool> QuitarItem(int idUsuario, int idProducto)
    {
        const string sql = @"
            DELETE DC
            FROM DetalleCarrito DC
            INNER JOIN Carrito C ON C.IdCarrito = DC.IdCarrito
            WHERE C.IdUsuario = @IdUsuario AND DC.IdProducto = @IdProducto";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { IdUsuario = idUsuario, IdProducto = idProducto }) > 0;
    }

    public async Task<int> Vaciar(int idUsuario)
    {
        const string sql = @"
            DELETE DC
            FROM DetalleCarrito DC
            INNER JOIN Carrito C ON C.IdCarrito = DC.IdCarrito
            WHERE C.IdUsuario = @IdUsuario";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { IdUsuario = idUsuario });
    }
}
