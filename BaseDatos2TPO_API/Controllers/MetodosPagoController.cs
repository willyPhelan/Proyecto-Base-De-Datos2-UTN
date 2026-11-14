using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("metodos-pago")]
public class MetodosPagoController : BaseApiController
{
    private readonly MetodoPagoService _service;

    public MetodosPagoController(MetodoPagoService service, ILogger<MetodosPagoController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /metodos-pago
    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        try
        {
            return Ok(await _service.GetActiveList());
        }
        catch (Exception ex)
        {
            return HandleError(ex, "MetodoPago", "GetList", "Error al obtener los métodos de pago");
        }
    }

    // GET /metodos-pago/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound();
            return Ok(item);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "MetodoPago", "GetById", "Error al obtener el método de pago");
        }
    }

    // POST /metodos-pago
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MetodoPago model)
    {
        try
        {
            var created = await _service.Create(model);
            return CreatedAtAction(nameof(GetById), new { id = created.IdMetodoPago }, created);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "MetodoPago", "Create", "Error al crear el método de pago");
        }
    }

    // PUT /metodos-pago/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] MetodoPago model)
    {
        try
        {
            if (await _service.Update(id, model) == 0) return NotFound();
            return Ok(model);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "MetodoPago", "Update", "Error al actualizar el método de pago");
        }
    }

    // DELETE /metodos-pago/{id}  (baja lógica)
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
            return HandleError(ex, "MetodoPago", "Delete", "Error al eliminar el método de pago");
        }
    }
}
