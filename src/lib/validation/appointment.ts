import { z } from "zod"
import { APPOINTMENT_STATUSES, E164_REGEX, EMAIL_REGEX, PREFERRED_CHANNELS } from "@/lib/constants"

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const baseFields = {
  appointment_id: z.string().trim().min(1).optional(),
  patient_first_name: z.string().trim().min(1, "First name is required"),
  patient_last_name: z.string().trim().min(1, "Last name is required"),
  phone_e164: z
    .string()
    .trim()
    .regex(E164_REGEX, "Phone must be in E.164 format, e.g. +923001234567"),
  email: z.string().trim().regex(EMAIL_REGEX, "Enter a valid email address"),
  appointment_date: z
    .string()
    .regex(DATE_REGEX, "Use yyyy-MM-dd")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date"),
  appointment_time: z.string().regex(TIME_REGEX, "Use 24-hour HH:mm"),
  clinician: z.string().trim().min(1, "Clinician is required"),
  location: z.string().trim().min(1, "Location is required"),
  status: z.enum(APPOINTMENT_STATUSES),
  preferred_channel: z.enum(PREFERRED_CHANNELS),
  consent_sms: z.boolean(),
  consent_email: z.boolean(),
}

export const appointmentCreateSchema = z.object(baseFields)
export type AppointmentCreateSchema = z.infer<typeof appointmentCreateSchema>

export const appointmentUpdateSchema = z.object(baseFields).partial()
export type AppointmentUpdateSchema = z.infer<typeof appointmentUpdateSchema>
