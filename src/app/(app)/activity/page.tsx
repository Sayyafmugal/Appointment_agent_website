"use client"

import * as React from "react"
import { HistoryIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDateDisplay } from "@/lib/format"
import { useActivity } from "@/hooks/use-activity"
import type { ActivityRun } from "@/types/activity"

const MODE_LABEL: Record<string, string> = {
  run: "Scheduled/Manual batch run",
  single: "Single reminder send",
  preview: "Preview",
}

export default function ActivityPage() {
  const { data, isLoading, isError, error, refetch } = useActivity()
  const [selected, setSelected] = React.useState<ActivityRun | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Execution history of the reminder automation, logged by n8n after every run."
      />

      {isError ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Could not load activity. Make sure the 'Activity' sheet tab exists."
          }
          onRetry={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : data.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No activity yet." description="Run the reminder agent to see execution history here." />
      ) : (
        <div className="shimmer-card overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Execution</TableHead>
                <TableHead>Appointments Checked</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>SMS</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Skipped</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((run, i) => (
                <TableRow
                  key={`${run.run_date}-${i}`}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelected(run)}
                >
                  <TableCell className="whitespace-nowrap">{run.run_date}</TableCell>
                  <TableCell>{MODE_LABEL[run.mode] ?? run.mode}</TableCell>
                  <TableCell>{run.total}</TableCell>
                  <TableCell>{run.sent}</TableCell>
                  <TableCell>{run.by_sms}</TableCell>
                  <TableCell>{run.by_email}</TableCell>
                  <TableCell>{run.skipped}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        run.status === "success"
                          ? "bg-status-good/10 text-status-good border-status-good/20"
                          : "bg-status-critical/10 text-status-critical border-status-critical/20"
                      }
                    >
                      {run.status === "success" ? "Success" : run.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Execution detail</SheetTitle>
            <SheetDescription>
              {selected && `Run ${selected.run_date} — appointments for ${formatDateDisplay(selected.target_date)}`}
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              <DetailTile label="Type" value={MODE_LABEL[selected.mode] ?? selected.mode} />
              <DetailTile label="Status" value={selected.status} />
              <DetailTile label="Checked" value={selected.total} />
              <DetailTile label="Sent" value={selected.sent} />
              <DetailTile label="SMS" value={selected.by_sms} />
              <DetailTile label="Email" value={selected.by_email} />
              <DetailTile label="Skipped" value={selected.skipped} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
