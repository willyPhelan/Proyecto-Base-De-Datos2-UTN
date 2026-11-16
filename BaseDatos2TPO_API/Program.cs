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

// La URL de la API sale de "Urls" y la del front de "Frontend:Url" (appsettings.json)
string frontendUrl = builder.Configuration["Frontend:Url"]
    ?? throw new InvalidOperationException("Falta 'Frontend:Url' en appsettings.json.");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy
            .WithOrigins(frontendUrl.TrimEnd('/'))
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.Run();
