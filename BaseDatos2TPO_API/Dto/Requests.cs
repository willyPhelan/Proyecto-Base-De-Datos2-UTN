namespace BaseDatos2TPO_API.Dto;

public class UsuarioCreateRequest
{
    public string Nombre { get; set; } = String.Empty;
    public string Apellido { get; set; } = String.Empty;
    public string Email { get; set; } = String.Empty;
    public string Password { get; set; } = String.Empty;
    public string Rol { get; set; } = "Cliente";
}

public class UsuarioUpdateRequest
{
    public string Nombre { get; set; } = String.Empty;
    public string Apellido { get; set; } = String.Empty;
    public string Email { get; set; } = String.Empty;
    public string Rol { get; set; } = "Cliente";
}

public class ItemRequest
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; } = 1;
}

public class CantidadRequest
{
    public int Cantidad { get; set; }
}

public class ProcesarCompraRequest
{
    public int IdUsuario { get; set; }
    public int IdMetodoPago { get; set; }
}

public class CambiarEstadoRequest
{
    public string Estado { get; set; } = String.Empty;
}

public class ConfiguracionRequest
{
    public int IdUsuario { get; set; }
    public string NombreConfiguracion { get; set; } = String.Empty;
    public List<ItemRequest> Items { get; set; } = new();
}

public class PlantillaRequest
{
    public string Nombre { get; set; } = String.Empty;
    public string? Descripcion { get; set; }
    public List<ItemRequest> Items { get; set; } = new();
}
