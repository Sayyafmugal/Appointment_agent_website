import { runReminderAgent } from "@/lib/n8n/client"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"

export const POST = withErrorHandling(async () => {
  const summary = await runReminderAgent()
  return ok(summary)
})
