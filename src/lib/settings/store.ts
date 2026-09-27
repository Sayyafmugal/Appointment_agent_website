import "server-only"
import { promises as fs } from "fs"
import path from "path"
import { DEFAULT_CLINIC_CONFIG } from "@/lib/constants"
import type { SoftSettings } from "@/types/settings"

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json")

function defaults(): SoftSettings {
  return {
    default_lead_days: DEFAULT_CLINIC_CONFIG.lead_days,
    clinic_display_name: DEFAULT_CLINIC_CONFIG.clinic_name,
    clinic_phone: DEFAULT_CLINIC_CONFIG.clinic_phone,
    clinic_timezone: DEFAULT_CLINIC_CONFIG.clinic_timezone,
    updated_at: new Date().toISOString(),
  }
}

export async function readSettings(): Promise<SoftSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8")
    return { ...defaults(), ...JSON.parse(raw) }
  } catch {
    return defaults()
  }
}

export async function writeSettings(patch: Partial<SoftSettings>): Promise<SoftSettings> {
  const current = await readSettings()
  const next: SoftSettings = {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  }

  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true })
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf-8")
  return next
}
