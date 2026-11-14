using BaseDatos2TPO_API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "BaseDatos2TPO_API", Version = "v1" });
});

//INYECCION DE DEPENDENCIAS
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddScoped<CategoriaService>();
builder.Services.AddScoped<ProductoService>();
builder.Services.AddScoped<MetodoPagoService>();
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<CarritoService>();
builder.Services.AddScoped<OrdenService>();
builder.Services.AddScoped<ConfiguracionService>();
builder.Services.AddScoped<PlantillaService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// En desarrollo no se redirige a HTTPS: si alguien llama por http://localhost:57802,
// la redirección rompería las llamadas CORS (el navegador no la sigue en el preflight)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
