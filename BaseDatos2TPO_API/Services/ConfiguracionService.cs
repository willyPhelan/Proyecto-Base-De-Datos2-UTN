namespace BaseDatos2TPO_API.Services;

public class ConfiguracionService
{
    private readonly DapperContext _context;

    public ConfiguracionService(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<ConfiguracionPC>> GetByUsuario(int idUsuario)
    {
        const string sql = @"
            SELECT IdConfiguracion, IdUsuario, NombreConfiguracion, FechaCreacion
            FROM ConfiguracionPC
            WHERE IdUsuario = @IdUsuario
            ORDER BY FechaCreacion DESC";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<ConfiguracionPC>(sql, new { IdUsuario = idUsuario });
        return list.ToList();
    }

    public async Task<ConfiguracionPC?> GetById(int id)
    {
        const string sql = @"
            SELECT IdConfiguracion, IdUsuario, NombreConfiguracion, FechaCreacion
            FROM ConfiguracionPC WHERE IdConfiguracion = @Id;

            SELECT D.IdProducto, P.Nombre AS Producto, C.Nombre AS Categoria, P.Precio, D.Cantidad
            FROM DetalleConfiguracion D
            INNER JOIN Producto P ON P.IdProducto = D.IdProducto
            INNER JOIN Categoria C ON C.IdCategoria = P.IdCategoria
            WHERE D.IdConfiguracion = @Id
            ORDER BY C.Nombre;";

        using var conn = await _context.CreateConnectionAsync();
        using var multi = await conn.QueryMultipleAsync(sql, new { Id = id });

        var config = await multi.ReadSingleOrDefaultAsync<ConfiguracionPC>();
        if (config == null) return null;

        config.Detalles = (await multi.ReadAsync<ItemPC>()).ToList();
        return config;
    }

    public async Task<int> Create(ConfiguracionRequest request)
    {
        if (String.IsNullOrWhiteSpace(request.NombreConfiguracion))
            throw new ArgumentException("El nombre de la configuración es requerido");
        ValidarItems(request.Items);

        using var conn = await _context.CreateConnectionAsync();
        using var tran = conn.BeginTransaction();

        var id = await conn.ExecuteScalarAsync<int>(@"
            INSERT INTO ConfiguracionPC (IdUsuario, NombreConfiguracion)
            VALUES (@IdUsuario, @NombreConfiguracion);
            SELECT CAST(SCOPE_IDENTITY() AS INT);", request, tran);

        foreach (var item in request.Items)
        {
            await conn.ExecuteAsync(UpsertItemSql, new { Id = id, item.IdProducto, item.Cantidad }, tran);
        }

        tran.Commit();
        return id;
    }

    public async Task<int> UpdateNombre(int id, string nombre)
    {
        if (String.IsNullOrWhiteSpace(nombre))
            throw new ArgumentException("El nombre de la configuración es requerido");

        const string sql = "UPDATE ConfiguracionPC SET NombreConfiguracion = @Nombre WHERE IdConfiguracion = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id, Nombre = nombre });
    }

    // Baja física (la tabla no tiene campo Activo)
    public async Task<bool> Delete(int id)
    {
        using var conn = await _context.CreateConnectionAsync();
        using var tran = conn.BeginTransaction();

        await conn.ExecuteAsync("DELETE FROM DetalleConfiguracion WHERE IdConfiguracion = @Id", new { Id = id }, tran);
        var rows = await conn.ExecuteAsync("DELETE FROM ConfiguracionPC WHERE IdConfiguracion = @Id", new { Id = id }, tran);

        tran.Commit();
        return rows > 0;
    }

    public async Task AgregarProducto(int id, ItemRequest item)
    {
        ValidarItems(new() { item });

        using var conn = await _context.CreateConnectionAsync();
        await conn.ExecuteAsync(UpsertItemSql, new { Id = id, item.IdProducto, item.Cantidad });
    }

    public async Task<bool> QuitarProducto(int id, int idProducto)
    {
        const string sql = "DELETE FROM DetalleConfiguracion WHERE IdConfiguracion = @Id AND IdProducto = @IdProducto";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id, IdProducto = idProducto }) > 0;
    }

    // Si el producto ya está en la configuración, suma la cantidad
    private const string UpsertItemSql = @"
        IF EXISTS (SELECT 1 FROM DetalleConfiguracion WHERE IdConfiguracion = @Id AND IdProducto = @IdProducto)
            UPDATE DetalleConfiguracion SET Cantidad = Cantidad + @Cantidad
            WHERE IdConfiguracion = @Id AND IdProducto = @IdProducto;
        ELSE
            INSERT INTO DetalleConfiguracion (IdConfiguracion, IdProducto, Cantidad)
            VALUES (@Id, @IdProducto, @Cantidad);";

    private static void ValidarItems(List<ItemRequest> items)
    {
        if (items.Any(i => i.Cantidad <= 0))
            throw new ArgumentException("La cantidad debe ser mayor a 0");
    }
}
