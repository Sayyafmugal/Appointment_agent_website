import { listActivity } from "@/lib/google-sheets/activity"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"

export const GET = withErrorHandling(async () => {
  const runs = await listActivity()
  return ok(runs)
})
