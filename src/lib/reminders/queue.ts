import "server-only"
import { DateTime } from "luxon"
import { CLINIC_TZ, E164_REGEX, EMAIL_REGEX } from "@/lib/constants"
import type { Appointment } from "@/types/appointment"
import type { ReminderQueueItem, SkipReason } from "@/types/reminder"

/**
 * Pure, read-only mirror of the BATCH-mode filtering/channel-selection logic
 * in the n8n "Build Reminder Queue" Code node (n8n/Appointment Agent.json).
 * Used only to power the Reminders Center's "who is due tomorrow" table
 * without an n8n round trip per page load.
 *
 * This does NOT render sms_text/email_html (left blank) — the actual
 * message content shown to an admin always comes from the live n8n
 * `preview` webhook (src/lib/n8n/client.ts:previewReminder), which is the
 * single source of truth for exact rendered content. If the n8n node's
 * filter/consent/channel rules ever change, this function must be updated
 * to match, or this preview list will drift from what the 9am run actually
 * processes.
 */
export function computeTargetDate(leadDays: number, now: DateTime = DateTime.now()): {
  targetDate: string
  runDate: string
} {
  const nowLocal = now.setZone(CLINIC_TZ)
  return {
    targetDate: nowLocal.plus({ days: leadDays }).toFormat("yyyy-MM-dd"),
    runDate: nowLocal.toFormat("yyyy-MM-dd"),
  }
}

function isTrue(v: boolean): boolean {
  return v === true
}

export function buildReminderQueuePreview(
  appointments: Appointment[],
  leadDays: number
): ReminderQueueItem[] {
  const { targetDate, runDate } = computeTargetDate(leadDays)
  const queue: ReminderQueueItem[] = []

  for (const r of appointments) {
    if (r.appointment_date !== targetDate) continue
    if (r.status !== "Scheduled") continue
    if (r.reminder_sent) continue

    const phoneOk = E164_REGEX.test(r.phone_e164) && isTrue(r.consent_sms)
    const emailOk = EMAIL_REGEX.test(r.email) && isTrue(r.consent_email)

    let channel: "sms" | "email" | null = null
    let skip_reason: SkipReason | null = null

    if (r.preferred_channel === "sms" && phoneOk) channel = "sms"
    else if (r.preferred_channel === "email" && emailOk) channel = "email"
    else if (phoneOk) channel = "sms"
    else if (emailOk) channel = "email"
    else {
      skip_reason =
        !r.consent_sms && !r.consent_email
          ? "no_consent_on_file"
          : "invalid_contact_details"
    }

    let readable_date = r.appointment_date
    let readable_time = r.appointment_time
    const when = DateTime.fromFormat(
      `${r.appointment_date} ${r.appointment_time}`,
      "yyyy-MM-dd HH:mm",
      { zone: CLINIC_TZ }
    )
    if (when.isValid) {
      readable_date = when.toFormat("cccc d LLLL")
      readable_time = when.toFormat("h:mm a")
    }

    queue.push({
      row_number: null,
      appointment_id: r.appointment_id,
      first_name: r.patient_first_name || "there",
      phone_e164: r.phone_e164,
      email: r.email,
      clinician: r.clinician,
      location: r.location,
      appointment_date: r.appointment_date,
      readable_date,
      readable_time,
      channel,
      has_valid_contact: channel !== null,
      skip_reason,
      consent_sms: r.consent_sms,
      consent_email: r.consent_email,
      sms_text: "",
      email_subject: "",
      email_html: "",
      target_date: targetDate,
      run_date: runDate,
    })
  }

  return queue
}
