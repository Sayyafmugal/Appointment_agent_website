import "server-only"
import { google, sheets_v4 } from "googleapis"
import { ApiError } from "@/lib/api/response"

let sheetsClient: sheets_v4.Sheets | null = null
const sheetIdCache = new Map<string, number>()

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new ApiError(
      "Demo / backend unavailable — Google Sheets is not configured. Set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local (see .env.local.example).",
      503
    )
  }
  return value
}

export function getSpreadsheetId(): string {
  return requireEnv("GOOGLE_SHEETS_ID")
}

export function getSheetsClient(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient

  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n")

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  sheetsClient = google.sheets({ version: "v4", auth })
  return sheetsClient
}

/** Resolves a sheet tab's numeric gridId, needed for row-delete batchUpdate calls. */
export async function resolveSheetId(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string
): Promise<number> {
  const cacheKey = `${spreadsheetId}:${sheetName}`
  const cached = sheetIdCache.get(cacheKey)
  if (cached !== undefined) return cached

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  )
  if (!sheet || sheet.properties?.sheetId == null) {
    throw new Error(
      `Sheet tab "${sheetName}" was not found in the spreadsheet. Create it before using this feature.`
    )
  }

  sheetIdCache.set(cacheKey, sheet.properties.sheetId)
  return sheet.properties.sheetId
}
