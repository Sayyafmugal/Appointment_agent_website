"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AppointmentForm,
  type AppointmentFormValues,
} from "@/components/appointments/appointment-form"
import { useAppointment, useUpdateAppointment } from "@/hooks/use-appointments"

export default function EditAppointmentPage() {
  const params = useParams<{ id: string }>()
  const id = decodeURIComponent(params.id)
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useAppointment(id)
  const updateAppointment = useUpdateAppointment()

  async function handleSubmit(values: AppointmentFormValues) {
    try {
      await updateAppointment.mutateAsync({ id, patch: values })
      toast.success("Appointment updated successfully.")
      router.push(`/appointments/${encodeURIComponent(id)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update appointment.")
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Edit Appointment" description={id} />

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load appointment."}
          onRetry={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <AppointmentForm
          defaultValues={data}
          onSubmit={handleSubmit}
          submitting={updateAppointment.isPending}
          submitLabel="Save Changes"
        />
      )}
    </div>
  )
}
