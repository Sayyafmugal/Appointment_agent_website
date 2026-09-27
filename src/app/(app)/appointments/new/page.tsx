"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import {
  AppointmentForm,
  type AppointmentFormValues,
} from "@/components/appointments/appointment-form"
import { useCreateAppointment } from "@/hooks/use-appointments"

export default function NewAppointmentPage() {
  const router = useRouter()
  const createAppointment = useCreateAppointment()

  async function handleSubmit(values: AppointmentFormValues) {
    try {
      const created = await createAppointment.mutateAsync(values)
      toast.success("Appointment created successfully.")
      router.push(`/appointments/${encodeURIComponent(created.appointment_id)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create appointment.")
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Add Appointment"
        description="Create a new appointment record in the Appointments sheet."
      />
      <AppointmentForm
        onSubmit={handleSubmit}
        submitting={createAppointment.isPending}
        submitLabel="Create Appointment"
      />
    </div>
  )
}
