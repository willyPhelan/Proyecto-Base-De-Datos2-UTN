using BaseDatos2TPO_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaseDatos2TPO_API.Controllers;

[Route("ordenes")]
public class OrdenesController : BaseApiController
{
    private readonly OrdenService _service;

    public OrdenesController(OrdenService service, ILogger<OrdenesController> logger) : base(logger)
    {
        _service = service;
    }

    // GET /ordenes?estado=Pagado&idUsuario=1
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? estado, [FromQuery] int? idUsuario)
    {
        try
        {
            return Ok(await _service.GetList(estado, idUsuario));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Orden", "GetList", "Error al obtener las órdenes");
        }
    }

    // GET /ordenes/reporte?desde=2025-01-01&hasta=2025-12-31  (SP_REPORTE_VENTA_ENTRE_2_FECHAS)
    [HttpGet("reporte")]
    public async Task<IActionResult> Reporte([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
    {
        if (desde > hasta) return BadRequest("La fecha 'desde' no puede ser mayor a 'hasta'");

        try
        {
            return Ok(await _service.ReporteVentas(desde, hasta));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Orden", "Reporte", "Error al generar el reporte de ventas");
        }
    }

    // GET /ordenes/{id}  (con detalle)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var orden = await _service.GetById(id);
            if (orden == null) return NotFound();
            return Ok(orden);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Orden", "GetById", "Error al obtener la orden");
        }
    }

    // POST /ordenes/procesar-compra  (sp_ProcesarCompra: carrito → orden)
    [HttpPost("procesar-compra")]
    public async Task<IActionResult> ProcesarCompra([FromBody] ProcesarCompraRequest request)
    {
        try
        {
            var orden = await _service.ProcesarCompra(request);
            if (orden == null) return BadRequest("No se generó la orden");
            return CreatedAtAction(nameof(GetById), new { id = orden.IdOrden }, orden);
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Orden", "ProcesarCompra", "Error al procesar la compra");
        }
    }

    // PUT /ordenes/{id}/estado  (Cancelado → TR_RESTAURAR_STOCK devuelve el stock)
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest request)
    {
        if (!OrdenService.EstadosValidos.Contains(request.Estado))
            return BadRequest("Estado inválido. Valores permitidos: Pendiente, Pagado, Cancelado");

        try
        {
            var orden = await _service.GetById(id);
            if (orden == null) return NotFound();
            if (orden.Estado == "Cancelado")
                return Conflict("La orden ya está cancelada y no puede cambiar de estado");

            await _service.CambiarEstado(id, request.Estado);
            return Ok(await _service.GetById(id));
        }
        catch (Exception ex)
        {
            return HandleError(ex, "Orden", "CambiarEstado", "Error al cambiar el estado de la orden");
        }
    }

    // DELETE /ordenes/{id}  (baja física vía TR_ELIMINAR_ORDEN)
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
            return HandleError(ex, "Orden", "Delete", "Error al eliminar la orden");
        }
    }
}
