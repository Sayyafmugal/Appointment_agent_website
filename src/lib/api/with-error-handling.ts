import { ZodError } from "zod"
import { ApiError, fail } from "./response"
import { N8nClientError } from "@/lib/n8n/client"

/**
 * Wraps a route handler so every failure mode — validation, "not found",
 * n8n unreachable, an unexpected Google Sheets/library error — becomes a
 * clean {success:false,error:{message}} response. Raw errors (stack traces,
 * provider error bodies) are logged server-side only, never sent to the
 * browser.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.status)
      }
      if (error instanceof N8nClientError) {
        return fail(error.message, error.status)
      }
      if (error instanceof ZodError) {
        const first = error.issues[0]
        const field = first?.path?.join(".")
        return fail(
          field ? `${field}: ${first.message}` : "Invalid request data.",
          400
        )
      }

      console.error("[api] unhandled error:", error)
      const message =
        error instanceof Error && /was not found/i.test(error.message)
          ? error.message
          : "Something went wrong. Please try again."
      const status =
        error instanceof Error && /was not found/i.test(error.message)
          ? 404
          : 500
      return fail(message, status)
    }
  }
}
