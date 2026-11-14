using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("productos")]
public class ProductosController : BaseApiController
{
    private readonly ProductoService _service;

    public ProductosController(ProductoService service, ILogger<ProductosController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /productos?idCategoria=1   (VW_Catalogo_Productos)
    [HttpGet]
    public async Task<IActionResult> GetCatalogo([FromQuery] int? idCategoria)
    {
        try
        {
            return Ok(await _service.GetCatalogo(idCategoria));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Producto", "GetCatalogo", "Error al obtener el catálogo");
        }
    }

    // GET /productos/{id}
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
            return HandleError(ex, "Producto", "GetById", "Error al obtener el producto");
        }
    }

    // POST /productos
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Producto model)
    {
        try
        {
            var created = await _service.Create(model);
            return CreatedAtAction(nameof(GetById), new { id = created.IdProducto }, created);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Producto", "Create", "Error al crear el producto");
        }
    }

    // PUT /productos/{id}  (si cambia el precio, el trigger recalcula las plantillas)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Producto model)
    {
        try
        {
            if (await _service.Update(id, model) == 0) return NotFound();
            return Ok(model);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Producto", "Update", "Error al actualizar el producto");
        }
    }

    // DELETE /productos/{id}  (baja lógica)
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
            return HandleError(ex, "Producto", "Delete", "Error al eliminar el producto");
        }
    }
}
