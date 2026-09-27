import "server-only"
import { getSheetsClient, getSpreadsheetId, resolveSheetId } from "./client"
import {
  APPOINTMENTS_HEADER,
  appointmentToRowArray,
  colLetter,
  findAppointmentRow,
  readSheetGrid,
  rowArrayToAppointment,
} from "./row-mapper"
import { SHEET_NAMES } from "@/lib/constants"
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput,
} from "@/types/appointment"

const SHEET = SHEET_NAMES.appointments

// Short-TTL read cache: Sheets API calls are the slowest part of every page
// load. Any write here, or any n8n webhook call that writes to the sheet,
// MUST call invalidateAppointmentsCache() afterward or the UI will show
// stale data despite React Query believing it refetched.
let cache: { at: number; items: Appointment[] } | null = null
const CACHE_TTL_MS = 5_000

export function invalidateAppointmentsCache(): void {
  cache = null
}

export async function listAppointments(): Promise<Appointment[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.items
  }

  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()
  const { header, values } = await readSheetGrid(sheets, spreadsheetId, SHEET)
  const items = values
    .filter((row) => row.some((cellValue) => (cellValue ?? "").toString().trim() !== ""))
    .map((row) => rowArrayToAppointment(header, row))

  cache = { at: Date.now(), items }
  return items
}

export async function getAppointmentById(
  appointmentId: string
): Promise<Appointment | null> {
  const items = await listAppointments()
  return items.find((a) => a.appointment_id === appointmentId) ?? null
}

function generateAppointmentId(): string {
  const stamp = new Date()
  const y = stamp.getFullYear()
  const m = String(stamp.getMonth() + 1).padStart(2, "0")
  const d = String(stamp.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `APT-${y}${m}${d}-${rand}`
}

export async function createAppointment(
  input: AppointmentCreateInput
): Promise<Appointment> {
  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  const appointment_id = input.appointment_id || generateAppointmentId()
  const existing = await getAppointmentById(appointment_id)
  if (existing) {
    throw new Error(`An appointment with ID "${appointment_id}" already exists.`)
  }

  const rowArray = appointmentToRowArray([...APPOINTMENTS_HEADER], {
    ...input,
    appointment_id,
    reminder_sent: false,
    reminder_channel: "",
    reminder_sent_at: "",
  })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [rowArray] },
  })

  invalidateAppointmentsCache()
  const created = await getAppointmentById(appointment_id)
  if (!created) {
    throw new Error("Appointment was created but could not be re-read.")
  }
  return created
}

export async function updateAppointment(
  appointmentId: string,
  patch: AppointmentUpdateInput
): Promise<Appointment> {
  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  const found = await findAppointmentRow(sheets, spreadsheetId, SHEET, appointmentId)
  if (!found) {
    throw new Error(`Appointment "${appointmentId}" was not found.`)
  }

  const rowArray = appointmentToRowArray(found.header, patch, found.rowValues)
  const lastCol = colLetter(found.header.length - 1)

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET}!A${found.sheetRow}:${lastCol}${found.sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowArray] },
  })

  invalidateAppointmentsCache()
  const updated = await getAppointmentById(appointmentId)
  if (!updated) {
    throw new Error("Appointment was updated but could not be re-read.")
  }
  return updated
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  const found = await findAppointmentRow(sheets, spreadsheetId, SHEET, appointmentId)
  if (!found) {
    throw new Error(`Appointment "${appointmentId}" was not found.`)
  }

  const sheetId = await resolveSheetId(sheets, spreadsheetId, SHEET)

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: found.sheetRow - 1,
              endIndex: found.sheetRow,
            },
          },
        },
      ],
    },
  })

  invalidateAppointmentsCache()
}
