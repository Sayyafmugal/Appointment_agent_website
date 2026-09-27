export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled"
export type PreferredChannel = "sms" | "email"

export interface Appointment {
  appointment_id: string
  patient_first_name: string
  patient_last_name: string
  phone_e164: string
  email: string
  appointment_date: string // yyyy-MM-dd
  appointment_time: string // HH:mm, 24h
  clinician: string
  location: string
  status: AppointmentStatus
  preferred_channel: PreferredChannel
  consent_sms: boolean
  consent_email: boolean
  reminder_sent: boolean
  reminder_channel: "" | "sms" | "email"
  reminder_sent_at: string // yyyy-MM-dd HH:mm or ''
}

export type AppointmentCreateInput = Omit<
  Appointment,
  "appointment_id" | "reminder_sent" | "reminder_channel" | "reminder_sent_at"
> & { appointment_id?: string }

export type AppointmentUpdateInput = Partial<Omit<Appointment, "appointment_id">>

export interface AppointmentListParams {
  q?: string
  status?: AppointmentStatus
  channel?: PreferredChannel
  reminderStatus?: "sent" | "pending" | "skipped"
  sortBy?: keyof Appointment
  sortDir?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export interface AppointmentListResult {
  items: Appointment[]
  total: number
  page: number
  pageSize: number
}
