"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BanIcon,
  BellRingIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AppointmentStatusBadge,
  ChannelBadge,
  ReminderStatusBadge,
} from "@/components/shared/status-badges"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ReminderPreviewDialog } from "@/components/reminders/reminder-preview-dialog"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/format"
import { useDeleteAppointment, useUpdateAppointment } from "@/hooks/use-appointments"
import { CalendarSearchIcon } from "lucide-react"
import type { Appointment } from "@/types/appointment"

export function AppointmentsTable({ appointments }: { appointments: Appointment[] }) {
  const [deleteTarget, setDeleteTarget] = React.useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(null)
  const deleteAppointment = useDeleteAppointment()
  const updateAppointment = useUpdateAppointment()

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteAppointment.mutateAsync(deleteTarget.appointment_id)
      toast.success("Appointment deleted successfully.")
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete appointment.")
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return
    try {
      await updateAppointment.mutateAsync({
        id: cancelTarget.appointment_id,
        patch: { status: "Cancelled" },
      })
      toast.success("Appointment cancelled.")
      setCancelTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel appointment.")
    }
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarSearchIcon}
        title="No appointments found."
        description="Try adjusting your search or filters, or add a new appointment."
      />
    )
  }

  return (
    <>
      <div className="shimmer-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Appointment ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Clinician</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((a) => {
              const name = `${a.patient_first_name} ${a.patient_last_name}`
              return (
                <TableRow key={a.appointment_id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <Link
                      href={`/appointments/${encodeURIComponent(a.appointment_id)}`}
                      className="hover:underline"
                    >
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {a.appointment_id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateDisplay(a.appointment_date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatTimeDisplay(a.appointment_time)}
                  </TableCell>
                  <TableCell>{a.clinician}</TableCell>
                  <TableCell>{a.location}</TableCell>
                  <TableCell>
                    <AppointmentStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>
                    <ChannelBadge channel={a.preferred_channel} />
                  </TableCell>
                  <TableCell>
                    <ReminderStatusBadge
                      reminderSent={a.reminder_sent}
                      isScheduled={a.status === "Scheduled"}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${name}`} />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <Link href={`/appointments/${encodeURIComponent(a.appointment_id)}`} />
                          }
                        >
                          <EyeIcon className="size-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/appointments/${encodeURIComponent(a.appointment_id)}/edit`}
                            />
                          }
                        >
                          <PencilIcon className="size-4" /> Edit
                        </DropdownMenuItem>
                        <ReminderPreviewDialog appointmentId={a.appointment_id} patientName={name}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <BellRingIcon className="size-4" /> Send Reminder
                          </DropdownMenuItem>
                        </ReminderPreviewDialog>
                        <DropdownMenuSeparator />
                        {a.status === "Scheduled" && (
                          <DropdownMenuItem onClick={() => setCancelTarget(a)}>
                            <BanIcon className="size-4" /> Mark as Cancelled
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(a)}
                        >
                          <Trash2Icon className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this appointment?"
        description={
          <>
            This permanently removes{" "}
            <strong>
              {deleteTarget?.patient_first_name} {deleteTarget?.patient_last_name}
            </strong>
            &apos;s appointment ({deleteTarget?.appointment_id}) from the sheet. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        loading={deleteAppointment.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this appointment?"
        description={
          <>
            <strong>
              {cancelTarget?.patient_first_name} {cancelTarget?.patient_last_name}
            </strong>
            &apos;s appointment will be marked Cancelled and excluded from future
            reminder runs.
          </>
        }
        confirmLabel="Mark as Cancelled"
        destructive
        loading={updateAppointment.isPending}
        onConfirm={handleCancel}
      />
    </>
  )
}
