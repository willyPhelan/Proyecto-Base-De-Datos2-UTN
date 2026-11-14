namespace BaseDatos2TPO_API.Models;

public class ConfiguracionPC
{
    public int IdConfiguracion { get; set; }
    public int IdUsuario { get; set; }
    public string NombreConfiguracion { get; set; } = String.Empty;
    public DateTime FechaCreacion { get; set; }
    public List<ItemPC> Detalles { get; set; } = new();
    public decimal Total => Detalles.Sum(d => d.Subtotal);
}

public class PlantillaPC
{
    public int IdPlantilla { get; set; }
    public string Nombre { get; set; } = String.Empty;
    public string? Descripcion { get; set; }
    public decimal? PrecioTotalCalculado { get; set; }
    public bool Activo { get; set; } = true;
    public List<ItemPC> Detalles { get; set; } = new();
}

// Fila de DetalleConfiguracion / DetallePlantillaPC con datos del producto
public class ItemPC
{
    public int IdProducto { get; set; }
    public string Producto { get; set; } = String.Empty;
    public string Categoria { get; set; } = String.Empty;
    public decimal Precio { get; set; }
    public int Cantidad { get; set; }
    public decimal Subtotal => Precio * Cantidad;
}
