export interface SoftSettings {
  default_lead_days: number
  clinic_display_name: string
  clinic_phone: string
  clinic_timezone: string
  updated_at: string
}

export interface ClinicConfig {
  clinic_name: string
  clinic_phone: string
  clinic_timezone: string
  lead_days: number
}

export interface SettingsResponse extends SoftSettings {
  clinic_config: ClinicConfig
}
