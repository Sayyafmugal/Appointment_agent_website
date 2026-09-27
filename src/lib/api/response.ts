import type { ApiFailure, ApiSuccess } from "@/types/api"

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function ok<T>(data: T, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data }
  return Response.json(body, { status })
}

export function fail(message: string, status = 400): Response {
  const body: ApiFailure = { success: false, error: { message } }
  return Response.json(body, { status })
}
