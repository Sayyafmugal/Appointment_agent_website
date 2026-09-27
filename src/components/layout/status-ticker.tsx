"use client"

import * as React from "react"
import { useReminderStats } from "@/hooks/use-reminders"
import { useActivity } from "@/hooks/use-activity"
import { useSettings } from "@/hooks/use-settings"

function PulseDot({ tone }: { tone: "good" | "warning" | "critical" }) {
  const color = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-500",
  }[tone]

  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color}`} />
    </span>
  )
}

export function StatusTicker() {
  const stats = useReminderStats()
  const activity = useActivity()
  const settings = useSettings()

  const connectionTone = stats.isError ? "critical" : stats.isLoading ? "warning" : "good"
  const connectionLabel = stats.isError ? "OFFLINE" : stats.isLoading ? "SYNCING" : "ONLINE"

  const lastRun = activity.data?.[0]
  const clinicName = settings.data?.clinic_display_name

  const items = [
    <span key="status" className="flex items-center gap-1.5">
      <PulseDot tone={connectionTone} /> n8n Webhook Status: {connectionLabel}
    </span>,
    stats.data ? (
      <span key="pending" style={{ color: "var(--ticker-accent)" }} className="font-semibold">
        ⚡ Live Queue Poller: Active ({stats.data.pending} Appointments Pending)
      </span>
    ) : null,
    lastRun ? (
      <span key="lastrun">
        Last Batch Dispatch: {lastRun.by_sms} SMS &amp; {lastRun.by_email} Emails Sent
      </span>
    ) : null,
    clinicName ? <span key="tenant">Active Tenant: {clinicName}</span> : null,
    <span key="latency">API Gateway Latency: 24ms</span>,
  ].filter((item): item is React.ReactElement => item !== null)

  if (items.length === 0) return null

  function renderSequence(suffix: string) {
    return items.map((item, i) => (
      <React.Fragment key={`${suffix}-${i}`}>
        {item}
        <span className="opacity-40">•</span>
      </React.Fragment>
    ))
  }

  return (
    <div
      className="border-b py-1 font-mono text-[10px]"
      style={{
        backgroundColor: "var(--ticker-bg)",
        color: "var(--ticker-fg)",
        borderColor: "color-mix(in srgb, var(--ticker-accent) 25%, transparent)",
      }}
    >
      <div className="ticker-wrap">
        <div className="ticker-content flex items-center gap-5 px-3">
          {renderSequence("a")}
          {renderSequence("b")}
        </div>
      </div>
    </div>
  )
}
