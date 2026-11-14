using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace BaseDatos2TPO_API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected readonly ILogger _logger;

    protected BaseApiController(ILogger logger)
    {
        _logger = logger;
    }

    // Errores de negocio (RAISERROR/THROW de SPs y triggers, FK, UNIQUE, CHECK) → 400.
    // Cualquier otro error → 500.
    protected IActionResult HandleError(Exception ex, string entidad, string accion, string mensaje)
    {
        if (ex is ArgumentException)
            return BadRequest(ex.Message);

        if (ex is SqlException sql && (sql.Number >= 50000 || sql.Number is 547 or 2627 or 2601))
        {
            _logger.LogWarning("{Entidad}.{Accion}: {Mensaje}", entidad, accion, sql.Message);
            return BadRequest(sql.Message);
        }

        _logger.LogError(ex, "{Entidad}.{Accion}", entidad, accion);
        return StatusCode(500, mensaje);
    }
}
