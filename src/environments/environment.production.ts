export const environment = {
  production: true,
  apiUrl: 'https://vip-busintco-lam-co-assurance.staging.echonet:20320',
  useMocks: false,
  /** Servidor de identidad Keycloak (ver `infra/sso/`). Ajustar por entorno. */
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'portal-medicos',
    clientId: 'portal-medico-web',
  },
  /** Proveedor OAuth2 de Apigee (ver el JSDoc en `environment.ts`). */
  apigee: {
    authUrl: 'https://api.latam.cloud.cardifnet.com/oauth2/v1',
    apiUrl: 'https://api.latam.cloud.cardifnet.com',
    clientId: 'XjuYyYC1jSNuZMP0zEjveBpNGldiO1fAl42MxKaYdY4zCABm',
    redirectUri: 'https://oi-auto-cla.latam.cloud.cardifnet.com/callback',
    scope: 'foo',
    idp: 'noidp',
  },
};
