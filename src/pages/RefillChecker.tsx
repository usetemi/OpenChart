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
            A refill dispenses more of a prescription that's already been authorized. A renewal
            means a prescriber needs to review your case again before authorizing more — because
            your refills ran out, because enough time has passed, or because your prescriber set
            it that way. This tool only covers non-controlled medications and does not submit any
            refill request; it estimates timing so you know what to expect.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation={`Refill-eligible date = last fill date + days supply − a ${EARLY_REFILL_WINDOW_DAYS}-day early-refill window. Renewal due date = last clinical review date + ${RENEWAL_INTERVAL_DAYS} days. If refills remaining is 0, or the renewal due date has passed, a renewal is shown regardless of the refill-eligible date.`}
            dataSource="A representative early-refill window and a 12-month clinical review interval, consistent with typical non-controlled prescription practice. This is a general model, not Temi's specific pharmacy or clinical policy configuration."
            limitations="Your specific pharmacy's fill history, insurance-driven refill-too-soon rules, and any manual hold a prescriber has placed on your prescription."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              The distinction people actually get stuck on
            </h2>
            <p className="mb-3">
              Refill timing questions are a real, currently under-served demand pool, distinct
              from GLP-1 questions and far less competitive. Most of the confusion isn't about
              whether a refill is possible — it's about whether what's needed is a refill at all,
              or a renewal: a new clinical review because refills ran out, because enough time has
              passed since the prescriber last looked at the case, or both at once.
            </p>
            <p>
              This tool exists to answer that specific question plainly, before someone finds out
              the hard way at the pharmacy counter that a "refill" they expected actually requires
              a clinical review first — which is also why the result leads with which one applies,
              not just a date.
            </p>
          </div>
        </>
      }
    />
  )
}
