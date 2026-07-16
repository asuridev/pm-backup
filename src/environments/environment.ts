export const environment = {
  production: false,
  /**
   * Base del gateway de emisión. En esta estación el endpoint real no responde,
   * por eso `useMocks` viene en `true` (ver `environment.production.ts`).
   */
  apiUrl: 'https://vip-busintco-lam-co-assurance.staging.echonet:20320',
  /**
   * `true`  → la data de la tabla se sirve desde `src/assets/mock/appointments-mock.json`.
   * `false` → la data se pide al endpoint real (`{apiUrl}/emission/v2/requests/appointment`).
   */
  useMocks: true,
  /** Servidor de identidad Keycloak (ver `infra/sso/`). */
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'portal-medicos',
    clientId: 'portal-medico-web',
  },
  /**
   * Proveedor OAuth2 de Apigee, independiente de Keycloak. Emite el token que
   * exigen las APIs de `apiUrl` (ver `features/auth/services/apigee-session.ts`).
   *
   * `clientId` NO es un secreto: viaja en el bundle y el `/authorize` entrega un
   * code sin login ni consentimiento, así que el token identifica a la
   * aplicación, no al usuario. Pendiente de validar con el equipo de Apigee.
   *
   * `redirectUri` debe estar registrado como callback en la app de Apigee. Hoy
   * solo lo está el de producción: en desarrollo el flujo responde
   * `invalid_redirect_uri` hasta que se registre esta URL.
   */
  apigee: {
    authUrl: 'https://api.latam.cloud.cardifnet.com/oauth2/v1',
    apiUrl: 'https://api.latam.cloud.cardifnet.com',
    clientId: 'XjuYyYC1jSNuZMP0zEjveBpNGldiO1fAl42MxKaYdY4zCABm',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'foo',
    idp: 'noidp',
  },
};
