"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api-client"
import type { ReminderPreview, ReminderStats, RunSummary } from "@/types/reminder"

const KEY = "reminders"

export function useReminderStats() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: () => apiGet<ReminderStats>("/api/reminders/stats"),
  })
}

export function useReminderPreview(appointmentId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "preview", appointmentId],
    queryFn: () =>
      apiGet<ReminderPreview>(
        `/api/reminders/${encodeURIComponent(appointmentId!)}/preview`
      ),
    enabled: !!appointmentId,
    retry: false,
    staleTime: 0,
  })
}

function useInvalidateAfterRun() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] })
    queryClient.invalidateQueries({ queryKey: [KEY] })
    queryClient.invalidateQueries({ queryKey: ["exceptions"] })
    queryClient.invalidateQueries({ queryKey: ["activity"] })
  }
}

export function useRunReminderAgent() {
  const invalidate = useInvalidateAfterRun()
  return useMutation({
    mutationFn: () => apiPost<RunSummary>("/api/reminders/run"),
    onSuccess: invalidate,
  })
}

export function useSendReminder() {
  const invalidate = useInvalidateAfterRun()
  return useMutation({
    mutationFn: (appointmentId: string) =>
      apiPost<RunSummary>(`/api/reminders/${encodeURIComponent(appointmentId)}/send`),
    onSuccess: invalidate,
  })
}
