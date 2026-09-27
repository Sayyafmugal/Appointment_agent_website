import { readSettings, writeSettings } from "@/lib/settings/store"
import { softSettingsSchema } from "@/lib/validation/settings"
import { DEFAULT_CLINIC_CONFIG } from "@/lib/constants"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"

export const GET = withErrorHandling(async () => {
  const settings = await readSettings()
  return ok({
    ...settings,
    clinic_config: {
      clinic_name: DEFAULT_CLINIC_CONFIG.clinic_name,
      clinic_phone: DEFAULT_CLINIC_CONFIG.clinic_phone,
      clinic_timezone: DEFAULT_CLINIC_CONFIG.clinic_timezone,
      lead_days: DEFAULT_CLINIC_CONFIG.lead_days,
    },
  })
})

export const PUT = withErrorHandling(async (request: Request) => {
  const body = await request.json()
  const patch = softSettingsSchema.parse(body)
  const updated = await writeSettings(patch)
  return ok(updated)
})
