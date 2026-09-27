"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2Icon, MailIcon, MessageSquareIcon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/shared/error-state"
import { SkipReasonBadge } from "@/components/shared/status-badges"
import { useReminderPreview, useSendReminder } from "@/hooks/use-reminders"

export function ReminderPreviewDialog({
  appointmentId,
  patientName,
  children,
}: {
  appointmentId: string
  patientName: string
  children: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  const preview = useReminderPreview(open ? appointmentId : undefined)
  const sendReminder = useSendReminder()

  async function handleSend() {
    try {
      await sendReminder.mutateAsync(appointmentId)
      toast.success(`Reminder sent successfully to ${patientName}.`)
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reminder failed to send.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reminder preview — {patientName}</DialogTitle>
          <DialogDescription>
            Exact content the automation will send, rendered live by n8n.
          </DialogDescription>
        </DialogHeader>

        {preview.isLoading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : preview.isError ? (
          <ErrorState
            message={
              preview.error instanceof Error
                ? preview.error.message
                : "Unable to reach the reminder automation."
            }
            onRetry={() => preview.refetch()}
          />
        ) : preview.data ? (
          <div className="space-y-3 py-1">
            {!preview.data.has_valid_contact ? (
              <div className="bg-destructive/5 border-destructive/20 rounded-md border p-3 text-sm">
                <p className="mb-1 font-medium">This reminder cannot be sent.</p>
                <SkipReasonBadge reason={preview.data.skip_reason} />
              </div>
            ) : preview.data.channel === "sms" ? (
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
                  <MessageSquareIcon className="size-3.5" /> SMS
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {preview.data.sms_text}
                </p>
              </div>
            ) : (
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
                  <MailIcon className="size-3.5" /> Email
                </p>
                <p className="mb-2 text-sm font-medium">{preview.data.email_subject}</p>
                <div
                  className="max-h-64 overflow-y-auto rounded border bg-white p-2 text-black"
                  dangerouslySetInnerHTML={{ __html: preview.data.email_html }}
                />
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button
            onClick={handleSend}
            disabled={!preview.data?.has_valid_contact || sendReminder.isPending}
          >
            {sendReminder.isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Sending reminder…
              </>
            ) : (
              <>
                <SendIcon className="size-4" />
                Confirm &amp; Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
