import { listExceptions } from "@/lib/google-sheets/exceptions"
import { ok } from "@/lib/api/response"
import { withErrorHandling } from "@/lib/api/with-error-handling"

export const GET = withErrorHandling(async () => {
  const exceptions = await listExceptions()
  return ok(exceptions)
})
