import {
  deleteAppointment,
  getAppointmentById,
  updateAppointment,
} from "@/lib/google-sheets/appointments"
import { appointmentUpdateSchema } from "@/lib/validation/appointment"
import { ApiError, ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"

type Params = { params: Promise<{ id: string }> }

export const GET = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id } = await params
  const appointment = await getAppointmentById(decodeURIComponent(id))
  if (!appointment) {
    throw new ApiError(`Appointment "${id}" was not found.`, 404)
  }
  return ok(appointment)
})

export const PUT = withErrorHandling(async (request: Request, { params }: Params) => {
  const { id } = await params
  const body = await request.json()
  const patch = appointmentUpdateSchema.parse(body)
  const updated = await updateAppointment(decodeURIComponent(id), patch)
  return ok(updated)
})

export const DELETE = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { id } = await params
  await deleteAppointment(decodeURIComponent(id))
  return ok({ deleted: true })
})
