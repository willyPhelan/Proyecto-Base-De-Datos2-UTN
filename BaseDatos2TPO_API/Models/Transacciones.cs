namespace BaseDatos2TPO_API.Models;

public class Carrito
{
    public int IdCarrito { get; set; }
    public int IdUsuario { get; set; }
    public DateTime FechaCreacion { get; set; }
    public List<DetalleCarrito> Items { get; set; } = new();
    public decimal Total => Items.Sum(i => i.Subtotal);
}

public class DetalleCarrito
{
    public int IdDetalleCarrito { get; set; }
    public int IdCarrito { get; set; }
    public int IdProducto { get; set; }
    public string Producto { get; set; } = String.Empty;
    public decimal Precio { get; set; }
    public int Cantidad { get; set; }
    public decimal Subtotal => Precio * Cantidad;
}

public class OrdenCompra
{
    public int IdOrden { get; set; }
    public int IdUsuario { get; set; }
    public string? Cliente { get; set; }
    public int IdMetodoPago { get; set; }
    public string? MetodoPago { get; set; }
    public DateTime FechaOrden { get; set; }
    public decimal Total { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public List<DetalleOrden> Detalles { get; set; } = new();
}

public class DetalleOrden
{
    public int IdDetalleOrden { get; set; }
    public int IdOrden { get; set; }
    public int IdProducto { get; set; }
    public string Producto { get; set; } = String.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal => PrecioUnitario * Cantidad;
}
