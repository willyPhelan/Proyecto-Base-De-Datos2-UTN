# VOLTFORGE — Front de la tienda

Front en React 19 + TypeScript + Vite + Tailwind que consume `BaseDatos2TPO_API`.

## Configuración (un solo lugar)

Las direcciones se configuran en el `appsettings.json` de la API (carpeta de arriba):

```json
"Urls": "https://localhost:57801",
"Frontend": { "Url": "http://localhost:3000" }
```

- `Urls`: dónde escucha la API. El front la usa para llamarla.
- `Frontend:Url`: dónde corre el front. Vite usa ese puerto y la API solo acepta llamadas (CORS) desde ese origen.

Si cambiás el puerto del front, actualizá también la URL de `.vscode/launch.json` (es la que abre Visual Studio).

## Cómo levantarlo

1. En Visual Studio, abrir `BaseDatos2TPO_API.sln`, elegir el perfil **API + Front** y F5.
2. O a mano: levantar la API y, en esta carpeta:

   ```bash
   npm install
   npm run dev
   ```

3. Abrir http://localhost:3000 (Swagger de la API en https://localhost:57801/swagger).

El front solo funciona con la API: si no responde, no muestra ningún dato y aparece la pantalla
**Sin conexión con la API** con un botón para reintentar.
