"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import type { ActivityRun } from "@/types/activity"

export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: () => apiGet<ActivityRun[]>("/api/activity"),
  })
}
