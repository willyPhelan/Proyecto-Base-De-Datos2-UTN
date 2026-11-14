namespace BaseDatos2TPO_API.Services;

public class UsuarioService
{
    private static readonly string[] RolesValidos = { "Cliente", "Administrador" };

    private readonly DapperContext _context;

    public UsuarioService(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<Usuario>> GetAll()
    {
        const string sql = "SELECT IdUsuario, Nombre, Apellido, Email, Rol FROM Usuario ORDER BY Apellido, Nombre";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<Usuario>(sql);
        return list.ToList();
    }

    public async Task<Usuario?> GetById(int id)
    {
        const string sql = "SELECT IdUsuario, Nombre, Apellido, Email, Rol FROM Usuario WHERE IdUsuario = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Usuario>(sql, new { Id = id });
    }

    // VW_Resumen_Clientes (usa fn_CalcularTotalGastadoPorUsuario)
    public async Task<List<ResumenCliente>> GetResumenClientes()
    {
        const string sql = @"
            SELECT IdUsuario, Nombre, Apellido, Email, Rol, TotalGastado
            FROM dbo.VW_Resumen_Clientes
            ORDER BY TotalGastado DESC";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<ResumenCliente>(sql);
        return list.ToList();
    }

    // UDF fn_CalcularTotalGastadoPorUsuario
    public async Task<decimal> GetTotalGastado(int id)
    {
        const string sql = "SELECT dbo.fn_CalcularTotalGastadoPorUsuario(@Id)";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteScalarAsync<decimal>(sql, new { Id = id });
    }

    public async Task<Usuario> Create(UsuarioCreateRequest request)
    {
        Validar(request.Nombre, request.Apellido, request.Email, request.Rol);
        if (String.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentException("La contraseña es requerida");

        const string sql = @"
            INSERT INTO Usuario (Nombre, Apellido, Email, [ContraseñaHash], Rol)
            VALUES (@Nombre, @Apellido, @Email, @Hash, @Rol);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var conn = await _context.CreateConnectionAsync();
        var id = await conn.ExecuteScalarAsync<int>(sql, new
        {
            request.Nombre,
            request.Apellido,
            request.Email,
            Hash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            request.Rol
        });

        return new Usuario
        {
            IdUsuario = id,
            Nombre = request.Nombre,
            Apellido = request.Apellido,
            Email = request.Email,
            Rol = request.Rol
        };
    }

    public async Task<int> Update(int id, UsuarioUpdateRequest request)
    {
        Validar(request.Nombre, request.Apellido, request.Email, request.Rol);

        const string sql = @"
            UPDATE Usuario
            SET Nombre = @Nombre,
                Apellido = @Apellido,
                Email = @Email,
                Rol = @Rol
            WHERE IdUsuario = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { request.Nombre, request.Apellido, request.Email, request.Rol, Id = id });
    }

    private static void Validar(string nombre, string apellido, string email, string rol)
    {
        if (String.IsNullOrWhiteSpace(nombre) || String.IsNullOrWhiteSpace(apellido) || String.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Nombre, apellido y email son requeridos");
        if (!RolesValidos.Contains(rol))
            throw new ArgumentException("Rol inválido. Valores permitidos: Cliente, Administrador");
    }
}
