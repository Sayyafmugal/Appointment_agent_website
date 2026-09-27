"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ZapIcon,
  MailIcon,
  MessageSquareIcon,
  TerminalIcon,
  CheckCircle2Icon,
  XCircleIcon,
  PlugZapIcon,
  SearchIcon,
  ShieldCheckIcon,
  FileTextIcon,
  SendIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Reveal } from "@/components/effects/reveal"
import { useCountUp } from "@/hooks/use-count-up"
import { useRunReminderAgent } from "@/hooks/use-reminders"
import type { RunSummary } from "@/types/reminder"

const STAGES: { label: string; icon: LucideIcon }[] = [
  { label: "Connecting to n8n webhook…", icon: PlugZapIcon },
  { label: "Scanning tomorrow's appointment queue…", icon: SearchIcon },
  { label: "Validating SMS & email consent…", icon: ShieldCheckIcon },
  { label: "Building message templates…", icon: FileTextIcon },
  { label: "Dispatching messages…", icon: SendIcon },
]

function buildDemoSummary(): RunSummary {
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return {
    run_date: fmt(today),
    target_date: fmt(tomorrow),
    total: 6,
    sent: 4,
    skipped: 2,
    by_sms: 2,
    by_email: 2,
  }
}

export function RunAgentButton({
  variant = "default",
}: {
  variant?: "default" | "secondary"
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [runningOpen, setRunningOpen] = React.useState(false)
  const [stageIndex, setStageIndex] = React.useState(0)
  const [failed, setFailed] = React.useState(false)
  const [result, setResult] = React.useState<RunSummary | null>(null)
  const [isDemo, setIsDemo] = React.useState(false)
  const runAgent = useRunReminderAgent()
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  function clearStageTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  React.useEffect(() => clearStageTimer, [])

  async function handleConfirm() {
    setConfirmOpen(false)
    setIsDemo(false)
    setFailed(false)
    setStageIndex(0)
    setRunningOpen(true)

    intervalRef.current = setInterval(() => {
      setStageIndex((i) => (i < STAGES.length - 1 ? i + 1 : i))
    }, 650)

    try {
      const summary = await runAgent.mutateAsync()
      clearStageTimer()
      setStageIndex(STAGES.length)
      await new Promise((resolve) => setTimeout(resolve, 600))
      setRunningOpen(false)
      setResult(summary)
      toast.success("Reminder Agent completed successfully.")
    } catch (error) {
      clearStageTimer()
      setFailed(true)
      await new Promise((resolve) => setTimeout(resolve, 700))
      setRunningOpen(false)
      toast.error(error instanceof Error ? error.message : "The reminder run failed.")
    }
  }

  async function handleDemo() {
    setIsDemo(true)
    setFailed(false)
    setStageIndex(0)
    setRunningOpen(true)

    intervalRef.current = setInterval(() => {
      setStageIndex((i) => (i < STAGES.length - 1 ? i + 1 : i))
    }, 650)

    await new Promise((resolve) => setTimeout(resolve, STAGES.length * 650 + 400))
    clearStageTimer()
    setStageIndex(STAGES.length)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setRunningOpen(false)
    setResult(buildDemoSummary())
    toast.success("Demo run finished — no real messages were sent.")
  }

  const progressPercent = Math.round((Math.min(stageIndex, STAGES.length) / STAGES.length) * 100)
  const isComplete = !failed && stageIndex >= STAGES.length

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={variant}
          onClick={() => setConfirmOpen(true)}
          className="relative gap-2 overflow-visible"
        >
          <span className="bg-primary absolute -inset-0.5 -z-10 animate-pulse rounded-xl opacity-40 blur" />
          <ZapIcon className="size-4" />
          Run Reminder Agent
        </Button>
        <Button variant="outline" onClick={handleDemo} className="gap-2" title="Simulates a run locally, without calling n8n. Nothing real is sent.">
          <SparklesIcon className="size-4" />
          Demo Run
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run the reminder agent now?</AlertDialogTitle>
            <AlertDialogDescription>
              This calls the live n8n automation, which will check tomorrow&apos;s
              Scheduled appointments and send real SMS/email reminders to every
              patient who has valid consent and contact details on file. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
            >
              Yes, run it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={runningOpen} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false}>
        <div className="shimmer-card space-y-4 rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="relative inline-flex">
                <TerminalIcon className="node-pulse size-4 text-primary" />
              </span>
              n8n Execution Pipeline
              {isDemo && (
                <Badge variant="secondary" className="ml-auto">
                  Demo
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isDemo
                ? "Simulating a run locally — n8n is not being called."
                : "Automated reminder dispatch in progress…"}
            </DialogDescription>
          </DialogHeader>

          {/* Animated stage pipeline */}
          <div className="relative flex items-center justify-between px-1 pt-1 pb-3">
            <div className="bg-muted absolute top-1/2 right-6 left-6 h-1 -translate-y-1/2 overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-primary to-[var(--ticker-accent)] transition-all duration-500 ease-out",
                  !failed && stageIndex > 0 && "stage-spine-fill"
                )}
                style={{
                  width: failed
                    ? "100%"
                    : `${(Math.min(stageIndex, STAGES.length - 1) / (STAGES.length - 1)) * 100}%`,
                  backgroundColor: failed ? "var(--status-critical)" : undefined,
                }}
              />
            </div>
            {STAGES.map((stage, i) => {
              const state = failed && i === stageIndex ? "failed" : i < stageIndex || isComplete ? "done" : i === stageIndex ? "active" : "pending"
              const Icon = state === "done" ? CheckCircle2Icon : state === "failed" ? XCircleIcon : stage.icon
              return (
                <div
                  key={stage.label}
                  className="stage-node relative z-10 size-9 border-2 bg-[var(--card)]"
                  data-state={state}
                  style={{
                    borderColor:
                      state === "done"
                        ? "var(--status-good)"
                        : state === "failed"
                          ? "var(--status-critical)"
                          : state === "active"
                            ? "var(--primary)"
                            : "var(--border)",
                    color:
                      state === "done"
                        ? "var(--status-good)"
                        : state === "failed"
                          ? "var(--status-critical)"
                          : state === "active"
                            ? "var(--primary)"
                            : "var(--muted-foreground)",
                  }}
                >
                  <Icon className="size-4" />
                </div>
              )
            })}
          </div>

          <div
            className="custom-scroll relative h-40 overflow-y-auto rounded-lg p-3 font-mono text-xs"
            style={{ backgroundColor: "var(--ticker-bg)", color: "var(--ticker-fg)" }}
          >
            {!failed && !isComplete && <div className="terminal-scan-overlay" />}
            {STAGES.slice(0, stageIndex + 1).map((stage, i) => (
              <div key={stage.label} className="py-0.5">
                {i < stageIndex || (i === stageIndex && (result || failed || isComplete)) ? (
                  <span className="text-emerald-400">[OK] </span>
                ) : (
                  <span className="text-muted-foreground">[..] </span>
                )}
                {stage.label}
              </div>
            ))}
            {failed && <div className="py-0.5 text-rose-400">[FAIL] Run did not complete.</div>}
            {isComplete && <div className="py-0.5 text-emerald-400">[OK] Run complete.</div>}
          </div>

          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-primary to-[var(--ticker-accent)] transition-all duration-300"
              style={{
                width: `${failed ? 100 : progressPercent}%`,
                backgroundColor: failed ? "var(--status-critical)" : undefined,
              }}
            />
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!result} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="overflow-visible">
        <div className="shimmer-card space-y-4 overflow-visible rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <span className="relative inline-flex">
                <CheckCircle2Icon className="size-4 text-emerald-500" />
                <span className="success-ring-burst" />
              </span>
              Reminder Agent Completed
              {isDemo && (
                <Badge variant="secondary" className="ml-auto">
                  Demo
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isDemo
                ? "Simulated output — no real SMS/email was sent and nothing was written to the sheet."
                : `Run for ${result?.run_date} · appointments on ${result?.target_date}`}
            </DialogDescription>
          </DialogHeader>
          {result && <ResultSummary result={result} />}
          <DialogFooter>
            <Button onClick={() => setResult(null)}>Done</Button>
          </DialogFooter>
        </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ResultSummary({ result }: { result: RunSummary }) {
  const sent = useCountUp(result.sent)
  const total = useCountUp(result.total)
  const bySms = useCountUp(result.by_sms)
  const byEmail = useCountUp(result.by_email)
  const skipped = useCountUp(result.skipped)

  const successRate = result.total > 0 ? result.sent / result.total : 0
  const circumference = 2 * Math.PI * 42
  const dashOffset = circumference * (1 - successRate)

  return (
    <div className="space-y-4 py-1">
      <Reveal className="flex items-center gap-4 rounded-xl border p-4">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 100 100" className="size-24 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--status-good)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="count-ring"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{sent}</span>
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              sent
            </span>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Appointments checked</p>
          <p className="text-3xl font-semibold tabular-nums">{total}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {Math.round(successRate * 100)}% of eligible appointments reminded
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-3 gap-3">
        <Reveal delay={80}>
          <SummaryTile label="SMS" value={bySms} icon={<MessageSquareIcon className="size-3.5" />} />
        </Reveal>
        <Reveal delay={160}>
          <SummaryTile label="Email" value={byEmail} icon={<MailIcon className="size-3.5" />} />
        </Reveal>
        <Reveal delay={240}>
          <SummaryTile
            label="Skipped"
            value={skipped}
            tone={result.skipped > 0 ? "warning" : undefined}
          />
        </Reveal>
      </div>

      {result.skipped > 0 && (
        <Reveal delay={320}>
          <Link
            href="/exceptions"
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            View skipped appointments in Exceptions
            <ArrowUpRightIcon className="size-3" />
          </Link>
        </Reveal>
      )}
    </div>
  )
}

function SummaryTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon?: React.ReactNode
  tone?: "warning"
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "warning" && "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
