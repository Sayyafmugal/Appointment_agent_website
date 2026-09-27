# Appointment Agent — Your Clinic Agent

A professional appointment management dashboard for Your Clinic Agent,
backed by the **Appointment Agent** n8n automation. This is not a demo with
fake data — the dashboard reads and writes the same Google Sheet the
automation uses, and "Run Reminder Agent" / "Send Now" / "Preview" call the
real n8n workflow over a secret-protected webhook. SMS/email/Slack
credentials never leave n8n.

```
Browser → Next.js pages → Next.js API routes (server-only) → Google Sheets API (service account)
                                                             → n8n Webhook (shared-secret header) → Seven SMS / Gmail / Slack
```

## What was built

- **Dashboard** (`/dashboard`) — stat cards, upcoming appointments, reminder
  channel/status charts, a "Run Reminder Agent" shortcut.
- **Appointments** (`/appointments`, `/appointments/new`,
  `/appointments/[id]`, `/appointments/[id]/edit`) — search/filter/sort/
  paginate, create/edit with validation (E.164 phone, email, date/time,
  enums), delete/cancel with confirmation, per-row "Send Reminder" preview.
- **Reminder Center** (`/reminders`) — live stats, tomorrow's reminder queue
  with per-row preview + Send Now, and the prominent Run Reminder Agent
  button (confirm → live progress → real result summary).
- **Activity** (`/activity`) — execution history read from a new "Activity"
  sheet tab that n8n appends to after every run (scheduled or manual).
- **Exceptions** (`/exceptions`) — skipped appointments from the n8n
  workflow's existing "Exceptions" sheet, with a "Fix Appointment" shortcut.
- **Settings** (`/settings`) — clinic configuration shown read-only (mirrors
  n8n, never silently rewrites it) plus a small set of website-only
  preferences.
- The n8n workflow itself, extended (not replaced) with a webhook entry
  point — see `n8n/CHANGES.md` for the exact, reviewed diff.

## Project structure

```
n8n/Appointment Agent.json   Updated workflow (see n8n/CHANGES.md for the diff)
n8n/CHANGES.md               Exactly what changed and why

src/app/                     Pages (App Router) + API routes under src/app/api/**
src/components/              UI: shadcn/ui primitives, layout shell, per-feature components
src/lib/google-sheets/       Service-account Sheets client + Appointments/Exceptions/Activity CRUD
src/lib/n8n/client.ts        Webhook client (run / single-send / preview)
src/lib/reminders/queue.ts   Local read-only mirror of the batch queue logic, for the
                              Reminders Center's list view only — the per-row preview and
                              every send always go through the live n8n webhook
src/lib/validation/          zod schemas (mirrors n8n's E.164/email rules)
src/hooks/                   React Query hooks (data fetching + auto-refresh after mutations)
src/types/                   Shared TypeScript types

data/settings.json           Website-only preferences (gitignored, created on first write)
.env.local.example           Every required environment variable, documented
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in real values (see that
file for full setup notes on each):

```
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
DISPLAY_CLINIC_NAME=
DISPLAY_CLINIC_PHONE=
DISPLAY_CLINIC_TIMEZONE=
DISPLAY_LEAD_DAYS=
```

None of these are `NEXT_PUBLIC_*` — they are only ever read in server-side
code (API routes, `src/lib/**` files marked `import "server-only"`) and are
never sent to the browser.

## n8n changes

The existing "Appointment Agent" workflow was extended, not rewritten:
a new `Webhook Trigger` feeds the *same* processing pipeline the 9am
`Schedule Trigger` already uses, with small additive logic so it can also
handle a single-appointment send/preview and always return a real JSON
response. The daily 9am automatic run is completely untouched.

Full detail, including exactly which nodes were added and why, is in
[`n8n/CHANGES.md`](n8n/CHANGES.md) — read that before importing.

## How the website talks to n8n

1. The browser calls the website's own API, e.g. `POST /api/reminders/run`.
2. The Next.js route handler (server-side) calls
   `N8N_WEBHOOK_URL` with header `x-webhook-secret: N8N_WEBHOOK_SECRET` and
   a small JSON body: `{"mode":"run"}`, `{"mode":"single","appointment_id":"..."}`,
   or `{"mode":"preview","appointment_id":"..."}`.
3. n8n validates the secret, runs the exact same consent/contact/channel
   logic as the scheduled run, and (for `run`/`single`) actually sends
   SMS/email and writes back to the Appointments/Exceptions/Activity sheets.
4. n8n responds synchronously with `{"success":true,"data":{...}}`, which
   the website relays to the browser unchanged.
5. If n8n is unreachable, times out, or returns an error, the website shows
   a clear "backend unavailable" / "reminder failed" message — it never
   fabricates a result.

## How to run locally

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

Open http://localhost:3000 — a landing page, then **View Dashboard** into the
app. Before your `.env.local` is filled in, pages will show a clear
"backend unavailable" error state rather than fake data (this is
intentional, not a bug).

```bash
npm run build   # production build + typecheck
npm run lint    # eslint
```

## How to configure n8n

1. Open your n8n instance (self-hosted: Docker or `npx n8n`).
2. Add an **Activity** tab to the spreadsheet (same one the workflow already
   uses), headers: `run_date | target_date | mode | total | sent | skipped | by_sms | by_email | status`.
3. Create a Google Cloud **service account**, enable the Sheets API, and
   share the spreadsheet with its email (Editor access) — this is what the
   *website* uses; it's separate from n8n's own OAuth2 Google Sheets
   credential.
4. Set an n8n environment variable `WEBHOOK_SECRET` to a long random value.
5. In `n8n/Appointment Agent.json`, replace every `YOUR_SPREADSHEET_ID`
   placeholder with your real spreadsheet ID (find/replace across the file —
   it appears in 4 of the Google Sheets nodes), then import it (or apply the
   diff by hand — see `n8n/CHANGES.md`), and re-select your existing Google
   Sheets / Seven / Gmail / Slack credentials in each node if the import
   doesn't auto-bind
   them.
6. **Toggle the workflow Active** — required for the real production webhook
   URL to work outside the n8n editor.
7. Copy the Webhook Trigger node's **Production URL** into the website's
   `N8N_WEBHOOK_URL`, and the same secret into `N8N_WEBHOOK_SECRET`.

## Testing checklist

- [ ] Dashboard loads and shows real stat counts from the sheet
- [ ] Appointments list loads, search/filter/sort/pagination all work
- [ ] Create an appointment → appears in the sheet and the list
- [ ] Edit an appointment → sheet updates, detail page reflects it
- [ ] Delete an appointment → row removed from the sheet
- [ ] Cancel an appointment → status becomes Cancelled, excluded from reminders
- [ ] Reminder preview shows the exact SMS/email n8n would send
- [ ] "Run Reminder Agent" → real SMS/email sent for eligible appointments,
      Appointments sheet updated, Exceptions sheet gets skip rows, Slack
      posts the summary, and the website shows the same numbers
- [ ] "Send Now" on one appointment forces a single send, respecting consent
      (never bypasses it, even on a forced send)
- [ ] Activity page shows a new row after each run
- [ ] Exceptions page shows skipped rows with the right reason and a working
      "Fix Appointment" link
- [ ] Turning off `.env.local` values shows "backend unavailable", not fake data
- [ ] Mobile width (~400px): sidebar collapses to a drawer, tables scroll
      horizontally inside their own container, no page-wide horizontal scroll
- [ ] Light/dark theme toggle

## Security notes

- **No login is enabled on this deployment by design** — it's meant as a
  public, read-around portfolio demo with fake/demo data, not a place real
  patient data should ever live. If you point this at a real clinic's data,
  add authentication first (a per-user login, not a single shared password)
  before putting it anywhere reachable by the public internet.
- All secrets (Google service account key, n8n webhook secret) are
  server-only environment variables — never `NEXT_PUBLIC_*`, never sent to
  the browser, never committed (`.env*` is gitignored).
- The n8n webhook requires a matching `x-webhook-secret` header; requests
  without it are rejected with 401 before touching any data.
- All write endpoints validate input server-side with zod, independent of
  client-side form validation.
- Rotate any credential that's ever been shared over chat/email/screenshots
  before relying on it in a real deployment.
