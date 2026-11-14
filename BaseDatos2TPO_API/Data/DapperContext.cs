using Microsoft.Data.SqlClient;
using System.Data;

namespace BaseDatos2TPO_API.Data;

public class DapperContext
{
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        string? conn = configuration.GetConnectionString("DefaultConnection");
        if (conn == null)
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }
        _connectionString = conn;
    }

    public async Task<IDbConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }
}
