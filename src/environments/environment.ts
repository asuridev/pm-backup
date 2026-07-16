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
   * `redirectUri` debe estar registrado como callback en la app de Apigee, y hoy
   * solo lo está el de producción. Por eso en desarrollo se usa ESA misma URL y
   * la app se sirve en ese hostname: `ng serve -c apigee` + una entrada en el
   * archivo `hosts` que apunta el dominio a 127.0.0.1 (receta completa en
   * `infra/sso/README.md`). Es un rodeo temporal — cuando Apigee registre un
   * callback de desarrollo, esto vuelve a `http://localhost:4200/callback`.
   *
   * Con el `ng serve` normal (localhost:4200) el flujo falla con
   * `invalid_redirect_uri`, sin afectar al resto del portal.
   */
  apigee: {
    authUrl: 'https://api.latam.cloud.cardifnet.com/oauth2/v1',
    apiUrl: 'https://api.latam.cloud.cardifnet.com',
    clientId: 'XjuYyYC1jSNuZMP0zEjveBpNGldiO1fAl42MxKaYdY4zCABm',
    redirectUri: 'https://oi-auto-cla.latam.cloud.cardifnet.com/callback',
    scope: 'foo',
    idp: 'noidp',
  },
};
