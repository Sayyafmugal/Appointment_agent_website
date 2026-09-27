import { z } from "zod"

export const softSettingsSchema = z.object({
  default_lead_days: z.number().int().min(0).max(30),
  clinic_display_name: z.string().trim().min(1),
  clinic_phone: z.string().trim().min(1),
  clinic_timezone: z.string().trim().min(1),
})

export type SoftSettingsSchema = z.infer<typeof softSettingsSchema>
