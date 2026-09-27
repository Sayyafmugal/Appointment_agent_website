"use client"

import {
  BellRingIcon,
  CalendarCheck2Icon,
  CalendarClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  MailIcon,
  MessageSquareIcon,
  XCircleIcon,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { StatCard } from "@/components/dashboard/stat-card"
import { UpcomingAppointmentsTable } from "@/components/dashboard/upcoming-appointments-table"
import { ChannelDonutChart } from "@/components/dashboard/channel-donut-chart"
import { StatusBarChart } from "@/components/dashboard/status-bar-chart"
import { RunAgentButton } from "@/components/reminders/run-agent-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useReminderStats } from "@/hooks/use-reminders"
import { useAppointments } from "@/hooks/use-appointments"

export default function DashboardPage() {
  const stats = useReminderStats()
  const upcoming = useAppointments({
    status: "Scheduled",
    sortBy: "appointment_date",
    sortDir: "asc",
    pageSize: 8,
  })

  if (stats.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your Clinic Agent overview" />
        <ErrorState
          message={
            stats.error instanceof Error
              ? stats.error.message
              : "Demo / backend unavailable — configure GOOGLE_SHEETS_ID and the service account credentials in .env.local."
          }
          onRetry={() => stats.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your Clinic Agent — appointment reminder overview"
        actions={<RunAgentButton />}
      />

      {stats.isLoading || !stats.data ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Appointments" value={stats.data.total} icon={CalendarIcon} />
          <StatCard label="Today" value={stats.data.today} icon={ClockIcon} />
          <StatCard label="Tomorrow" value={stats.data.tomorrow} icon={CalendarClockIcon} />
          <StatCard label="Scheduled" value={stats.data.scheduled} icon={CalendarCheck2Icon} />
          <StatCard
            label="Reminders Sent"
            value={stats.data.reminders_sent}
            icon={CheckCircle2Icon}
            tone="good"
          />
          <StatCard
            label="Reminders Pending"
            value={stats.data.pending}
            icon={BellRingIcon}
            tone="warning"
          />
          <StatCard
            label="Skipped"
            value={stats.data.skipped}
            icon={XCircleIcon}
            tone="serious"
          />
          <StatCard label="SMS Reminders" value={stats.data.by_sms} icon={MessageSquareIcon} />
          <StatCard label="Email Reminders" value={stats.data.by_email} icon={MailIcon} />
        </div>
      )}

      {stats.data && (
        <div className="grid gap-4 md:grid-cols-2">
          <ChannelDonutChart bySms={stats.data.by_sms} byEmail={stats.data.by_email} />
          <StatusBarChart data={stats.data.status_breakdown} />
        </div>
      )}

      {upcoming.isError ? (
        <ErrorState
          message={
            upcoming.error instanceof Error
              ? upcoming.error.message
              : "Could not load upcoming appointments."
          }
          onRetry={() => upcoming.refetch()}
        />
      ) : upcoming.isLoading || !upcoming.data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <UpcomingAppointmentsTable appointments={upcoming.data.items} />
      )}
    </div>
  )
}

function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-[72px] w-full" />
      ))}
    </div>
  )
}
