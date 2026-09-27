"use client"

import * as React from "react"
import { AlertTriangleIcon, WrenchIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { LinkButton } from "@/components/shared/link-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SkipReasonBadge } from "@/components/shared/status-badges"
import { formatDateDisplay } from "@/lib/format"
import { useExceptions } from "@/hooks/use-exceptions"
import { useAppointments } from "@/hooks/use-appointments"

export default function ExceptionsPage() {
  const exceptions = useExceptions()
  const appointments = useAppointments({ pageSize: 500 })

  const nameByAppointmentId = React.useMemo(() => {
    const map = new Map<string, string>()
    appointments.data?.items.forEach((a) => {
      map.set(a.appointment_id, `${a.patient_first_name} ${a.patient_last_name}`.trim())
    })
    return map
  }, [appointments.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exceptions"
        description="Appointments the automation could not remind, and why — logged by n8n."
      />

      {exceptions.isError ? (
        <ErrorState
          message={
            exceptions.error instanceof Error
              ? exceptions.error.message
              : "Could not load exceptions."
          }
          onRetry={() => exceptions.refetch()}
        />
      ) : exceptions.isLoading || !exceptions.data ? (
        <Skeleton className="h-96 w-full" />
      ) : exceptions.data.length === 0 ? (
        <EmptyState
          icon={AlertTriangleIcon}
          title="No skipped appointments."
          description="Every reminder has either been sent or is still pending — nothing needs attention."
        />
      ) : (
        <div className="shimmer-card overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Appointment ID</TableHead>
                <TableHead>Appointment Date</TableHead>
                <TableHead>Run Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.data.map((ex, i) => (
                <TableRow key={`${ex.appointment_id}-${ex.run_date}-${i}`}>
                  <TableCell className="font-medium">
                    {nameByAppointmentId.get(ex.appointment_id) || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {ex.appointment_id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {ex.appointment_date ? formatDateDisplay(ex.appointment_date) : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{ex.run_date}</TableCell>
                  <TableCell>
                    <SkipReasonBadge reason={ex.reason} />
                  </TableCell>
                  <TableCell className="text-right">
                    <LinkButton
                      variant="outline"
                      size="sm"
                      href={`/appointments/${encodeURIComponent(ex.appointment_id)}/edit`}
                    >
                      <WrenchIcon className="size-3.5" /> Fix Appointment
                    </LinkButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
