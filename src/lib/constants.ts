/**
 * These regexes and the channel-selection order MUST stay identical to the
 * n8n "Build Reminder Queue" Code node (n8n/Appointment Agent.json) — that
 * node is the source of truth for the automation's actual behavior. Anything
 * here is a read-only mirror used for form validation and the Reminders
 * Center's local queue preview.
 */
export const E164_REGEX = /^\+[1-9]\d{7,14}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const CLINIC_TZ = "Asia/Karachi"

export const SHEET_NAMES = {
  appointments: "Appointments",
  exceptions: "Exceptions",
  activity: "Activity",
} as const

export const APPOINTMENT_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const
export const PREFERRED_CHANNELS = ["sms", "email"] as const

export const SKIP_REASON_LABELS: Record<string, string> = {
  no_consent_on_file: "No consent on file",
  invalid_contact_details: "Invalid contact details",
  not_found: "Appointment not found",
  not_scheduled: "Appointment not scheduled",
  already_reminded: "Reminder already sent",
}

export const DEFAULT_CLINIC_CONFIG = {
  clinic_name: process.env.DISPLAY_CLINIC_NAME || "Your Clinic Agent",
  clinic_phone: process.env.DISPLAY_CLINIC_PHONE || "+92 42 111 222 333",
  clinic_timezone: process.env.DISPLAY_CLINIC_TIMEZONE || CLINIC_TZ,
  lead_days: Number(process.env.DISPLAY_LEAD_DAYS || 1),
}
