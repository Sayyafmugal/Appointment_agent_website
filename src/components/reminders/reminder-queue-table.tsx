import { CheckCircle2Icon, MailIcon, MessageSquareIcon, SendIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ChannelBadge, SkipReasonBadge } from "@/components/shared/status-badges"
import { ReminderPreviewDialog } from "@/components/reminders/reminder-preview-dialog"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/format"
import { InboxIcon } from "lucide-react"
import type { ReminderQueueItem } from "@/types/reminder"

export function ReminderQueueTable({ items }: { items: ReminderQueueItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No reminders pending."
        description="Nobody is due for a reminder based on tomorrow's schedule right now."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Appointment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Consent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.appointment_id}>
              <TableCell className="font-medium">{item.first_name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {item.appointment_id}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDateDisplay(item.appointment_date)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatTimeDisplay(item.readable_time || "")}
              </TableCell>
              <TableCell>
                <ChannelBadge channel={item.channel} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {item.channel === "email" ? item.email : item.phone_e164 || "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge
                    variant="outline"
                    className={`gap-1 text-[10px] ${item.consent_sms ? "text-status-good border-status-good/30" : "text-muted-foreground"}`}
                  >
                    <MessageSquareIcon className="size-3" />
                    SMS {item.consent_sms ? "✓" : "✕"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`gap-1 text-[10px] ${item.consent_email ? "text-status-good border-status-good/30" : "text-muted-foreground"}`}
                  >
                    <MailIcon className="size-3" />
                    Email {item.consent_email ? "✓" : "✕"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {item.has_valid_contact ? (
                  <Badge
                    variant="outline"
                    className="bg-status-good/10 text-status-good border-status-good/20 gap-1"
                  >
                    <CheckCircle2Icon className="size-3" /> Ready
                  </Badge>
                ) : (
                  <SkipReasonBadge reason={item.skip_reason} />
                )}
              </TableCell>
              <TableCell className="text-right">
                <ReminderPreviewDialog appointmentId={item.appointment_id} patientName={item.first_name}>
                  <Button size="sm" variant="outline">
                    <SendIcon className="size-3.5" /> Send Now
                  </Button>
                </ReminderPreviewDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
