import "server-only"
import { getSheetsClient, getSpreadsheetId } from "./client"
import { readSheetGrid } from "./row-mapper"
import { SHEET_NAMES } from "@/lib/constants"
import type { ActivityRun, RunMode } from "@/types/activity"

const NUMERIC_FIELDS = ["total", "sent", "skipped", "by_sms", "by_email"] as const

function toNumber(value: string | undefined): number {
  const n = Number((value ?? "0").toString().trim())
  return Number.isFinite(n) ? n : 0
}

/**
 * Read-only: rows are appended exclusively by the n8n workflow's
 * "Log Run Summary" node (see n8n/Appointment Agent.json), never by the
 * website, so Activity always reflects what the automation actually did.
 */
export async function listActivity(): Promise<ActivityRun[]> {
  const sheets = getSheetsClient()
  const spreadsheetId = getSpreadsheetId()
  const { header, values } = await readSheetGrid(
    sheets,
    spreadsheetId,
    SHEET_NAMES.activity
  )

  const idx: Record<string, number> = {}
  header.forEach((name, i) => (idx[name.trim()] = i))

  const rows = values
    .filter((row) => row.some((c) => (c ?? "").toString().trim() !== ""))
    .map((row): ActivityRun => {
      const get = (key: string) => (row[idx[key]] ?? "").toString().trim()
      const record: Record<string, string> = {}
      NUMERIC_FIELDS.forEach((f) => (record[f] = get(f)))

      return {
        run_date: get("run_date"),
        target_date: get("target_date"),
        mode: (get("mode") || "run") as RunMode,
        total: toNumber(record.total),
        sent: toNumber(record.sent),
        skipped: toNumber(record.skipped),
        by_sms: toNumber(record.by_sms),
        by_email: toNumber(record.by_email),
        status: get("status") || "success",
      }
    })

  return rows.reverse() // most recent first
}
