"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client"
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentListParams,
  AppointmentListResult,
  AppointmentUpdateInput,
} from "@/types/appointment"

const KEY = "appointments"

function listUrl(params: AppointmentListParams): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set("q", params.q)
  if (params.status) sp.set("status", params.status)
  if (params.channel) sp.set("channel", params.channel)
  if (params.reminderStatus) sp.set("reminderStatus", params.reminderStatus)
  if (params.sortBy) sp.set("sortBy", params.sortBy)
  if (params.sortDir) sp.set("sortDir", params.sortDir)
  sp.set("page", String(params.page ?? 1))
  sp.set("pageSize", String(params.pageSize ?? 20))
  return `/api/appointments?${sp.toString()}`
}

export function useAppointments(params: AppointmentListParams) {
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => apiGet<AppointmentListResult>(listUrl(params)),
    placeholderData: (prev) => prev,
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => apiGet<Appointment>(`/api/appointments/${encodeURIComponent(id!)}`),
    enabled: !!id,
  })
}

function useInvalidateAppointments() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: [KEY] })
    queryClient.invalidateQueries({ queryKey: ["reminders"] })
    queryClient.invalidateQueries({ queryKey: ["exceptions"] })
  }
}

export function useCreateAppointment() {
  const invalidate = useInvalidateAppointments()
  return useMutation({
    mutationFn: (input: AppointmentCreateInput) =>
      apiPost<Appointment>("/api/appointments", input),
    onSuccess: invalidate,
  })
}

export function useUpdateAppointment() {
  const invalidate = useInvalidateAppointments()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AppointmentUpdateInput }) =>
      apiPut<Appointment>(`/api/appointments/${encodeURIComponent(id)}`, patch),
    onSuccess: invalidate,
  })
}

export function useDeleteAppointment() {
  const invalidate = useInvalidateAppointments()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<{ deleted: true }>(`/api/appointments/${encodeURIComponent(id)}`),
    onSuccess: invalidate,
  })
}
