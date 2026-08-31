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
            This calendar shows typical FDA-labeled dose steps. Use this calendar for reference
            only. Your prescriber sets your real schedule. Your real schedule can be slower,
            faster, or different from this calendar. Your response and your side effects can
            change your schedule. Do not increase, decrease, or restart a dose because of this
            calendar alone. Always follow your prescriber's specific instructions. Call your
            prescriber before you change your dose.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation="This tool calculates each step's date range like this: start date, plus the week number minus 1, multiplied by 7 days. The dose values and week counts follow the general pattern in FDA labeling for these medication classes."
            dataSource="This tool uses public FDA prescribing information for semaglutide and tirzepatide medications. This tool is not connected to your real prescription. This tool is not connected to Temi's clinical system."
            limitations="This tool does not include dose changes your prescriber makes for side effects. This tool does not include a slower or faster schedule. This tool does not include a treatment hold. This tool does not include a different starting dose."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why a calendar, not just a dosing chart
            </h2>
            <p className="mb-3">
              A titration schedule is usually a table of doses and week numbers. A reader must
              calculate the correct dates alone. This tool calculates the dates for you. Enter
              your start date, or your planned start date. This tool maps the standard steps to
              real calendar dates. This tool highlights the step for today's date.
            </p>
            <p>
              This tool makes limited claims on purpose. Titration pace can vary between patients.
              A prescriber can hold a dose longer if side effects continue. A prescriber can move
              faster if a patient tolerates each step well. This calendar shows the default
              schedule from the product label. Use this calendar as a reference for a conversation
              with your prescriber. Do not use this calendar as an independent treatment plan.
            </p>
          </div>
        </>
      }
    />
  )
}
