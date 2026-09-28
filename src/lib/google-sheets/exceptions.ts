import "server-only"
import { getSheetsClient, getSpreadsheetId, isDemoMode } from "./client"
import { readSheetGrid } from "./row-mapper"
import { buildDemoExceptions } from "@/lib/demo/data"
import { SHEET_NAMES } from "@/lib/constants"
import type { ExceptionRecord } from "@/types/exception"

export async function listExceptions(): Promise<ExceptionRecord[]> {
  if (isDemoMode()) return buildDemoExceptions()

  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()
  const { header, values } = await readSheetGrid(
    sheets,
    spreadsheetId,
    SHEET_NAMES.exceptions
  )

  const idx = {
    run_date: header.indexOf("run_date"),
    appointment_id: header.indexOf("appointment_id"),
    appointment_date: header.indexOf("appointment_date"),
    reason: header.indexOf("reason"),
  }

  return values
    .filter((row) => row.some((c) => (c ?? "").toString().trim() !== ""))
    .map((row) => ({
      run_date: (row[idx.run_date] ?? "").toString().trim(),
      appointment_id: (row[idx.appointment_id] ?? "").toString().trim(),
      appointment_date: (row[idx.appointment_date] ?? "").toString().trim(),
      reason: (row[idx.reason] ?? "").toString().trim(),
    }))
    .reverse() // most recent first
}
