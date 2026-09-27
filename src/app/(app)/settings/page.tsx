"use client"

import * as React from "react"
import { toast } from "sonner"
import { InfoIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSettings, useUpdateSettings } from "@/hooks/use-settings"
import type { SettingsResponse, SoftSettings } from "@/types/settings"

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useSettings()

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Clinic configuration and website preferences." />

      {isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load settings."}
          onRetry={() => refetch()}
        />
      ) : isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <SettingsSections data={data} />
      )}
    </div>
  )
}

function SettingsSections({ data }: { data: SettingsResponse }) {
  const updateSettings = useUpdateSettings()
  const [form, setForm] = React.useState<Omit<SoftSettings, "updated_at">>({
    default_lead_days: data.default_lead_days,
    clinic_display_name: data.clinic_display_name,
    clinic_phone: data.clinic_phone,
    clinic_timezone: data.clinic_timezone,
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateSettings.mutateAsync(form)
      toast.success("Website preferences saved.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings.")
    }
  }

  const leadDaysDiffer = form.default_lead_days !== data.clinic_config.lead_days

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinic Configuration</CardTitle>
          <CardDescription>
            Read-only. These values come from the n8n automation&apos;s environment
            and the &ldquo;Build Reminder Queue&rdquo; Code node — the website cannot
            read or write n8n&apos;s configuration directly. Update them there if
            they change.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Clinic name" value={data.clinic_config.clinic_name} />
          <ReadOnlyField label="Phone" value={data.clinic_config.clinic_phone} />
          <ReadOnlyField label="Timezone" value={data.clinic_config.clinic_timezone} />
          <ReadOnlyField
            label="Reminder lead time"
            value={`${data.clinic_config.lead_days} day${data.clinic_config.lead_days === 1 ? "" : "s"}`}
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Website Preferences</CardTitle>
            <CardDescription>
              Editable. Only affects how this website displays and previews
              data — never writes to n8n or Google Sheets automation settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clinic_display_name">Clinic display name</Label>
              <Input
                id="clinic_display_name"
                value={form.clinic_display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clinic_display_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clinic_phone">Phone</Label>
              <Input
                id="clinic_phone"
                value={form.clinic_phone}
                onChange={(e) => setForm((f) => ({ ...f, clinic_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clinic_timezone">Timezone</Label>
              <Input
                id="clinic_timezone"
                value={form.clinic_timezone}
                onChange={(e) => setForm((f) => ({ ...f, clinic_timezone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default_lead_days">Reminder lead time (days)</Label>
              <Input
                id="default_lead_days"
                type="number"
                min={0}
                max={30}
                value={form.default_lead_days}
                onChange={(e) =>
                  setForm((f) => ({ ...f, default_lead_days: Number(e.target.value) }))
                }
              />
            </div>
            {leadDaysDiffer && (
              <div className="text-muted-foreground bg-muted flex items-start gap-2 rounded-md p-3 text-xs sm:col-span-2">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                This differs from the automation&apos;s actual lead time (
                {data.clinic_config.lead_days} day
                {data.clinic_config.lead_days === 1 ? "" : "s"}, shown above) — the
                Reminders Center&apos;s queue preview below may not match what the
                9am run actually processes.
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <SaveIcon className="size-4" /> Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
