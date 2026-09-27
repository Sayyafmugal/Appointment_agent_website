import { sendSingleReminder } from "@/lib/n8n/client"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"

type Params = { params: Promise<{ appointmentId: string }> }

export const POST = withErrorHandling(async (_request: Request, { params }: Params) => {
  const { appointmentId } = await params
  const summary = await sendSingleReminder(decodeURIComponent(appointmentId))
  return ok(summary)
})
