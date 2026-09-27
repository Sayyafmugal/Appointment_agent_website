import { DateTime } from "luxon"
import { CLINIC_TZ } from "@/lib/constants"

export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return "—"
  const dt = DateTime.fromFormat(isoDate, "yyyy-MM-dd", { zone: CLINIC_TZ })
  return dt.isValid ? dt.toFormat("cccc d LLLL yyyy") : isoDate
}

export function formatTimeDisplay(time24: string): string {
  if (!time24) return "—"
  const dt = DateTime.fromFormat(time24, "HH:mm", { zone: CLINIC_TZ })
  return dt.isValid ? dt.toFormat("h:mm a") : time24
}

export function formatDateTimeDisplay(value: string): string {
  if (!value) return "—"
  const dt = DateTime.fromFormat(value, "yyyy-MM-dd HH:mm", { zone: CLINIC_TZ })
  return dt.isValid ? dt.toFormat("d LLL yyyy, h:mm a") : value
}

export function todayIso(): string {
  return DateTime.now().setZone(CLINIC_TZ).toFormat("yyyy-MM-dd")
}

export function tomorrowIso(): string {
  return DateTime.now().setZone(CLINIC_TZ).plus({ days: 1 }).toFormat("yyyy-MM-dd")
}
