import "server-only"
import { DateTime } from "luxon"
import { CLINIC_TZ } from "@/lib/constants"
import type { Appointment, AppointmentStatus, PreferredChannel } from "@/types/appointment"
import type { ExceptionRecord } from "@/types/exception"
import type { ActivityRun } from "@/types/activity"

/**
 * Sample dataset for the public demo deployment (no Google Sheets
 * credentials configured). Modeled on a real run of this app's own
 * Appointments/Exceptions/Activity sheets. Dates are computed relative to
 * "today" at read time so the dashboard always looks current, instead of
 * baking in a fixed date that would drift into the past.
 */

function isoDate(offsetDays: number): string {
  return DateTime.now().setZone(CLINIC_TZ).plus({ days: offsetDays }).toFormat("yyyy-MM-dd")
}

function isoDateTime(offsetDays: number, time: string): string {
  return `${isoDate(offsetDays)} ${time}`
}

interface AppointmentSeed {
  appointment_id: string
  patient_first_name: string
  patient_last_name: string
  phone_e164: string
  email: string
  appointment_time: string
  clinician: string
  location: string
  status: AppointmentStatus
  preferred_channel: PreferredChannel
  consent_sms: boolean
  consent_email: boolean
  reminder_sent: boolean
  reminder_channel: "" | "sms" | "email"
}

const APPOINTMENT_SEEDS: AppointmentSeed[] = [
  {
    appointment_id: "A-1001",
    patient_first_name: "Aisha",
    patient_last_name: "Khan",
    phone_e164: "+923001234567",
    email: "aisha.khan@example.com",
    appointment_time: "14:30",
    clinician: "Dr. Ahmed",
    location: "Lahore Clinic",
    status: "Scheduled",
    preferred_channel: "sms",
    consent_sms: true,
    consent_email: false,
    reminder_sent: true,
    reminder_channel: "sms",
  },
  {
    appointment_id: "A-1002",
    patient_first_name: "Bilal",
    patient_last_name: "Ahmed",
    phone_e164: "+923019876543",
    email: "bilal.ahmed@example.com",
    appointment_time: "10:00",
    clinician: "Dr. Fatima",
    location: "Karachi Clinic",
    status: "Scheduled",
    preferred_channel: "email",
    consent_sms: false,
    consent_email: true,
    reminder_sent: true,
    reminder_channel: "email",
  },
  {
    appointment_id: "A-1003",
    patient_first_name: "Zainab",
    patient_last_name: "Malik",
    phone_e164: "+923025551234",
    email: "zainab.m@example.com",
    appointment_time: "11:15",
    clinician: "Dr. Ahmed",
    location: "Lahore Clinic",
    status: "Completed",
    preferred_channel: "sms",
    consent_sms: true,
    consent_email: false,
    reminder_sent: false,
    reminder_channel: "",
  },
  {
    appointment_id: "A-1004",
    patient_first_name: "Omar",
    patient_last_name: "Farooq",
    phone_e164: "",
    email: "",
    appointment_time: "16:00",
    clinician: "Dr. Raza",
    location: "Islamabad Clinic",
    status: "Scheduled",
    preferred_channel: "sms",
    consent_sms: false,
    consent_email: false,
    reminder_sent: false,
    reminder_channel: "",
  },
  {
    appointment_id: "A-1005",
    patient_first_name: "Sana",
    patient_last_name: "Tariq",
    phone_e164: "+923043332211",
    email: "sana.tariq@example.com",
    appointment_time: "09:30",
    clinician: "Dr. Fatima",
    location: "Karachi Clinic",
    status: "Scheduled",
    preferred_channel: "sms",
    consent_sms: true,
    consent_email: false,
    reminder_sent: true,
    reminder_channel: "sms",
  },
  {
    appointment_id: "A-1006",
    patient_first_name: "Usman",
    patient_last_name: "Ali",
    phone_e164: "+923057778899",
    email: "usman.ali@example.com",
    appointment_time: "15:45",
    clinician: "Dr. Raza",
    location: "Islamabad Clinic",
    status: "Scheduled",
    preferred_channel: "email",
    consent_sms: false,
    consent_email: true,
    reminder_sent: true,
    reminder_channel: "email",
  },
  {
    appointment_id: "A-1007",
    patient_first_name: "Mariam",
    patient_last_name: "Hassan",
    phone_e164: "",
    email: "",
    appointment_time: "12:00",
    clinician: "Dr. Ahmed",
    location: "Lahore Clinic",
    status: "Scheduled",
    preferred_channel: "sms",
    consent_sms: false,
    consent_email: false,
    reminder_sent: false,
    reminder_channel: "",
  },
  {
    appointment_id: "A-1008",
    patient_first_name: "Sayyaf",
    patient_last_name: "Afzaal",
    phone_e164: "323156974651",
    email: "sayyafmughal567@gmail.com",
    appointment_time: "13:00",
    clinician: "Dr. Raza",
    location: "Islamabad Clinic",
    status: "Scheduled",
    preferred_channel: "email",
    consent_sms: true,
    consent_email: true,
    reminder_sent: true,
    reminder_channel: "email",
  },
]

/** All demo appointments fall "today"; reminders for them went out "yesterday" evening. */
export function buildDemoAppointments(): Appointment[] {
  return APPOINTMENT_SEEDS.map((s) => ({
    appointment_id: s.appointment_id,
    patient_first_name: s.patient_first_name,
    patient_last_name: s.patient_last_name,
    phone_e164: s.phone_e164,
    email: s.email,
    appointment_date: isoDate(0),
    appointment_time: s.appointment_time,
    clinician: s.clinician,
    location: s.location,
    status: s.status,
    preferred_channel: s.preferred_channel,
    consent_sms: s.consent_sms,
    consent_email: s.consent_email,
    reminder_sent: s.reminder_sent,
    reminder_channel: s.reminder_channel,
    reminder_sent_at: s.reminder_sent ? isoDateTime(-1, "19:59") : "",
  }))
}

export function buildDemoExceptions(): ExceptionRecord[] {
  return [
    {
      run_date: isoDate(-1),
      appointment_id: "A-1004",
      appointment_date: isoDate(0),
      reason: "no_consent_on_file",
    },
    {
      run_date: isoDate(-1),
      appointment_id: "A-1007",
      appointment_date: isoDate(0),
      reason: "no_consent_on_file",
    },
  ]
}

export function buildDemoActivity(): ActivityRun[] {
  return [
    {
      run_date: isoDate(-1),
      target_date: isoDate(0),
      mode: "run",
      total: 2,
      sent: 2,
      skipped: 2,
      by_sms: 0,
      by_email: 0,
      status: "success",
    },
  ]
}
