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
};
