/**
 * Socios (bancos) disponibles para el filtro "Seleccionar socio".
 * Fuente: banks.json. Data estática y pequeña → constante en vez de HTTP.
 * El `id` es el `partnerId` que se envía como query param al endpoint.
 */
export interface Partner {
  readonly name: string;
  readonly id: string;
}

export const PARTNERS: readonly Partner[] = [
  { name: 'Scotiabank', id: '0b9b5eee-affb-46d6-96f9-1995f2316106' },
  { name: 'AV Villas', id: '5934fac6-7980-4750-817f-7f293735a23e' },
  { name: 'Bogotá', id: 'b2b03a9a-c31e-4886-aa56-de0efd336075' },
  { name: 'Tuya', id: '23e733b5-ab93-4e34-86c5-7a9d290063a1' },
  { name: 'Occidente', id: '2efd0584-d38a-4a2f-9dd8-42f2905c3aae' },
];

/** Socio preseleccionado al entrar al feature. */
export const DEFAULT_PARTNER_ID = PARTNERS[0].id;
