import { PkceChallenge } from '../models/pkce-model';

/**
 * Generación de credenciales PKCE (RFC 7636) con WebCrypto — sin dependencias.
 * Funciones puras: no hay estado ni DI, por eso no es un servicio inyectable.
 *
 * `crypto.subtle` solo existe en contexto seguro: funciona bajo HTTPS y bajo
 * `http://localhost`, pero NO si se sirve la app por IP de red (p. ej.
 * `http://192.168.1.5:4200`), donde `createChallenge` lanzará.
 */

/** base64url = base64 sin padding y con el alfabeto seguro para URLs. */
function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function randomBase64Url(byteLength: number): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

/** Verifier de 32 bytes → 43 chars, dentro del rango 43-128 que exige el RFC. */
export function createVerifier(): string {
  return randomBase64Url(32);
}

/** `code_challenge` = base64url(SHA-256(verifier)), es decir el método S256. */
export async function createChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  return toBase64Url(new Uint8Array(digest));
}

export function createState(): string {
  return randomBase64Url(12);
}

/** Genera el trío completo para una nueva vuelta del flujo. */
export async function createPkceChallenge(): Promise<PkceChallenge> {
  const verifier = createVerifier();
  return {
    verifier,
    challenge: await createChallenge(verifier),
    state: createState(),
  };
}
