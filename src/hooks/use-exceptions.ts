"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api-client"
import type { ExceptionRecord } from "@/types/exception"

export function useExceptions() {
  return useQuery({
    queryKey: ["exceptions"],
    queryFn: () => apiGet<ExceptionRecord[]>("/api/exceptions"),
  })
}
