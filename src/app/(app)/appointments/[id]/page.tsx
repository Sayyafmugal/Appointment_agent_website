"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { BanIcon, BellRingIcon, PencilIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { LinkButton } from "@/components/shared/link-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AppointmentStatusBadge,
  ChannelBadge,
  ReminderStatusBadge,
} from "@/components/shared/status-badges"
import { ReminderPreviewDialog } from "@/components/reminders/reminder-preview-dialog"
import { formatDateDisplay, formatDateTimeDisplay, formatTimeDisplay } from "@/lib/format"
import { useAppointment, useUpdateAppointment } from "@/hooks/use-appointments"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>()
  const id = decodeURIComponent(params.id)
  const { data, isLoading, isError, error, refetch } = useAppointment(id)
  const updateAppointment = useUpdateAppointment()
  const [cancelOpen, setCancelOpen] = React.useState(false)

  async function handleCancel() {
    try {
      await updateAppointment.mutateAsync({ id, patch: { status: "Cancelled" } })
      toast.success("Appointment cancelled.")
      setCancelOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel appointment.")
    }
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Appointment" description={id} />
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load appointment."}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Appointment" description={id} />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const name = `${data.patient_first_name} ${data.patient_last_name}`

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={name}
        description={`${data.appointment_id} · ${formatDateDisplay(data.appointment_date)}`}
        actions={
          <>
            <LinkButton variant="outline" href={`/appointments/${encodeURIComponent(id)}/edit`}>
              <PencilIcon className="size-4" /> Edit
            </LinkButton>
            {data.status === "Scheduled" && (
              <Button variant="outline" onClick={() => setCancelOpen(true)}>
                <BanIcon className="size-4" /> Cancel
              </Button>
            )}
            <ReminderPreviewDialog appointmentId={data.appointment_id} patientName={name}>
              <Button>
                <BellRingIcon className="size-4" /> Send Reminder
              </Button>
            </ReminderPreviewDialog>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" value={name} />
          <Field label="Phone" value={data.phone_e164 || "—"} />
          <Field label="Email" value={data.email || "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Appointment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" value={formatDateDisplay(data.appointment_date)} />
          <Field label="Time" value={formatTimeDisplay(data.appointment_time)} />
          <Field label="Status" value={<AppointmentStatusBadge status={data.status} />} />
          <Field label="Clinician" value={data.clinician || "—"} />
          <Field label="Location" value={data.location || "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Reminder</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Preferred channel"
            value={<ChannelBadge channel={data.preferred_channel} />}
          />
          <Field label="SMS consent" value={data.consent_sms ? "Yes" : "No"} />
          <Field label="Email consent" value={data.consent_email ? "Yes" : "No"} />
          <Field
            label="Reminder status"
            value={
              <ReminderStatusBadge
                reminderSent={data.reminder_sent}
                isScheduled={data.status === "Scheduled"}
              />
            }
          />
          <Field
            label="Reminder channel"
            value={
              data.reminder_channel ? <ChannelBadge channel={data.reminder_channel} /> : "—"
            }
          />
          <Field
            label="Reminder sent at"
            value={
              data.reminder_sent_at ? formatDateTimeDisplay(data.reminder_sent_at) : "—"
            }
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this appointment?"
        description={`${name}'s appointment will be marked Cancelled and excluded from future reminder runs.`}
        confirmLabel="Mark as Cancelled"
        destructive
        loading={updateAppointment.isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}
