using System.Data;

namespace BaseDatos2TPO_API.Services;

public class OrdenService
{
    public static readonly string[] EstadosValidos = { "Pendiente", "Pagado", "Cancelado" };

    private const string SelectOrden = @"
        SELECT O.IdOrden, O.IdUsuario, U.Nombre + ' ' + U.Apellido AS Cliente,
               O.IdMetodoPago, M.Nombre AS MetodoPago, O.FechaOrden, O.Total, O.Estado
        FROM OrdenCompra O
        INNER JOIN Usuario U ON U.IdUsuario = O.IdUsuario
        INNER JOIN MetodoPago M ON M.IdMetodoPago = O.IdMetodoPago";

    private readonly DapperContext _context;

    public OrdenService(DapperContext context)
    {
        _context = context;
    }

    public async Task<List<OrdenCompra>> GetList(string? estado, int? idUsuario)
    {
        string sql = SelectOrden + @"
            WHERE (@Estado IS NULL OR O.Estado = @Estado)
              AND (@IdUsuario IS NULL OR O.IdUsuario = @IdUsuario)
            ORDER BY O.FechaOrden DESC";

        using var conn = await _context.CreateConnectionAsync();
        var list = await conn.QueryAsync<OrdenCompra>(sql, new { Estado = estado, IdUsuario = idUsuario });
        return list.ToList();
    }

    public async Task<OrdenCompra?> GetById(int id)
    {
        string sql = SelectOrden + @" WHERE O.IdOrden = @Id;

            SELECT D.IdDetalleOrden, D.IdOrden, D.IdProducto, P.Nombre AS Producto, D.Cantidad, D.PrecioUnitario
            FROM DetalleOrden D
            INNER JOIN Producto P ON P.IdProducto = D.IdProducto
            WHERE D.IdOrden = @Id
            ORDER BY D.IdDetalleOrden;";

        using var conn = await _context.CreateConnectionAsync();
        using var multi = await conn.QueryMultipleAsync(sql, new { Id = id });

        var orden = await multi.ReadSingleOrDefaultAsync<OrdenCompra>();
        if (orden == null) return null;

        orden.Detalles = (await multi.ReadAsync<DetalleOrden>()).ToList();
        return orden;
    }

    // sp_ProcesarCompra (07_SP_Compra_Pablo.sql): valida stock, crea la orden,
    // descuenta stock y vacía el carrito. Devuelve la orden creada.
    public async Task<OrdenCompra?> ProcesarCompra(ProcesarCompraRequest request)
    {
        using var conn = await _context.CreateConnectionAsync();

        await conn.ExecuteAsync("dbo.sp_ProcesarCompra",
            new { request.IdUsuario, request.IdMetodoPago },
            commandType: CommandType.StoredProcedure);

        var idOrden = await conn.ExecuteScalarAsync<int?>(
            "SELECT MAX(IdOrden) FROM OrdenCompra WHERE IdUsuario = @IdUsuario",
            new { request.IdUsuario });

        return idOrden == null ? null : await GetById(idOrden.Value);
    }

    // Pasar a 'Cancelado' dispara TR_RESTAURAR_STOCK (baja lógica)
    public async Task<int> CambiarEstado(int id, string estado)
    {
        const string sql = "UPDATE OrdenCompra SET Estado = @Estado WHERE IdOrden = @Id";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteAsync(sql, new { Id = id, Estado = estado });
    }

    // Baja física: TR_ELIMINAR_ORDEN (INSTEAD OF DELETE) borra detalles y restaura stock
    public async Task<bool> Delete(int id)
    {
        const string sql = @"
            IF NOT EXISTS (SELECT 1 FROM OrdenCompra WHERE IdOrden = @Id)
                SELECT CAST(0 AS BIT);
            ELSE
            BEGIN
                DELETE FROM OrdenCompra WHERE IdOrden = @Id;
                SELECT CAST(1 AS BIT);
            END";

        using var conn = await _context.CreateConnectionAsync();
        return await conn.ExecuteScalarAsync<bool>(sql, new { Id = id });
    }

    // SP_REPORTE_VENTA_ENTRE_2_FECHAS: las columnas tienen espacios, se mapean a mano
    public async Task<List<ReporteVenta>> ReporteVentas(DateTime desde, DateTime hasta)
    {
        using var conn = await _context.CreateConnectionAsync();
        var rows = await conn.QueryAsync("dbo.SP_REPORTE_VENTA_ENTRE_2_FECHAS",
            new { FECHA_INICIAL = desde.Date, FECHA_FINAL = hasta.Date },
            commandType: CommandType.StoredProcedure);

        return rows
            .Cast<IDictionary<string, object>>()
            .Select(r => new ReporteVenta
            {
                IdOrden = (int)r["IdOrden"],
                FechaOrden = (DateTime)r["FechaOrden"],
                NombreCliente = (string)r["Nombre del Cliente"],
                MetodoPago = (string)r["Método de Pago"],
                Total = (decimal)r["Total"]
            })
            .ToList();
    }
}
