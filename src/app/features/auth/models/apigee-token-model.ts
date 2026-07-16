/**
 * Respuesta cruda de `POST /oauth2/v1/token`. Apigee devuelve todos los valores
 * numéricos como número y el resto como string; `api_product_list` llega como
 * un string con forma de lista, no como array.
 */
export interface ApigeeTokenDto {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Vigencia en segundos (1799 ≈ 30 min). */
  expires_in: number;
  issued_at: number;
  scope: string;
  client_id: string;
  status: string;
}

/** Modelo de dominio: solo lo que la app necesita para autorizar peticiones. */
export interface ApigeeToken {
  accessToken: string;
  refreshToken: string;
  /** Instante de expiración en epoch ms, ya resuelto desde `expires_in`. */
  expiresAt: number;
}
