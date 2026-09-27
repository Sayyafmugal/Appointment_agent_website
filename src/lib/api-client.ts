import type { ApiResponse } from "@/types/api"

export class ApiRequestError extends Error {}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  })

  let body: ApiResponse<T> | null = null
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch {
    throw new ApiRequestError("The server returned an unreadable response.")
  }

  if (!body || body.success !== true) {
    throw new ApiRequestError(
      body && "error" in body
        ? body.error.message
        : "Something went wrong. Please try again."
    )
  }

  return body.data
}

export function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "GET" })
}

export function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiPut<T>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" })
}
