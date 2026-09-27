"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { APPOINTMENT_STATUSES, PREFERRED_CHANNELS } from "@/lib/constants"
import {
  appointmentCreateSchema,
  type AppointmentCreateSchema,
} from "@/lib/validation/appointment"

export type AppointmentFormValues = AppointmentCreateSchema

const DEFAULTS: AppointmentFormValues = {
  patient_first_name: "",
  patient_last_name: "",
  phone_e164: "",
  email: "",
  appointment_date: "",
  appointment_time: "",
  clinician: "",
  location: "",
  status: "Scheduled",
  preferred_channel: "sms",
  consent_sms: false,
  consent_email: false,
}

export function AppointmentForm({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel = "Save Appointment",
}: {
  defaultValues?: Partial<AppointmentFormValues>
  onSubmit: (values: AppointmentFormValues) => void
  submitting?: boolean
  submitLabel?: string
}) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentCreateSchema),
    defaultValues: { ...DEFAULTS, ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="patient_first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient first name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ayesha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patient_last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Kamal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_e164"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+923001234567" {...field} />
                  </FormControl>
                  <FormDescription>E.164 format: + country code, no spaces.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ayesha@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointment_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinician"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinician</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr Malik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Clinic A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    items={Object.fromEntries(APPOINTMENT_STATUSES.map((s) => [s, s]))}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? "")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPOINTMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferred_channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred channel</FormLabel>
                  <Select
                    items={{ sms: "SMS", email: "Email" }}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v ?? "")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREFERRED_CHANNELS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c === "sms" ? "SMS" : "Email"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent_sms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>SMS consent</FormLabel>
                    <FormDescription>Patient agreed to receive SMS reminders.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consent_email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Email consent</FormLabel>
                    <FormDescription>Patient agreed to receive email reminders.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <SaveIcon className="size-4" /> {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
