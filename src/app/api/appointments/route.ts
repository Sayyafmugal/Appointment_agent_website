import type { NextRequest } from "next/server"
import { createAppointment, listAppointments } from "@/lib/google-sheets/appointments"
import { appointmentCreateSchema } from "@/lib/validation/appointment"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"
import type { Appointment, AppointmentListResult } from "@/types/appointment"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams
  const q = (params.get("q") || "").trim().toLowerCase()
  const status = params.get("status") || undefined
  const channel = params.get("channel") || undefined
  const reminderStatus = params.get("reminderStatus") || undefined
  const sortBy = (params.get("sortBy") || "appointment_date") as keyof Appointment
  const sortDir = params.get("sortDir") === "desc" ? -1 : 1
  const page = Math.max(1, Number(params.get("page") || 1))
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") || 20)))

  let items = await listAppointments()

  if (q) {
    items = items.filter((a) => {
      const haystack = [
        a.appointment_id,
        a.patient_first_name,
        a.patient_last_name,
        `${a.patient_first_name} ${a.patient_last_name}`,
        a.email,
        a.phone_e164,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }
  if (status) items = items.filter((a) => a.status === status)
  if (channel) items = items.filter((a) => a.preferred_channel === channel)
  if (reminderStatus === "sent") items = items.filter((a) => a.reminder_sent)
  else if (reminderStatus === "pending")
    items = items.filter((a) => !a.reminder_sent && a.status === "Scheduled")

  items = [...items].sort((a, b) => {
    const av = String(a[sortBy] ?? "")
    const bv = String(b[sortBy] ?? "")
    return av.localeCompare(bv) * sortDir
  })

  const total = items.length
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  const result: AppointmentListResult = { items: pageItems, total, page, pageSize }
  return ok(result)
})

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json()
  const input = appointmentCreateSchema.parse(body)
  const created = await createAppointment(input)
  return ok(created, 201)
})
