import { listAppointments } from "@/lib/google-sheets/appointments"
import { listExceptions } from "@/lib/google-sheets/exceptions"
import { isDemoMode } from "@/lib/google-sheets/client"
import { buildReminderQueuePreview } from "@/lib/reminders/queue"
import { readSettings } from "@/lib/settings/store"
import { todayIso, tomorrowIso } from "@/lib/format"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"
import type { ReminderStats } from "@/types/reminder"

export const GET = withErrorHandling(async () => {
  const [appointments, exceptions, settings] = await Promise.all([
    listAppointments(),
    listExceptions(),
    readSettings(),
  ])

  const today = todayIso()
  const tomorrow = tomorrowIso()

  const statusCounts = new Map<string, number>()
  for (const a of appointments) {
    statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1)
  }

  const stats: ReminderStats = {
    total: appointments.length,
    today: appointments.filter((a) => a.appointment_date === today).length,
    tomorrow: appointments.filter((a) => a.appointment_date === tomorrow).length,
    scheduled: appointments.filter((a) => a.status === "Scheduled").length,
    reminders_sent: appointments.filter((a) => a.reminder_sent).length,
    pending: appointments.filter(
      (a) => a.status === "Scheduled" && !a.reminder_sent && a.appointment_date >= today
    ).length,
    skipped: exceptions.length,
    by_sms: appointments.filter((a) => a.reminder_channel === "sms").length,
    by_email: appointments.filter((a) => a.reminder_channel === "email").length,
    status_breakdown: Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    })),
    tomorrow_queue_preview: buildReminderQueuePreview(
      appointments,
      settings.default_lead_days
    ),
    demo_mode: isDemoMode(),
  }

  return ok(stats)
})
