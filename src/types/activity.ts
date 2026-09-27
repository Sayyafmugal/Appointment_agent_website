export type RunMode = "run" | "single" | "preview"

export interface ActivityRun {
  run_date: string
  target_date: string
  mode: RunMode
  total: number
  sent: number
  skipped: number
  by_sms: number
  by_email: number
  status: string
}
