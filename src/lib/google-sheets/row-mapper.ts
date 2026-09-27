import "server-only"
import type { sheets_v4 } from "googleapis"
import type { Appointment, AppointmentStatus, PreferredChannel } from "@/types/appointment"

/**
 * Column order/serialization here matches exactly what the n8n
 * "Build Reminder Queue" Code node reads (clean()/isTrue() helpers):
 * consent_sms / consent_email are 'TRUE'/'FALSE' strings, reminder_sent is
 * 'YES' or blank. Keep this in sync with n8n/Appointment Agent.json.
 */
export const APPOINTMENTS_HEADER = [
  "appointment_id",
  "patient_first_name",
  "patient_last_name",
  "phone_e164",
  "email",
  "appointment_date",
  "appointment_time",
  "clinician",
  "location",
  "status",
  "preferred_channel",
  "consent_sms",
  "consent_email",
  "reminder_sent",
  "reminder_channel",
  "reminder_sent_at",
] as const

export function colLetter(index0: number): string {
  let n = index0 + 1
  let letters = ""
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

function headerIndexMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  header.forEach((name, i) => {
    map[name.trim()] = i
  })
  return map
}

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) return ""
  return (row[index] ?? "").toString().trim()
}

export function rowArrayToAppointment(header: string[], row: string[]): Appointment {
  const idx = headerIndexMap(header)
  return {
    appointment_id: cell(row, idx.appointment_id),
    patient_first_name: cell(row, idx.patient_first_name),
    patient_last_name: cell(row, idx.patient_last_name),
    phone_e164: cell(row, idx.phone_e164),
    email: cell(row, idx.email),
    appointment_date: cell(row, idx.appointment_date),
    appointment_time: cell(row, idx.appointment_time),
    clinician: cell(row, idx.clinician),
    location: cell(row, idx.location),
    status: (cell(row, idx.status) || "Scheduled") as AppointmentStatus,
    preferred_channel: (cell(row, idx.preferred_channel) || "sms") as PreferredChannel,
    consent_sms: cell(row, idx.consent_sms).toUpperCase() === "TRUE",
    consent_email: cell(row, idx.consent_email).toUpperCase() === "TRUE",
    reminder_sent: cell(row, idx.reminder_sent).toUpperCase() === "YES",
    reminder_channel: (cell(row, idx.reminder_channel) as "" | "sms" | "email") || "",
    reminder_sent_at: cell(row, idx.reminder_sent_at),
  }
}

/** Builds a full row array (in header order) from a patch, merged onto an existing row when editing. */
export function appointmentToRowArray(
  header: string[],
  patch: Partial<Appointment>,
  existingRow?: string[]
): string[] {
  const existing = existingRow ? rowArrayToAppointment(header, existingRow) : undefined
  const merged: Appointment = {
    appointment_id: patch.appointment_id ?? existing?.appointment_id ?? "",
    patient_first_name: patch.patient_first_name ?? existing?.patient_first_name ?? "",
    patient_last_name: patch.patient_last_name ?? existing?.patient_last_name ?? "",
    phone_e164: patch.phone_e164 ?? existing?.phone_e164 ?? "",
    email: patch.email ?? existing?.email ?? "",
    appointment_date: patch.appointment_date ?? existing?.appointment_date ?? "",
    appointment_time: patch.appointment_time ?? existing?.appointment_time ?? "",
    clinician: patch.clinician ?? existing?.clinician ?? "",
    location: patch.location ?? existing?.location ?? "",
    status: patch.status ?? existing?.status ?? "Scheduled",
    preferred_channel: patch.preferred_channel ?? existing?.preferred_channel ?? "sms",
    consent_sms: patch.consent_sms ?? existing?.consent_sms ?? false,
    consent_email: patch.consent_email ?? existing?.consent_email ?? false,
    reminder_sent: patch.reminder_sent ?? existing?.reminder_sent ?? false,
    reminder_channel: patch.reminder_channel ?? existing?.reminder_channel ?? "",
    reminder_sent_at: patch.reminder_sent_at ?? existing?.reminder_sent_at ?? "",
  }

  const idx = headerIndexMap(header)
  const out = new Array(header.length).fill("")
  const set = (key: keyof typeof idx, value: string) => {
    if (idx[key] !== undefined) out[idx[key]] = value
  }

  set("appointment_id", merged.appointment_id)
  set("patient_first_name", merged.patient_first_name)
  set("patient_last_name", merged.patient_last_name)
  set("phone_e164", merged.phone_e164)
  set("email", merged.email)
  set("appointment_date", merged.appointment_date)
  set("appointment_time", merged.appointment_time)
  set("clinician", merged.clinician)
  set("location", merged.location)
  set("status", merged.status)
  set("preferred_channel", merged.preferred_channel)
  set("consent_sms", merged.consent_sms ? "TRUE" : "FALSE")
  set("consent_email", merged.consent_email ? "TRUE" : "FALSE")
  set("reminder_sent", merged.reminder_sent ? "YES" : "")
  set("reminder_channel", merged.reminder_channel)
  set("reminder_sent_at", merged.reminder_sent_at)

  return out
}

export interface FoundRow {
  sheetRow: number // 1-based physical row in the sheet
  header: string[]
  values: string[][]
  rowValues: string[]
}

export async function readSheetGrid(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string
): Promise<{ header: string[]; values: string[][] }> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z`,
  })
  const rows = res.data.values ?? []
  const header = (rows[0] ?? []) as string[]
  const values = rows.slice(1) as string[][]
  return { header, values }
}

export async function findAppointmentRow(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
  appointmentId: string
): Promise<FoundRow | null> {
  const { header, values } = await readSheetGrid(sheets, spreadsheetId, sheetName)
  const idx = headerIndexMap(header)
  const col = idx.appointment_id
  if (col === undefined) {
    throw new Error(`"${sheetName}" sheet has no appointment_id column.`)
  }

  const dataIndex = values.findIndex(
    (row) => (row[col] ?? "").toString().trim() === appointmentId
  )
  if (dataIndex === -1) return null

  return {
    sheetRow: dataIndex + 2, // +1 for 0-index, +1 for header row
    header,
    values,
    rowValues: values[dataIndex],
  }
}
