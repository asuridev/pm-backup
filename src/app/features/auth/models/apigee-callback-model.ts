/** Discriminante del `postMessage`; evita confundirlo con mensajes ajenos. */
export const APIGEE_CALLBACK_MESSAGE = 'apigee-callback';

/**
 * Contrato entre el componente `ApigeeCallback` (que corre dentro del iframe) y
 * `ApigeeSession` (que lo escucha desde la ventana principal).
 */
export interface ApigeeCallbackMessage {
  type: typeof APIGEE_CALLBACK_MESSAGE;
  code: string | null;
  state: string | null;
  /** Presente si el proveedor rechazó la petición (p. ej. `invalid_redirect_uri`). */
  error: string | null;
}

export function isApigeeCallbackMessage(
  data: unknown,
): data is ApigeeCallbackMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === APIGEE_CALLBACK_MESSAGE
  );
}
