"use client"

import {
  BellRingIcon,
  CheckCircle2Icon,
  MailIcon,
  MessageSquareIcon,
  XCircleIcon,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { ReminderQueueTable } from "@/components/reminders/reminder-queue-table"
import { RunAgentButton } from "@/components/reminders/run-agent-button"
import { useReminderStats } from "@/hooks/use-reminders"

export default function RemindersPage() {
  const { data, isLoading, isError, error, refetch } = useReminderStats()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminder Center"
        description="Review who's due for a reminder and trigger the automation."
        actions={<RunAgentButton />}
      />

      {isError ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Demo / backend unavailable — the reminder automation could not be reached."
          }
          onRetry={() => refetch()}
        />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Pending"
              value={data.pending}
              icon={BellRingIcon}
              tone="warning"
            />
            <StatCard
              label="Sent"
              value={data.reminders_sent}
              icon={CheckCircle2Icon}
              tone="good"
            />
            <StatCard label="SMS" value={data.by_sms} icon={MessageSquareIcon} />
            <StatCard label="Email" value={data.by_email} icon={MailIcon} />
            <StatCard
              label="Skipped"
              value={data.skipped}
              icon={XCircleIcon}
              tone="serious"
            />
          </div>

          <Card className="shimmer-card">
            <CardHeader>
              <CardTitle className="text-base">
                Tomorrow&apos;s Reminder Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReminderQueueTable items={data.tomorrow_queue_preview} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
