namespace BaseDatos2TPO_API.Models;

// No expone ContraseñaHash
public class Usuario
{
    public int IdUsuario { get; set; }
    public string Nombre { get; set; } = String.Empty;
    public string Apellido { get; set; } = String.Empty;
    public string Email { get; set; } = String.Empty;
    public string Rol { get; set; } = "Cliente";
}

// VW_Resumen_Clientes
public class ResumenCliente : Usuario
{
    public decimal TotalGastado { get; set; }
}
