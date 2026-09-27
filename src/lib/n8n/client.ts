import "server-only"
import { invalidateAppointmentsCache } from "@/lib/google-sheets/appointments"
import type { ReminderPreview, RunSummary } from "@/types/reminder"

export class N8nClientError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "N8nClientError"
    this.status = status
  }
}

interface WebhookBody {
  mode: "run" | "single" | "preview"
  appointment_id?: string
}

async function callWebhook<T>(body: WebhookBody, timeoutMs: number): Promise<T> {
  const url = process.env.N8N_WEBHOOK_URL
  const secret = process.env.N8N_WEBHOOK_SECRET
  if (!url || !secret) {
    throw new N8nClientError(
      "The reminder automation is not configured. Set N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET.",
      503
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    })
  } catch {
    throw new N8nClientError(
      "Unable to reach the reminder automation. Please try again.",
      502
    )
  } finally {
    clearTimeout(timeout)
  }

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    // fall through to status-based error below
  }

  if (!res.ok) {
    const message =
      (payload as { error?: { message?: string } } | null)?.error?.message ||
      "The reminder automation returned an error."
    throw new N8nClientError(message, res.status)
  }

  const envelope = payload as { success?: boolean; data?: T } | null
  if (!envelope || envelope.success !== true || envelope.data === undefined) {
    throw new N8nClientError(
      "The reminder automation returned an unexpected response.",
      502
    )
  }

  return envelope.data
}

export async function runReminderAgent(): Promise<RunSummary> {
  const result = await callWebhook<RunSummary>({ mode: "run" }, 25_000)
  invalidateAppointmentsCache()
  return result
}

export async function sendSingleReminder(appointmentId: string): Promise<RunSummary> {
  const result = await callWebhook<RunSummary>(
    { mode: "single", appointment_id: appointmentId },
    20_000
  )
  invalidateAppointmentsCache()
  return result
}

export async function previewReminder(appointmentId: string): Promise<ReminderPreview> {
  return callWebhook<ReminderPreview>(
    { mode: "preview", appointment_id: appointmentId },
    10_000
  )
}
