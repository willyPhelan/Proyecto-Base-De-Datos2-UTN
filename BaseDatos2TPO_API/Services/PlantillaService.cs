using System.Data;

namespace BaseDatos2TPO_API.Services;

public class PlantillaService
{
    private readonly DapperContext _context;

    public PlantillaService(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<PlantillaPC>> GetActiveList()
    {
        const string sql = @"
            SELECT IdPlantilla, Nombre, Descripcion, PrecioTotalCalculado, Activo
            FROM PlantillaPC
            WHERE Activo = 1
            ORDER BY PrecioTotalCalculado";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<PlantillaPC>(sql);
        return list.ToList();
    }

    public async Task<PlantillaPC?> GetById(int id)
    {
        const string sql = @"
            SELECT IdPlantilla, Nombre, Descripcion, PrecioTotalCalculado, Activo
            FROM PlantillaPC WHERE IdPlantilla = @Id;

            SELECT D.IdProducto, P.Nombre AS Producto, C.Nombre AS Categoria, P.Precio, D.Cantidad
            FROM DetallePlantillaPC D
            INNER JOIN Producto P ON P.IdProducto = D.IdProducto
            INNER JOIN Categoria C ON C.IdCategoria = P.IdCategoria
            WHERE D.IdPlantilla = @Id
            ORDER BY C.Nombre;";

        using var conn = await _context.CreateConnectionAsync();
        using var multi = await conn.QueryMultipleAsync(sql, new { Id = id });

        var plantilla = await multi.ReadSingleOrDefaultAsync<PlantillaPC>();
        if (plantilla == null) return null;

        plantilla.Detalles = (await multi.ReadAsync<ItemPC>()).ToList();
        return plantilla;
    }

    public async Task<int> Create(PlantillaRequest request)
    {
        if (String.IsNullOrWhiteSpace(request.Nombre))
            throw new ArgumentException("El nombre de la plantilla es requerido");
        ValidarItems(request.Items);

        using var conn = await _context.CreateConnectionAsync();
        using var tran = conn.BeginTransaction();

        var id = await conn.ExecuteScalarAsync<int>(@"
            INSERT INTO PlantillaPC (Nombre, Descripcion, PrecioTotalCalculado, Activo)
            VALUES (@Nombre, @Descripcion, 0, 1);
            SELECT CAST(SCOPE_IDENTITY() AS INT);", request, tran);

        foreach (var item in request.Items)
        {
            await conn.ExecuteAsync(UpsertItemSql, new { Id = id, item.IdProducto, item.Cantidad }, tran);
        }

        await RecalcularPrecio(conn, id, tran);

        tran.Commit();
        return id;
    }

    public async Task<int> Update(int id, PlantillaRequest request)
    {
        if (String.IsNullOrWhiteSpace(request.Nombre))
            throw new ArgumentException("El nombre de la plantilla es requerido");

        const string sql = "UPDATE PlantillaPC SET Nombre = @Nombre, Descripcion = @Descripcion WHERE IdPlantilla = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id, request.Nombre, request.Descripcion });
    }

    // BAJA LÓGICA
    public async Task<bool> Delete(int id)
    {
        const string sql = "UPDATE PlantillaPC SET Activo = 0 WHERE IdPlantilla = @Id AND Activo = 1";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
    }

    public async Task AgregarProducto(int id, ItemRequest item)
    {
        ValidarItems(new() { item });

        using var conn = await _context.CreateConnectionAsync();
        using var tran = conn.BeginTransaction();

        await conn.ExecuteAsync(UpsertItemSql, new { Id = id, item.IdProducto, item.Cantidad }, tran);
        await RecalcularPrecio(conn, id, tran);

        tran.Commit();
    }

    public async Task<bool> QuitarProducto(int id, int idProducto)
    {
        using var conn = await _context.CreateConnectionAsync();
        using var tran = conn.BeginTransaction();

        var rows = await conn.ExecuteAsync(
            "DELETE FROM DetallePlantillaPC WHERE IdPlantilla = @Id AND IdProducto = @IdProducto",
            new { Id = id, IdProducto = idProducto }, tran);
        await RecalcularPrecio(conn, id, tran);

        tran.Commit();
        return rows > 0;
    }

    // Misma fórmula que TR_RECALCULAR_PRECIO_PLANTILLA (el trigger solo
    // se dispara al cambiar precios de Producto, no al tocar el detalle)
    private static Task RecalcularPrecio(IDbConnection conn, int id, IDbTransaction tran)
    {
        const string sql = @"
            UPDATE PlantillaPC
            SET PrecioTotalCalculado = ISNULL((
                SELECT SUM(P.Precio * DP.Cantidad)
                FROM DetallePlantillaPC DP
                INNER JOIN Producto P ON P.IdProducto = DP.IdProducto
                WHERE DP.IdPlantilla = @Id), 0)
            WHERE IdPlantilla = @Id";

        return conn.ExecuteAsync(sql, new { Id = id }, tran);
    }

    private const string UpsertItemSql = @"
        IF EXISTS (SELECT 1 FROM DetallePlantillaPC WHERE IdPlantilla = @Id AND IdProducto = @IdProducto)
            UPDATE DetallePlantillaPC SET Cantidad = Cantidad + @Cantidad
            WHERE IdPlantilla = @Id AND IdProducto = @IdProducto;
        ELSE
            INSERT INTO DetallePlantillaPC (IdPlantilla, IdProducto, Cantidad)
            VALUES (@Id, @IdProducto, @Cantidad);";

    private static void ValidarItems(List<ItemRequest> items)
    {
        if (items.Any(i => i.Cantidad <= 0))
            throw new ArgumentException("La cantidad debe ser mayor a 0");
    }
}
