using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("plantillas")]
public class PlantillasController : BaseApiController
{
    private readonly PlantillaService _service;

    public PlantillasController(PlantillaService service, ILogger<PlantillasController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /plantillas
    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        try
        {
            return Ok(await _service.GetActiveList());
        }
        catch (Exception ex)
        {
            return HandleError(ex, "PlantillaPC", "GetList", "Error al obtener las plantillas");
        }
    }

    // GET /plantillas/{id}  (con detalle)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var plantilla = await _service.GetById(id);
            if (plantilla == null) return NotFound();
            return Ok(plantilla);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "PlantillaPC", "GetById", "Error al obtener la plantilla");
        }
    }

    // POST /plantillas
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlantillaRequest request)
    {
        try
        {
            var id = await _service.Create(request);
            return CreatedAtAction(nameof(GetById), new { id }, await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "PlantillaPC", "Create", "Error al crear la plantilla");
        }
    }

    // PUT /plantillas/{id}  (nombre y descripción)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PlantillaRequest request)
    {
        try
        {
            if (await _service.Update(id, request) == 0) return NotFound();
            return Ok(await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "PlantillaPC", "Update", "Error al actualizar la plantilla");
        }
    }

    // DELETE /plantillas/{id}  (baja lógica)
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
            return HandleError(ex, "PlantillaPC", "Delete", "Error al eliminar la plantilla");
        }
    }

    // POST /plantillas/{id}/productos
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
            return HandleError(ex, "PlantillaPC", "AgregarProducto", "Error al agregar el producto");
        }
    }

    // DELETE /plantillas/{id}/productos/{idProducto}
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
            return HandleError(ex, "PlantillaPC", "QuitarProducto", "Error al quitar el producto");
        }
    }
}
