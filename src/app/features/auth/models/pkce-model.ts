/** Par PKCE (RFC 7636) más el `state` que ata la respuesta a esta petición. */
export interface PkceChallenge {
  /** Secreto que se guarda y se envía en el canje del code. */
  verifier: string;
  /** SHA-256 del verifier en base64url; viaja en el `/authorize`. */
  challenge: string;
  /** Nonce anti-CSRF; debe volver idéntico en el callback. */
  state: string;
}

/** Lo que se persiste entre el `/authorize` y el callback. */
export interface PkceHandshake {
  verifier: string;
  state: string;
}
