# Changes to the "Appointment Agent" n8n workflow

This documents exactly what changed between your original `Appointment Agent.json`
(exported from n8n, also in `C:\Users\DeLL\Downloads\Appointment Agent.json`) and
the version in this folder, so you can review it before importing.

**Nothing about the existing 9am Schedule Trigger path was removed or altered.**
Every change is either a new, parallel node, or a small guarded addition to
`Build Reminder Queue`'s code that only activates when the execution was started
by the new `Webhook Trigger` node. A Schedule-Trigger run behaves byte-for-byte
the same as before.

## Why

The website needs to trigger this same automation on demand — "Run Reminder
Agent", "Send Now" on one appointment, and a live SMS/email preview — without
duplicating the consent/contact/channel logic that already lives in this
workflow. So a second entry point was added that feeds the *same* pipeline.

## What was added (10 new nodes)

| Node | Type | Purpose |
|---|---|---|
| `Webhook Trigger` | Webhook | New entry point: `POST /webhook/reminder-agent`. Body: `{ "mode": "run" \| "single" \| "preview", "appointment_id"?: "..." }` |
| `Validate Secret` | IF | Rejects the request unless header `x-webhook-secret` matches the `WEBHOOK_SECRET` environment variable you set on your n8n instance (must match `N8N_WEBHOOK_SECRET` in the website's `.env.local`) |
| `Respond Unauthorized` | Respond to Webhook | Returns `401 {success:false,...}` when the secret doesn't match |
| `Is Empty Webhook Run?` | IF | Catches the case where a website-triggered batch run ("Run Reminder Agent") found nothing due tomorrow — see note below |
| `Build Empty Run Response` | Code | Formats a real zero-value summary for that case |
| `Is Preview?` | IF | When `mode === 'preview'`, short-circuits *before* `Has Valid Contact?` / `Route by Channel` / the send nodes — a preview never sends anything or writes to the sheet |
| `Build Preview Response` | Code | Formats the rendered SMS/email content for the website's preview dialog |
| `Log Run Summary` | Google Sheets (append) | Appends one row per run to a **new "Activity" tab** — the website's Activity page reads this |
| `Build Webhook Response` | Code | Wraps `Summarise Run`'s existing output in `{success, data}` for the website |
| `Respond Success` | Respond to Webhook | Returns `200` with whichever of the above response shapes applies |

## What was modified

- **`Build Reminder Queue`** (Code node): everything marked `ADDITIVE` in a comment.
  - Reads the webhook's `mode`/`appointment_id` (via `try/catch` around
    `$('Webhook Trigger').first()`, so it's a no-op on Schedule-Trigger runs).
  - In `single`/`preview` mode, matches one `appointment_id` instead of
    filtering by tomorrow's date — but still enforces every existing rule
    (must be `Scheduled`, must not already be `reminder_sent`, must have
    valid consent + contact). An ineligible target is reported back with a
    new `skip_reason` (`not_found` / `not_scheduled` / `already_reminded`)
    rather than silently failing.
  - Tags every output item with `mode` so `Is Preview?` and `Log Run Summary`
    can read it downstream.
  - **Why `Is Empty Webhook Run?` exists**: n8n does not execute a node that
    receives zero input items. The original workflow already relies on this
    for the (documented, pre-existing) "quiet day" behavior on the Schedule
    Trigger — see the source assignment's Homework Task 3. That's fine for a
    background schedule, but a website `fetch()` call waiting on a response
    would hang forever if a "Run Reminder Agent" click found nothing due. So
    when `Build Reminder Queue` is webhook-triggered in batch mode and the
    real queue is empty, it emits exactly one small marker item
    (`{__empty_run: true}`) instead of an empty array. `Is Empty Webhook Run?`
    intercepts *only* that marker and routes it straight to a zero-value
    response — it never reaches `Has Valid Contact?`, `Log Skipped Records`,
    or `Mark Reminder Sent`, so it can never create a bogus Exceptions row or
    appear as a fake appointment. A Schedule-Trigger run with nothing due is
    completely unaffected: the queue stays genuinely empty and the workflow
    ends quietly, exactly as it always has.
- **Connections**: `Build Reminder Queue` now points at `Is Empty Webhook Run?`
  instead of directly at `Has Valid Contact?` (both new IF gates sit in
  between). `Summarise Run`'s existing wire to `Send a message` (Slack) is
  untouched; two new parallel wires were added from it to `Log Run Summary`
  and `Build Webhook Response`.
- **Node positions**: nodes from `Has Valid Contact?` onward were shifted
  right on the canvas to make visual room for the two new inline gates. No
  functional effect — position is cosmetic metadata only.

## What was deliberately left alone

- `Get row(s) in sheet`, `Has Valid Contact?`, `Route by Channel`,
  `Send SMS Reminder`, `Send Email Reminder`, `Merge Channels`,
  `Mark Reminder Sent`, `Log Skipped Records`, `Summarise Run`,
  `Send a message`: byte-identical to your original, including all
  credential references.
- The 9:00 AM daily schedule and `Asia/Karachi` timezone.
- The consent/contact/channel selection business rules.

## One-time setup steps

1. **Add an "Activity" tab** to the same spreadsheet (ID
   `YOUR_SPREADSHEET_ID`), with header row:
   `run_date | target_date | mode | total | sent | skipped | by_sms | by_email | status`
2. In n8n's own environment (docker-compose `environment:` block, or your
   `.env` for `npx n8n`), set `WEBHOOK_SECRET` to a long random value.
3. Import this workflow (or apply the changes above by hand in the editor —
   safer if you want to keep your existing node IDs/credential bindings
   untouched) and pick your existing credentials from each node's dropdown
   if prompted.
4. **Toggle the workflow Active.** An inactive workflow only exposes a test
   webhook URL that requires the n8n editor to be open — the website needs
   the real production URL, which only exists once the workflow is Active.
5. Copy the production webhook URL (Webhook Trigger node → "Production URL")
   into the website's `N8N_WEBHOOK_URL`, and the same `WEBHOOK_SECRET` value
   into `N8N_WEBHOOK_SECRET`.
6. Sanity-check the new nodes' type versions against your installed n8n
   version (Webhook / Respond to Webhook node schemas occasionally change
   across n8n releases) — the editor will flag any mismatch on import, and
   it's a one-time, cheap fix if so.

## Verifying it

Tests for `Build Reminder Queue`'s new logic (24 assertions covering batch
filtering, single-send matching/not-found/already-reminded/not-scheduled,
preview rendering, and the empty-run marker) were run against the exact code
in this file before it was written here — see the project README's testing
checklist for how to verify the live workflow end-to-end once your
credentials are configured.
