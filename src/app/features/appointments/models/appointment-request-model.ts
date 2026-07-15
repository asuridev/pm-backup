/**
 * Modelos del feature de solicitudes (Asignación de citas / Autorizaciones).
 * El endpoint `GET /emission/v2/requests/appointment` devuelve `bodyResponse[]`
 * con esta forma; `mapDtoToRow` la aplana al view model que consume la tabla.
 */

export type EventStatus = 'PE' | 'AU' | 'RE';

/** Filtro "Ver:" — `'ALL'` omite el query param `eventStatus`. */
export type RequestFilter = 'ALL' | EventStatus;

export interface AppointmentRequestDto {
  event: {
    id: number;
    status: EventStatus;
    correlationId: string;
    conditioned: boolean;
  };
  person: {
    firstname: string;
    middlename: string;
    lastname: string;
    surname: string;
    telephone: string;
    idType: string;
    identification: string;
    birthdate: string;
    email: string;
    address: string;
    state: string;
  };
  health: {
    id: number;
    declaration: string;
    req: string;
    status: string;
  };
  appointment: {
    id: number;
    date: string;
    confirm: string;
    result: string;
    status: string;
    resultDate: string;
    differenceInDays: string;
    cityCode: string;
    totalInsuredValue: string;
    insuredCumulusValue: string;
    insuredSaleValue: string;
    address: string;
    city: string;
    department: string;
  };
  emission: {
    productId: number;
    modularReferencial: string;
    ecosystemReferencial: string;
  };
}

export interface AppointmentResponseDto {
  returnCode: number;
  message: string;
  bodyResponse: AppointmentRequestDto[];
}

/** Fila plana lista para render (una por solicitud). */
export interface RequestRow {
  id: number;
  status: EventStatus;
  statusLabel: string;
  nombre: string;
  apellido: string;
  cedula: string;
  celular: string;
  correo: string;
  fechaNacimiento: string;
  valorAsegurado: string;
  codigoSeguridad: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  fechaSolicitud: string;
  hora: string;
  fechaRespuesta: string;
  numeroAprobacion: string;
}

const STATUS_LABELS: Record<EventStatus, string> = {
  PE: 'Pendiente',
  AU: 'Autorizado',
  RE: 'Rechazado',
};

export function statusLabel(status: EventStatus): string {
  return STATUS_LABELS[status] ?? status;
}

const EMPTY = '-';

/** "1951/02/02 00:00:00" → "02/02/1951". */
function formatDate(raw: string): string {
  if (!raw) return EMPTY;
  const [datePart] = raw.split(' ');
  const [y, m, d] = datePart.split('/');
  if (!y || !m || !d) return EMPTY;
  return `${d}/${m}/${y}`;
}

/** "2026/02/02 06:00:00" → "6:00:00" (sin cero inicial en la hora). */
function formatTime(raw: string): string {
  if (!raw) return EMPTY;
  const parts = raw.split(' ');
  if (parts.length < 2) return EMPTY;
  const [h, min, sec] = parts[1].split(':');
  return `${Number(h)}:${min}:${sec}`;
}

const currency = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** "3000000000" → "$3.000.000.000". */
function formatCurrency(raw: string): string {
  const n = Number(raw);
  if (!raw || Number.isNaN(n)) return EMPTY;
  return `$${currency.format(n)}`;
}

function join(...parts: string[]): string {
  return parts.filter(Boolean).join(' ').trim() || EMPTY;
}

/**
 * Mapeo DTO → fila. Los campos marcados como SUPUESTO deben confirmarse:
 * - `codigoSeguridad` ← health.id (7 dígitos, coincide con el formato del diseño).
 * - `ciudad`/`departamento` llegan como códigos ("263"/"91"); sin catálogo se
 *   muestra el código.
 * - `numeroAprobacion` ← emission.modularReferencial (no hay campo explícito).
 */
export function mapDtoToRow(dto: AppointmentRequestDto): RequestRow {
  const { event, person, health, appointment, emission } = dto;
  return {
    id: event.id,
    status: event.status,
    statusLabel: statusLabel(event.status),
    nombre: join(person.firstname, person.middlename),
    apellido: join(person.lastname, person.surname),
    cedula: person.identification || EMPTY,
    celular: person.telephone || EMPTY,
    correo: person.email || EMPTY,
    fechaNacimiento: formatDate(person.birthdate),
    valorAsegurado: formatCurrency(appointment.totalInsuredValue),
    codigoSeguridad: String(health.id ?? '') || EMPTY,
    direccion: person.address || appointment.address || EMPTY,
    ciudad: appointment.city || EMPTY,
    departamento: appointment.department || EMPTY,
    fechaSolicitud: formatDate(appointment.date),
    hora: formatTime(appointment.date),
    fechaRespuesta: formatDate(appointment.resultDate),
    numeroAprobacion: emission.modularReferencial || EMPTY,
  };
}
