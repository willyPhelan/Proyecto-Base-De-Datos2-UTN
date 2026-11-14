using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("usuarios")]
public class UsuariosController : BaseApiController
{
    private readonly UsuarioService _service;

    public UsuariosController(UsuarioService service, ILogger<UsuariosController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /usuarios
    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        try
        {
            return Ok(await _service.GetAll());
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Usuario", "GetList", "Error al obtener los usuarios");
        }
    }

    // GET /usuarios/resumen-clientes  (VW_Resumen_Clientes)
    [HttpGet("resumen-clientes")]
    public async Task<IActionResult> GetResumenClientes()
    {
        try
        {
            return Ok(await _service.GetResumenClientes());
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Usuario", "GetResumenClientes", "Error al obtener el resumen de clientes");
        }
    }

    // GET /usuarios/{id}
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
            return HandleError(ex, "Usuario", "GetById", "Error al obtener el usuario");
        }
    }

    // GET /usuarios/{id}/total-gastado  (fn_CalcularTotalGastadoPorUsuario)
    [HttpGet("{id}/total-gastado")]
    public async Task<IActionResult> GetTotalGastado(int id)
    {
        try
        {
            if (await _service.GetById(id) == null) return NotFound();
            return Ok(new { idUsuario = id, totalGastado = await _service.GetTotalGastado(id) });
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Usuario", "GetTotalGastado", "Error al calcular el total gastado");
        }
    }

    // POST /usuarios
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UsuarioCreateRequest request)
    {
        try
        {
            var created = await _service.Create(request);
            return CreatedAtAction(nameof(GetById), new { id = created.IdUsuario }, created);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Usuario", "Create", "Error al crear el usuario");
        }
    }

    // PUT /usuarios/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UsuarioUpdateRequest request)
    {
        try
        {
            if (await _service.Update(id, request) == 0) return NotFound();
            return Ok(await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Usuario", "Update", "Error al actualizar el usuario");
        }
    }
}
