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
};
