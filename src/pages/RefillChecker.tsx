import { useMemo, useState } from "react"
import { CalendarClock } from "lucide-react"
import { ToolPageShell } from "@/components/tool/tool-page-shell"
import { ResultPanel } from "@/components/tool/result-panel"
import { MethodologyBlock } from "@/components/tool/methodology-block"
import { SafetyNote } from "@/components/tool/safety-note"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getToolBySlug } from "@/data/tools"

const meta = getToolBySlug("refill-checker")!

const EARLY_REFILL_WINDOW_DAYS = 7
const RENEWAL_INTERVAL_DAYS = 365

function daysFromNow(dateStr: string) {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export function RefillCheckerPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [lastFillDate, setLastFillDate] = useState(today)
  const [daysSupply, setDaysSupply] = useState("30")
  const [refillsRemaining, setRefillsRemaining] = useState("1")
  const [lastReviewDate, setLastReviewDate] = useState(today)

  const outcome = useMemo(() => {
    if (!lastFillDate || !lastReviewDate) return null

    const supply = parseInt(daysSupply, 10)
    const refillEligibleDate = addDays(lastFillDate, supply - EARLY_REFILL_WINDOW_DAYS)
    const renewalDueDate = addDays(lastReviewDate, RENEWAL_INTERVAL_DAYS)

    const daysToRefillEligible = daysFromNow(refillEligibleDate.toISOString().slice(0, 10))
    const daysToRenewalDue = daysFromNow(renewalDueDate.toISOString().slice(0, 10))

    const noRefillsLeft = refillsRemaining === "0"
    const renewalOverdue = daysToRenewalDue <= 0

    if (noRefillsLeft) {
      return {
        tone: "caution" as const,
        headline: "You'll need a renewal, not a refill",
        detail: "There are no refills left on file. A new clinical review is required before your next fill can be authorized.",
      }
    }

    if (renewalOverdue) {
      return {
        tone: "caution" as const,
        headline: "Your annual clinical review is due",
        detail: `Even though refills remain, your last clinical review was more than a year ago (due ${formatDate(
          renewalDueDate
        )}). A renewal review is needed before your next fill.`,
      }
    }

    if (daysToRefillEligible <= 0) {
      return {
        tone: "positive" as const,
        headline: "You can request a refill now",
        detail: `Your refill window opened ${formatDate(refillEligibleDate)}.`,
      }
    }

    return {
      tone: "neutral" as const,
      headline: `Refill opens ${formatDate(refillEligibleDate)}`,
      detail: `That's in ${daysToRefillEligible} day${daysToRefillEligible === 1 ? "" : "s"}, based on a ${EARLY_REFILL_WINDOW_DAYS}-day early-refill window.`,
    }
  }, [lastFillDate, daysSupply, refillsRemaining, lastReviewDate])

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
              <CalendarClock className="h-5 w-5 text-primary" />
              Check your refill status
            </CardTitle>
            <CardDescription>Non-controlled medications only.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="last-fill">Last fill date</Label>
                <Input
                  id="last-fill"
                  type="date"
                  value={lastFillDate}
                  onChange={(e) => setLastFillDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Days supply</Label>
                <Select value={daysSupply} onValueChange={setDaysSupply}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Refills remaining on file</Label>
                <Select value={refillsRemaining} onValueChange={setRefillsRemaining}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (none left)</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3 or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last-review">Last clinical review date</Label>
                <Input
                  id="last-review"
                  type="date"
                  value={lastReviewDate}
                  onChange={(e) => setLastReviewDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The date a prescriber last reviewed and authorized this prescription — not
                  necessarily your last pickup.
                </p>
              </div>
            </div>

            {outcome && (
              <ResultPanel eyebrow="Your status" headline={outcome.headline} detail={outcome.detail} tone={outcome.tone} />
            )}
          </CardContent>
        </Card>
      }
      supportingContent={
        <>
          <SafetyNote title="Refills vs. renewals" variant="default">
            A refill gives you more of an already authorized prescription. A renewal needs a new
            review from your prescriber. A renewal can happen for three reasons: your refills ran
            out, enough time has passed, or your prescriber set a review requirement. This tool
            covers non-controlled medications only. This tool does not send a refill request. This
            tool estimates timing only.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation={`This tool calculates your refill-eligible date like this: last fill date, plus days of supply, minus a ${EARLY_REFILL_WINDOW_DAYS}-day early-refill window. This tool calculates your renewal due date like this: last clinical review date, plus ${RENEWAL_INTERVAL_DAYS} days. This tool shows a renewal message if you have 0 refills remaining. This tool also shows a renewal message if the renewal due date has passed. This happens even if the refill-eligible date has not arrived.`}
            dataSource="This tool uses a common early-refill window. This tool uses a 12-month interval for clinical review. These values match typical practice for non-controlled prescriptions. This is a general model. This is not Temi's specific pharmacy policy or clinical policy."
            limitations="This tool does not check your pharmacy's fill history. This tool does not check insurance refill-too-soon rules. This tool does not check a manual hold from your prescriber."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              The distinction people actually get stuck on
            </h2>
            <p className="mb-3">
              Many people ask questions about refill timing. Few tools answer these questions
              well. Most confusion is not about refill availability. Most confusion is about the
              difference between a refill and a renewal. A renewal needs a new clinical review. A
              renewal can happen because refills ran out. A renewal can happen because time has
              passed since the last review. Both reasons can apply at the same time.
            </p>
            <p>
              This tool answers that question in plain terms. This tool helps you avoid a surprise
              at the pharmacy counter. Without this tool, you might expect a refill but need a
              renewal instead. For this reason, this tool's result states which one applies. This
              tool's result does not show only a date.
            </p>
          </div>
        </>
      }
    />
  )
}
