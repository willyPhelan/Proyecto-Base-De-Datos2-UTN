namespace BaseDatos2TPO_API.Services;

public class MetodoPagoService
{
    private readonly DapperContext _context;

    public MetodoPagoService(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<MetodoPago>> GetActiveList()
    {
        const string sql = "SELECT IdMetodoPago, Nombre, Activo FROM MetodoPago WHERE Activo = 1 ORDER BY Nombre";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<MetodoPago>(sql);
        return list.ToList();
    }

    public async Task<MetodoPago?> GetById(int id)
    {
        const string sql = "SELECT IdMetodoPago, Nombre, Activo FROM MetodoPago WHERE IdMetodoPago = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<MetodoPago>(sql, new { Id = id });
    }

    public async Task<MetodoPago> Create(MetodoPago model)
    {
        const string sql = @"
            INSERT INTO MetodoPago (Nombre, Activo) VALUES (@Nombre, 1);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var conn = await _context.CreateConnectionAsync();
        model.IdMetodoPago = await conn.ExecuteScalarAsync<int>(sql, model);
        model.Activo = true;
        return model;
    }

    public async Task<int> Update(int id, MetodoPago model)
    {
        const string sql = "UPDATE MetodoPago SET Nombre = @Nombre WHERE IdMetodoPago = @IdMetodoPago";

        model.IdMetodoPago = id;

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, model);
    }

    // BAJA LÓGICA
    public async Task<bool> Delete(int id)
    {
        const string sql = "UPDATE MetodoPago SET Activo = 0 WHERE IdMetodoPago = @Id AND Activo = 1";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
    }
}
