namespace BaseDatos2TPO_API.Models;

public class Categoria
{
    public int IdCategoria { get; set; }
    public string Nombre { get; set; } = String.Empty;
    public bool EsEsencial { get; set; }
    public bool Activo { get; set; } = true;
}

public class Producto
{
    public int IdProducto { get; set; }
    public int IdCategoria { get; set; }
    public string Nombre { get; set; } = String.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public bool Activo { get; set; } = true;
}

// VW_Catalogo_Productos
public class CatalogoProducto
{
    public int IdProducto { get; set; }
    public string Producto { get; set; } = String.Empty;
    public string? Descripcion { get; set; }
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public string Categoria { get; set; } = String.Empty;
}

public class MetodoPago
{
    public int IdMetodoPago { get; set; }
    public string Nombre { get; set; } = String.Empty;
    public bool Activo { get; set; } = true;
}
