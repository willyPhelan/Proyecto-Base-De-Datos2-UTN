namespace BaseDatos2TPO_API.Dto;

// Resultado de SP_REPORTE_VENTA_ENTRE_2_FECHAS
public class ReporteVenta
{
    public int IdOrden { get; set; }
    public DateTime FechaOrden { get; set; }
    public string NombreCliente { get; set; } = String.Empty;
    public string MetodoPago { get; set; } = String.Empty;
    public decimal Total { get; set; }
}
