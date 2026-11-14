using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("configuraciones")]
public class ConfiguracionesController : BaseApiController
{
    private readonly ConfiguracionService _service;

    public ConfiguracionesController(ConfiguracionService service, ILogger<ConfiguracionesController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /configuraciones/usuario/{idUsuario}
    [HttpGet("usuario/{idUsuario}")]
    public async Task<IActionResult> GetByUsuario(int idUsuario)
    {
        try
        {
            return Ok(await _service.GetByUsuario(idUsuario));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "GetByUsuario", "Error al obtener las configuraciones");
        }
    }

    // GET /configuraciones/{id}  (con detalle y total)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var config = await _service.GetById(id);
            if (config == null) return NotFound();
            return Ok(config);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "GetById", "Error al obtener la configuración");
        }
    }

    // POST /configuraciones
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ConfiguracionRequest request)
    {
        try
        {
            var id = await _service.Create(request);
            return CreatedAtAction(nameof(GetById), new { id }, await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "Create", "Error al crear la configuración");
        }
    }

    // PUT /configuraciones/{id}  (renombrar)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ConfiguracionRequest request)
    {
        try
        {
            if (await _service.UpdateNombre(id, request.NombreConfiguracion) == 0) return NotFound();
            return Ok(await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "Update", "Error al actualizar la configuración");
        }
    }

    // DELETE /configuraciones/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            if (!await _service.Delete(id)) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "Delete", "Error al eliminar la configuración");
        }
    }

    // POST /configuraciones/{id}/productos
    [HttpPost("{id}/productos")]
    public async Task<IActionResult> AgregarProducto(int id, [FromBody] ItemRequest item)
    {
        try
        {
            if (await _service.GetById(id) == null) return NotFound();
            await _service.AgregarProducto(id, item);
            return Ok(await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "AgregarProducto", "Error al agregar el producto");
        }
    }

    // DELETE /configuraciones/{id}/productos/{idProducto}
    [HttpDelete("{id}/productos/{idProducto}")]
    public async Task<IActionResult> QuitarProducto(int id, int idProducto)
    {
        try
        {
            if (!await _service.QuitarProducto(id, idProducto)) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleError(ex, "ConfiguracionPC", "QuitarProducto", "Error al quitar el producto");
        }
    }
}
