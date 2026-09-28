export type SkipReason =
  | "no_consent_on_file"
  | "invalid_contact_details"
  | "not_found"
  | "not_scheduled"
  | "already_reminded"

export interface ReminderQueueItem {
  row_number: number | null
  appointment_id: string
  first_name: string
  phone_e164: string
  email: string
  clinician: string
  location: string
  appointment_date: string
  readable_date: string
  readable_time: string
  channel: "sms" | "email" | null
  has_valid_contact: boolean
  skip_reason: SkipReason | null
  consent_sms: boolean
  consent_email: boolean
  sms_text: string
  email_subject: string
  email_html: string
  target_date: string
  run_date: string
}

export type ReminderPreview = Pick<
  ReminderQueueItem,
  | "appointment_id"
  | "channel"
  | "has_valid_contact"
  | "skip_reason"
  | "sms_text"
  | "email_subject"
  | "email_html"
>

export interface RunSummary {
  run_date: string
  target_date: string
  total: number
  sent: number
  skipped: number
  by_sms: number
  by_email: number
}

export interface ReminderStats {
  total: number
  today: number
  tomorrow: number
  scheduled: number
  reminders_sent: number
  pending: number
  skipped: number
  by_sms: number
  by_email: number
  status_breakdown: { status: string; count: number }[]
  tomorrow_queue_preview: ReminderQueueItem[]
  demo_mode: boolean
}
