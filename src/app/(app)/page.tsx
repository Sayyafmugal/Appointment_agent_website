"use client"

import * as React from "react"
import Link from "next/link"
import {
  BrainIcon,
  CalendarDaysIcon,
  ClockIcon,
  FileTextIcon,
  SendIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Reveal } from "@/components/effects/reveal"
import { cn } from "cn"

const FEATURES = [
  {
    icon: ClockIcon,
    title: "Automated Execution",
    description: "Scheduled daily runs inspect upcoming appointment queues automatically.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Consent Validation",
    description: "Strict verification of SMS & email consent preferences before dispatch.",
  },
  {
    icon: FileTextIcon,
    title: "Audit Trail Logging",
    description:
      "Full history logging for skipped records, exceptions, and delivered messages.",
  },
]

const PIPELINE = [
  {
    icon: CalendarDaysIcon,
    title: "1. Calendar Sync",
    description: "Target Queue Polling",
    color: "text-primary",
  },
  {
    icon: BrainIcon,
    title: "2. n8n Validation",
    description: "Consent & Rules Check",
    color: "text-[var(--ticker-accent)]",
    highlighted: true,
  },
  {
    icon: SendIcon,
    title: "3. Dispatch",
    description: "SMS & Email Delivery",
    color: "text-emerald-500",
  },
]

export default function OverviewPage() {
  return (
    <div className="space-y-10 py-2">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-xs font-bold">
          <span className="relative flex size-2">
            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-primary relative inline-flex size-2 rounded-full" />
          </span>
          Live n8n Automation SaaS
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Appointment reminders that{" "}
          <span className="bg-gradient-to-r from-primary to-[var(--ticker-accent)] bg-clip-text text-transparent">
            actually get sent
          </span>
          .
        </h1>
        <p className="text-muted-foreground mt-5 text-sm text-balance sm:text-base">
          A high-precision management dashboard for Your Clinic Agent&apos;s SMS &amp;
          email reminder automation — built on Next.js and live n8n workflows.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
            Open Operational Dashboard
          </Link>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <Card className="shimmer-card mx-auto max-w-4xl p-6">
          <CardContent className="px-0">
            <h3 className="text-muted-foreground mb-6 text-center font-mono text-xs uppercase tracking-wider">
              Live Automated Pipeline Simulation
            </h3>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              {PIPELINE.map((step, i) => (
                <React.Fragment key={step.title}>
                  {i > 0 && (
                    <svg
                      className="text-primary/50 hidden h-6 w-10 shrink-0 sm:block"
                      viewBox="0 0 50 20"
                      fill="none"
                    >
                      <path d="M0 10H50" stroke="currentColor" strokeWidth="2" className="signal-wave" />
                    </svg>
                  )}
                  <div
                    className={cn(
                      "bg-muted/60 flex w-full flex-col items-center gap-1 rounded-xl p-3 text-center sm:w-1/3",
                      step.highlighted && "border-primary/30 border"
                    )}
                  >
                    <step.icon className={cn("node-pulse size-6", step.color)} />
                    <span className="text-sm font-bold">{step.title}</span>
                    <span className="text-muted-foreground text-[11px]">{step.description}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <Card className="shimmer-card h-full">
              <CardContent className="space-y-2">
                <f.icon className="node-pulse text-primary size-5" />
                <p className="font-bold">{f.title}</p>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
