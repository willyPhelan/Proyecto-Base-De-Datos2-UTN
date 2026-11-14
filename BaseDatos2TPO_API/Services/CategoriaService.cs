namespace BaseDatos2TPO_API.Services;

public class CategoriaService
{
    private readonly DapperContext _context;

    public CategoriaService(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<Categoria>> GetActiveList()
    {
        const string sql = @"
            SELECT IdCategoria, Nombre, EsEsencial, Activo
            FROM Categoria
            WHERE Activo = 1
            ORDER BY Nombre";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<Categoria>(sql);
        return list.ToList();
    }

    public async Task<Categoria?> GetById(int id)
    {
        const string sql = "SELECT IdCategoria, Nombre, EsEsencial, Activo FROM Categoria WHERE IdCategoria = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Categoria>(sql, new { Id = id });
    }

    public async Task<Categoria> Create(Categoria model)
    {
        const string sql = @"
            INSERT INTO Categoria (Nombre, EsEsencial, Activo)
            VALUES (@Nombre, @EsEsencial, 1);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var conn = await _context.CreateConnectionAsync();
        model.IdCategoria = await conn.ExecuteScalarAsync<int>(sql, model);
        model.Activo = true;
        return model;
    }

    public async Task<int> Update(int id, Categoria model)
    {
        const string sql = @"
            UPDATE Categoria
            SET Nombre = @Nombre,
                EsEsencial = @EsEsencial
            WHERE IdCategoria = @IdCategoria";

        model.IdCategoria = id;

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, model);
    }

    // BAJA LÓGICA
    public async Task<bool> Delete(int id)
    {
        const string sql = "UPDATE Categoria SET Activo = 0 WHERE IdCategoria = @Id AND Activo = 1";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id }) > 0;
    }
}
