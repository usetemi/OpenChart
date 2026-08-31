import { useMemo, useState } from "react"
import { LineChart } from "lucide-react"
import { ToolPageShell } from "@/components/tool/tool-page-shell"
import { ResultPanel } from "@/components/tool/result-panel"
import { MethodologyBlock } from "@/components/tool/methodology-block"
import { SafetyNote } from "@/components/tool/safety-note"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getToolBySlug } from "@/data/tools"

const meta = getToolBySlug("titration-planner")!

type Medication = "semaglutide" | "tirzepatide"

type Step = { doseMg: number; weekStart: number; weekEnd: number | null; sideEffectNote: string }

const SCHEDULES: Record<Medication, Step[]> = {
  semaglutide: [
    { doseMg: 0.25, weekStart: 1, weekEnd: 4, sideEffectNote: "Introductory dose — not intended for weight-loss effect. Nausea and mild GI upset are most common here." },
    { doseMg: 0.5, weekStart: 5, weekEnd: 8, sideEffectNote: "GI side effects often ease as the body adjusts; some notice appetite changes starting here." },
    { doseMg: 1, weekStart: 9, weekEnd: 12, sideEffectNote: "A common step to plateau at longer if side effects are still settling." },
    { doseMg: 1.7, weekStart: 13, weekEnd: 16, sideEffectNote: "Some prescribers extend this step before the final increase." },
    { doseMg: 2.4, weekStart: 17, weekEnd: null, sideEffectNote: "Typical maintenance dose." },
  ],
  tirzepatide: [
    { doseMg: 2.5, weekStart: 1, weekEnd: 4, sideEffectNote: "Introductory dose — not intended for weight-loss effect." },
    { doseMg: 5, weekStart: 5, weekEnd: 8, sideEffectNote: "GI side effects (nausea, constipation, diarrhea) are most commonly reported around this step." },
    { doseMg: 7.5, weekStart: 9, weekEnd: 12, sideEffectNote: "A common step to plateau at longer if side effects are still settling." },
    { doseMg: 10, weekStart: 13, weekEnd: 16, sideEffectNote: "Many people see continued appetite changes here." },
    { doseMg: 12.5, weekStart: 17, weekEnd: 20, sideEffectNote: "Some prescribers extend this step before the final increase." },
    { doseMg: 15, weekStart: 21, weekEnd: null, sideEffectNote: "Typical maintenance dose." },
  ],
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function TitrationPlannerPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [medication, setMedication] = useState<Medication>("semaglutide")
  const [startDate, setStartDate] = useState(today)

  const schedule = SCHEDULES[medication]

  const rows = useMemo(() => {
    return schedule.map((step) => {
      const start = addDays(startDate, (step.weekStart - 1) * 7)
      const end = step.weekEnd ? addDays(startDate, step.weekEnd * 7 - 1) : null
      return { ...step, startDate: start, endDate: end }
    })
  }, [schedule, startDate])

  const currentStep = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return rows.find((r) => {
      const afterStart = now >= r.startDate
      const beforeEnd = !r.endDate || now <= r.endDate
      return afterStart && beforeEnd
    })
  }, [rows])

  return (
    <ToolPageShell
      icon={meta.icon}
      initiative={meta.initiative}
      name={meta.name}
      tagline={meta.description}
      tool={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5 text-primary" />
              Generate a reference calendar
            </CardTitle>
            <CardDescription>
              A general planning aid based on typical FDA-labeled steps — not a personalized
              prescription.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Medication</Label>
                <Select value={medication} onValueChange={(v) => setMedication(v as Medication)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semaglutide">Semaglutide</SelectItem>
                    <SelectItem value="tirzepatide">Tirzepatide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start-date">Week 1 start date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <ResultPanel
              eyebrow={currentStep ? "You'd be on step" : "Schedule generated"}
              headline={
                currentStep
                  ? `${currentStep.doseMg} mg once weekly`
                  : `${schedule.length}-step reference schedule ready below`
              }
              detail={
                currentStep
                  ? `Weeks ${currentStep.weekStart}${currentStep.weekEnd ? `–${currentStep.weekEnd}` : "+"}, based on the start date above.`
                  : undefined
              }
              tone={currentStep ? "positive" : "neutral"}
            />

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Weeks</th>
                    <th className="px-4 py-2 font-medium">Dates</th>
                    <th className="px-4 py-2 font-medium">Dose</th>
                    <th className="px-4 py-2 font-medium">What to expect</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isCurrent = currentStep === row
                    return (
                      <tr
                        key={row.weekStart}
                        className={cn("border-t border-border", isCurrent && "bg-accent/60")}
                      >
                        <td className="px-4 py-3 align-top font-medium">
                          {row.weekStart}
                          {row.weekEnd ? `–${row.weekEnd}` : "+"}
                          {isCurrent && (
                            <Badge className="ml-2 align-middle" variant="default">
                              Now
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground">
                          {formatDate(row.startDate)}
                          {row.endDate ? ` – ${formatDate(row.endDate)}` : " onward"}
                        </td>
                        <td className="px-4 py-3 align-top font-medium">{row.doseMg} mg</td>
                        <td className="px-4 py-3 align-top text-muted-foreground">
                          {row.sideEffectNote}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      }
      supportingContent={
        <>
          <SafetyNote title="A planning aid, not a prescribing instruction" variant="warning">
            This calendar shows typical, FDA-labeled dose-escalation steps for reference only. Your
            actual schedule is set by your prescriber and may be slower, faster, or different
            based on how you respond and any side effects you have. Never increase, decrease, or
            restart a dose based on this calendar alone — always follow your prescriber's specific
            instructions, and call them before making any change.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation="Each step's date range is calculated as (start date) + (week number − 1) × 7 days. Dose values and week counts follow the general escalation pattern published in FDA labeling for these medication classes."
            dataSource="Publicly available FDA prescribing information for semaglutide- and tirzepatide-class GLP-1 medications. Not connected to any individual's actual prescription or Temi's clinical system."
            limitations="Dose adjustments your prescriber makes for side effects, a slower or faster titration pace, treatment holds, or a different starting dose than the label default."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why a calendar, not just a dosing chart
            </h2>
            <p className="mb-3">
              Titration schedules are usually presented as a static table of doses and week
              numbers, which leaves the reader to do their own date math to figure out what
              applies to them right now. This tool does that math instead — enter when you started
              (or plan to start), and it maps the standard steps onto actual calendar dates,
              highlighting the step that lines up with today.
            </p>
            <p>
              It's deliberately conservative about what it claims. Titration paces vary — a
              prescriber may hold a dose longer if side effects haven't settled, or move faster if
              someone tolerates each step well. This calendar shows the label default, framed
              explicitly as a reference to bring to a prescriber conversation, not a plan to follow
              independently.
            </p>
          </div>
        </>
      }
    />
  )
}
