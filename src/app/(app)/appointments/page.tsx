"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowDownAZIcon, ArrowUpAZIcon, PlusIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/shared/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AppointmentFilters,
  type AppointmentFilterState,
} from "@/components/appointments/appointment-filters"
import { AppointmentsTable } from "@/components/appointments/appointments-table"
import { useAppointments } from "@/hooks/use-appointments"
import type { Appointment, AppointmentListParams } from "@/types/appointment"

const SORT_OPTIONS: { value: keyof Appointment; label: string }[] = [
  { value: "appointment_date", label: "Date" },
  { value: "patient_first_name", label: "Patient name" },
  { value: "status", label: "Status" },
  { value: "clinician", label: "Clinician" },
]

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AppointmentsPageContent />
    </Suspense>
  )
}

function AppointmentsPageContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = React.useState<AppointmentFilterState>({
    q: searchParams.get("q") ?? "",
    status: "all",
    channel: "all",
    reminderStatus: "all",
  })
  const [sortBy, setSortBy] = React.useState<keyof Appointment>("appointment_date")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)
  const pageSize = 15

  function updateFilters(next: AppointmentFilterState) {
    setFilters(next)
    setPage(1)
  }
  function updateSortBy(next: keyof Appointment) {
    setSortBy(next)
    setPage(1)
  }
  function toggleSortDir() {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    setPage(1)
  }

  const params: AppointmentListParams = {
    q: filters.q || undefined,
    status: filters.status !== "all" ? (filters.status as Appointment["status"]) : undefined,
    channel:
      filters.channel !== "all" ? (filters.channel as Appointment["preferred_channel"]) : undefined,
    reminderStatus:
      filters.reminderStatus !== "all"
        ? (filters.reminderStatus as "sent" | "pending")
        : undefined,
    sortBy,
    sortDir,
    page,
    pageSize,
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useAppointments(params)
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Search, filter, and manage every appointment on file."
        actions={
          <LinkButton href="/appointments/new">
            <PlusIcon className="size-4" /> Add Appointment
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <AppointmentFilters value={filters} onChange={updateFilters} />
        <div className="flex items-center gap-2">
          <Select
            items={Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, `Sort: ${o.label}`]))}
            value={sortBy}
            onValueChange={(v) => updateSortBy((v ?? "appointment_date") as keyof Appointment)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label={sortDir === "asc" ? "Sort ascending" : "Sort descending"}
            onClick={toggleSortDir}
          >
            {sortDir === "asc" ? (
              <ArrowUpAZIcon className="size-4" />
            ) : (
              <ArrowDownAZIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load appointments."}
          onRetry={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <AppointmentsTable appointments={data.items} />
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {data.total} appointment{data.total === 1 ? "" : "s"}
              {isFetching && " · refreshing…"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
