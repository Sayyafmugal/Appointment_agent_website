import type { SkipReason } from "./reminder"

export interface ExceptionRecord {
  run_date: string
  appointment_id: string
  appointment_date: string
  reason: SkipReason | string
}
