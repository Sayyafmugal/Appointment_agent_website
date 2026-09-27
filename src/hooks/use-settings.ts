"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPut } from "@/lib/api-client"
import type { SettingsResponse, SoftSettings } from "@/types/settings"

const KEY = "settings"

export function useSettings() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiGet<SettingsResponse>("/api/settings"),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<SoftSettings>) =>
      apiPut<SoftSettings>("/api/settings", patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
  })
}
