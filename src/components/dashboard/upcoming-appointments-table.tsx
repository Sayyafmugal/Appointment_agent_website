import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AppointmentStatusBadge,
  ChannelBadge,
  ReminderStatusBadge,
} from "@/components/shared/status-badges"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDateDisplay, formatTimeDisplay } from "@/lib/format"
import { CalendarClockIcon } from "lucide-react"
import type { Appointment } from "@/types/appointment"

export function UpcomingAppointmentsTable({ appointments }: { appointments: Appointment[] }) {
  return (
    <Card className="shimmer-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarClockIcon} title="No upcoming appointments found." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date &amp; time</TableHead>
                  <TableHead>Clinician</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reminder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.appointment_id}>
                    <TableCell>
                      <Link
                        href={`/appointments/${encodeURIComponent(a.appointment_id)}`}
                        className="font-medium hover:underline"
                      >
                        {a.patient_first_name} {a.patient_last_name}
                      </Link>
                      <p className="text-muted-foreground text-xs">{a.appointment_id}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateDisplay(a.appointment_date)}
                      <p className="text-muted-foreground text-xs">
                        {formatTimeDisplay(a.appointment_time)}
                      </p>
                    </TableCell>
                    <TableCell>{a.clinician}</TableCell>
                    <TableCell>
                      <ChannelBadge channel={a.preferred_channel} />
                    </TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell>
                      <ReminderStatusBadge
                        reminderSent={a.reminder_sent}
                        isScheduled={a.status === "Scheduled"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
