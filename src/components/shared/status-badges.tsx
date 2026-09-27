import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  MailIcon,
  MessageSquareIcon,
  XCircleIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import { SKIP_REASON_LABELS } from "@/lib/constants"
import type { AppointmentStatus, PreferredChannel } from "@/types/appointment"

function toneClasses(tone: "good" | "warning" | "serious" | "critical" | "info") {
  switch (tone) {
    case "good":
      return "bg-status-good/10 text-status-good border-status-good/20"
    case "warning":
      return "bg-status-warning/15 text-amber-800 border-status-warning/30 dark:text-amber-300"
    case "serious":
      return "bg-status-serious/15 text-orange-800 border-status-serious/30 dark:text-orange-300"
    case "critical":
      return "bg-status-critical/10 text-status-critical border-status-critical/20"
    case "info":
      return "bg-chart-1/10 text-chart-1 border-chart-1/20"
  }
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = {
    Scheduled: { tone: "info" as const, icon: ClockIcon, label: "Scheduled" },
    Completed: { tone: "good" as const, icon: CheckCircle2Icon, label: "Completed" },
    Cancelled: { tone: "critical" as const, icon: XCircleIcon, label: "Cancelled" },
  }[status]

  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn("gap-1", toneClasses(config.tone))}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}

export function ReminderStatusBadge({
  reminderSent,
  isScheduled,
}: {
  reminderSent: boolean
  isScheduled: boolean
}) {
  if (reminderSent) {
    return (
      <Badge variant="outline" className={cn("gap-1", toneClasses("good"))}>
        <CheckCircle2Icon className="size-3" />
        Sent
      </Badge>
    )
  }
  if (!isScheduled) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        Not applicable
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={cn("gap-1", toneClasses("warning"))}>
      <ClockIcon className="size-3" />
      Pending
    </Badge>
  )
}

export function SkipReasonBadge({ reason }: { reason: string | null }) {
  if (!reason) return null
  return (
    <Badge variant="outline" className={cn("gap-1", toneClasses("serious"))}>
      <AlertTriangleIcon className="size-3" />
      {SKIP_REASON_LABELS[reason] ?? reason}
    </Badge>
  )
}

export function ChannelBadge({ channel }: { channel: PreferredChannel | "sms" | "email" | null }) {
  if (!channel) return <span className="text-muted-foreground text-sm">—</span>
  const Icon = channel === "sms" ? MessageSquareIcon : MailIcon
  return (
    <Badge variant="outline" className="gap-1 text-foreground">
      <Icon className="size-3" />
      {channel === "sms" ? "SMS" : "Email"}
    </Badge>
  )
}
