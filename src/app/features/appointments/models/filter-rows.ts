import { RequestRow } from './appointment-request-model';

/**
 * Filtro client-side por nombre, apellido o cédula (input "Busca por nombre o
 * cédula"). Se aplica sobre las filas ya mapeadas, antes de paginar.
 */
export function filterRowsBySearch(
  rows: readonly RequestRow[],
  term: string,
): RequestRow[] {
  const q = term.trim().toLowerCase();
  if (!q) return [...rows];
  return rows.filter(
    (r) =>
      r.nombre.toLowerCase().includes(q) ||
      r.apellido.toLowerCase().includes(q) ||
      r.cedula.toLowerCase().includes(q),
  );
}
