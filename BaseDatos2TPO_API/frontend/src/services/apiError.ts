// status 0 = no hubo respuesta de la API (caída, apagada o error de red)
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
