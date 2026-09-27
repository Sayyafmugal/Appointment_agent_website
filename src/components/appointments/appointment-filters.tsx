"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { APPOINTMENT_STATUSES, PREFERRED_CHANNELS } from "@/lib/constants"

export interface AppointmentFilterState {
  q: string
  status: string
  channel: string
  reminderStatus: string
}

export function AppointmentFilters({
  value,
  onChange,
}: {
  value: AppointmentFilterState
  onChange: (next: AppointmentFilterState) => void
}) {
  const hasFilters =
    value.q || value.status !== "all" || value.channel !== "all" || value.reminderStatus !== "all"

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="Search name, ID, email, phone…"
          className="pl-8"
          aria-label="Search appointments"
        />
      </div>

      <Select
        items={{
          all: "All statuses",
          ...Object.fromEntries(APPOINTMENT_STATUSES.map((s) => [s, s])),
        }}
        value={value.status}
        onValueChange={(v) => onChange({ ...value, status: v ?? "all" })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {APPOINTMENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={{ all: "All channels", sms: "SMS", email: "Email" }}
        value={value.channel}
        onValueChange={(v) => onChange({ ...value, channel: v ?? "all" })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Channel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All channels</SelectItem>
          {PREFERRED_CHANNELS.map((c) => (
            <SelectItem key={c} value={c}>
              {c === "sms" ? "SMS" : "Email"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={{ all: "All reminder statuses", sent: "Sent", pending: "Pending" }}
        value={value.reminderStatus}
        onValueChange={(v) => onChange({ ...value, reminderStatus: v ?? "all" })}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Reminder status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reminder statuses</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ q: "", status: "all", channel: "all", reminderStatus: "all" })}
        >
          <XIcon className="size-3.5" /> Clear
        </Button>
      )}
    </div>
  )
}
