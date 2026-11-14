using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("categorias")]
public class CategoriasController : BaseApiController
{
    private readonly CategoriaService _service;

    public CategoriasController(CategoriaService service, ILogger<CategoriasController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /categorias
    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        try
        {
            return Ok(await _service.GetActiveList());
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Categoria", "GetList", "Error al obtener las categorías");
        }
    }

    // GET /categorias/{id}
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
            return HandleError(ex, "Categoria", "GetById", "Error al obtener la categoría");
        }
    }

    // POST /categorias
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Categoria model)
    {
        try
        {
            var created = await _service.Create(model);
            return CreatedAtAction(nameof(GetById), new { id = created.IdCategoria }, created);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Categoria", "Create", "Error al crear la categoría");
        }
    }

    // PUT /categorias/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Categoria model)
    {
        try
        {
            if (await _service.Update(id, model) == 0) return NotFound();
            return Ok(model);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Categoria", "Update", "Error al actualizar la categoría");
        }
    }

    // DELETE /categorias/{id}  (baja lógica)
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
            return HandleError(ex, "Categoria", "Delete", "Error al eliminar la categoría");
        }
    }
}
