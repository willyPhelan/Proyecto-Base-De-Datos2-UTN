# VOLTFORGE — Front de la tienda

Front en React 19 + TypeScript + Vite + Tailwind que consume `BaseDatos2TPO_API`.

## Cómo levantarlo

1. Levantar la API (abrir `BaseDatos2TPO_API.sln` en Visual Studio y F5).
   Queda escuchando en `https://localhost:57801` (Swagger en https://localhost:57801/swagger).
2. Copiar `.env.example` como `.env` (por defecto ya apunta a `https://localhost:57801`).
3. En esta carpeta:

   ```bash
   npm install
   npm run dev
   ```

4. Abrir http://localhost:3000

El front solo funciona con la API: si no responde, no muestra ningún dato y aparece la pantalla
**Sin conexión con la API** con un botón para reintentar.
