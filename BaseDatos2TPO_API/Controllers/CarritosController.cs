using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("carritos/usuario/{idUsuario}")]
public class CarritosController : BaseApiController
{
    private readonly CarritoService _service;

    public CarritosController(CarritoService service, ILogger<CarritosController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /carritos/usuario/{idUsuario}
    [HttpGet]
    public async Task<IActionResult> Get(int idUsuario)
    {
        try
        {
            var carrito = await _service.GetByUsuario(idUsuario);
            if (carrito == null) return NotFound("El usuario no tiene carrito");
            return Ok(carrito);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Carrito", "Get", "Error al obtener el carrito");
        }
    }

    // POST /carritos/usuario/{idUsuario}/items  (si ya existe, el trigger suma la cantidad)
    [HttpPost("items")]
    public async Task<IActionResult> AgregarItem(int idUsuario, [FromBody] ItemRequest item)
    {
        try
        {
            await _service.AgregarItem(idUsuario, item);
            return Ok(await _service.GetByUsuario(idUsuario));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Carrito", "AgregarItem", "Error al agregar el producto al carrito");
        }
    }

    // PUT /carritos/usuario/{idUsuario}/items/{idProducto}
    [HttpPut("items/{idProducto}")]
    public async Task<IActionResult> ActualizarCantidad(int idUsuario, int idProducto, [FromBody] CantidadRequest request)
    {
        try
        {
            if (await _service.ActualizarCantidad(idUsuario, idProducto, request.Cantidad) == 0) return NotFound();
            return Ok(await _service.GetByUsuario(idUsuario));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Carrito", "ActualizarCantidad", "Error al actualizar la cantidad");
        }
    }

    // DELETE /carritos/usuario/{idUsuario}/items/{idProducto}
    [HttpDelete("items/{idProducto}")]
    public async Task<IActionResult> QuitarItem(int idUsuario, int idProducto)
    {
        try
        {
            if (!await _service.QuitarItem(idUsuario, idProducto)) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Carrito", "QuitarItem", "Error al quitar el producto del carrito");
        }
    }

    // DELETE /carritos/usuario/{idUsuario}/items  (vaciar carrito)
    [HttpDelete("items")]
    public async Task<IActionResult> Vaciar(int idUsuario)
    {
        try
        {
            await _service.Vaciar(idUsuario);
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Carrito", "Vaciar", "Error al vaciar el carrito");
        }
    }
}
