import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

// Las URLs se configuran en un solo lugar: el appsettings.json de la API.
//   "Urls"         -> dirección de la API (la usa el front para llamarla)
//   "Frontend:Url" -> dirección del front (puerto de Vite y origen permitido por CORS)
const appSettingsPath = path.resolve(import.meta.dirname, '..', 'appsettings.json');
const appSettings = JSON.parse(fs.readFileSync(appSettingsPath, 'utf8').replace(/^﻿/, ''));

const apiUrl: string | undefined = appSettings.Urls?.split(';')[0]?.trim();
const frontendUrl: string | undefined = appSettings.Frontend?.Url;
if (!apiUrl || !frontendUrl) {
  throw new Error(`Faltan "Urls" o "Frontend:Url" en ${appSettingsPath}`);
}
const frontendPort = Number(new URL(frontendUrl).port) || 3000;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl.replace(/\/+$/, '')),
  },
  server: {
    port: frontendPort,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
});
