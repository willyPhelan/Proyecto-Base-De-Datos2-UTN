namespace BaseDatos2TPO_API.Services;

public class ProductoService
{
    private readonly DapperContext _context;

    public ProductoService(DapperContext context)
    {
        _context = context;
    }

    // VW_Catalogo_Productos (solo activos, con nombre de categoría)
    public async Task<List<CatalogoProducto>> GetCatalogo(int? idCategoria)
    {
        const string sql = @"
            SELECT V.IdProducto, V.Producto, V.Descripcion, V.Precio, V.Stock, V.Categoria
            FROM dbo.VW_Catalogo_Productos V
            INNER JOIN Producto P ON P.IdProducto = V.IdProducto
            WHERE @IdCategoria IS NULL OR P.IdCategoria = @IdCategoria
            ORDER BY V.Categoria, V.Producto";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<CatalogoProducto>(sql, new { IdCategoria = idCategoria });
        return list.ToList();
    }

    public async Task<Producto?> GetById(int id)
    {
        const string sql = @"
            SELECT IdProducto, IdCategoria, Nombre, Descripcion, Precio, Stock, Activo
            FROM Producto WHERE IdProducto = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Producto>(sql, new { Id = id });
    }

    public async Task<Producto> Create(Producto model)
    {
        const string sql = @"
            INSERT INTO Producto (IdCategoria, Nombre, Descripcion, Precio, Stock, Activo)
            VALUES (@IdCategoria, @Nombre, @Descripcion, @Precio, @Stock, 1);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var conn = await _context.CreateConnectionAsync();
        model.IdProducto = await conn.ExecuteScalarAsync<int>(sql, model);
        model.Activo = true;
        return model;
    }

    // Si cambia el Precio se dispara TR_RECALCULAR_PRECIO_PLANTILLA
    public async Task<int> Update(int id, Producto model)
    {
        const string sql = @"
            UPDATE Producto
            SET IdCategoria = @IdCategoria,
                Nombre = @Nombre,
                Descripcion = @Descripcion,
                Precio = @Precio,
                Stock = @Stock
            WHERE IdProducto = @IdProducto";

        model.IdProducto = id;

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, model);
    }

    // BAJA LÓGICA
    public async Task<bool> Delete(int id)
    {
        const string sql = "UPDATE Producto SET Activo = 0 WHERE IdProducto = @Id AND Activo = 1";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
    }
}
