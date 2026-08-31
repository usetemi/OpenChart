import { useMemo, useState } from "react"
import { ClipboardCheck } from "lucide-react"
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

const meta = getToolBySlug("eligibility-checker")!

// Illustrative sample only — not Temi's live service-area list. A production build
// would read this from Temi's own /states availability service.
const SAMPLE_SERVED_STATES = [
  "California",
  "Texas",
  "Florida",
  "New York",
  "Illinois",
  "Pennsylvania",
  "Ohio",
  "Georgia",
  "North Carolina",
  "Michigan",
]

const ALL_US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
]

const FLAGS = [
  { id: "mtc", label: "Personal or family history of medullary thyroid carcinoma or MEN 2" },
  { id: "pregnant", label: "Pregnant, breastfeeding, or planning pregnancy" },
  { id: "pancreatitis", label: "History of pancreatitis" },
  { id: "t1d", label: "Type 1 diabetes" },
]

export function EligibilityCheckerPage() {
  const [state, setState] = useState<string>("California")
  const [heightFt, setHeightFt] = useState("5")
  const [heightIn, setHeightIn] = useState("6")
  const [weightLbs, setWeightLbs] = useState("190")
  const [flags, setFlags] = useState<Record<string, boolean>>({})

  const bmi = useMemo(() => {
    const totalIn = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)
    const lbs = parseFloat(weightLbs) || 0
    if (!totalIn || !lbs) return null
    return (703 * lbs) / (totalIn * totalIn)
  }, [heightFt, heightIn, weightLbs])

  const isServed = SAMPLE_SERVED_STATES.includes(state)
  const anyFlag = Object.values(flags).some(Boolean)

  const outcome = useMemo(() => {
    if (!isServed) {
      return {
        tone: "neutral" as const,
        headline: `Not yet available in ${state}`,
        detail: "This is one of the states Temi is still working to serve. Joining a waitlist is the usual next step.",
      }
    }
    if (anyFlag) {
      return {
        tone: "caution" as const,
        headline: "A clinician should review your history closely",
        detail: "One or more of your answers is something a prescriber needs to weigh carefully before any medication is considered.",
      }
    }
    if (bmi !== null && bmi < 27) {
      return {
        tone: "caution" as const,
        headline: "You may fall outside the typical BMI guideline",
        detail: "Many GLP-1 weight-management programs generally use BMI ≥ 27 (with a related condition) or ≥ 30 as a starting point — but a clinician reviews the full picture, not just this number.",
      }
    }
    return {
      tone: "positive" as const,
      headline: "You appear to meet general screening criteria",
      detail: "Based on what you shared, the next step would typically be a full clinical review by a licensed prescriber.",
    }
  }, [isServed, anyFlag, bmi, state])

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
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Run a quick screen
            </CardTitle>
            <CardDescription>
              A screening estimate, not a diagnosis or a guarantee of prescription.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label>Your state</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ALL_US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ft">Height (ft)</Label>
                  <Input
                    id="ft"
                    type="number"
                    min={0}
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="in">Height (in)</Label>
                  <Input
                    id="in"
                    type="number"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lbs">Weight (lbs)</Label>
                  <Input
                    id="lbs"
                    type="number"
                    min={0}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Does any of this apply to you?</Label>
                <div className="grid gap-2">
                  {FLAGS.map((flag) => (
                    <label
                      key={flag.id}
                      className="flex cursor-pointer items-start gap-2 rounded-md border border-input px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-input accent-[var(--color-primary)]"
                        checked={!!flags[flag.id]}
                        onChange={(e) =>
                          setFlags((prev) => ({ ...prev, [flag.id]: e.target.checked }))
                        }
                      />
                      {flag.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <ResultPanel
              eyebrow="Screening result"
              headline={outcome.headline}
              detail={outcome.detail}
              tone={outcome.tone}
            >
              {bmi !== null && (
                <p className="text-xs text-muted-foreground">
                  Calculated BMI from what you entered: <span className="font-medium text-foreground">{bmi.toFixed(1)}</span>
                </p>
              )}
            </ResultPanel>
          </CardContent>
        </Card>
      }
      supportingContent={
        <>
          <SafetyNote title="A screen, not a diagnosis or a promise" variant="warning">
            This tool does not diagnose any condition and does not guarantee that you will be
            prescribed anything. It only checks a few commonly used screening factors. A licensed
            clinician reviews your complete medical history — including things this short form
            can't capture — before any prescribing decision is made.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation="State availability is checked against a sample served-states list. BMI is calculated as 703 × weight (lbs) ÷ height (in)². The screening flags map to well-known GLP-1 boxed-warning and contraindication topics (thyroid C-cell tumor history, pregnancy, pancreatitis history, type 1 diabetes) and to a commonly used BMI starting threshold."
            dataSource="Sample state-availability list built for this prototype (not Temi's live /states data) and standard, publicly documented GLP-1 prescribing considerations."
            limitations="Your full medical history, current medications, lab values, and anything a clinician would ask in a real intake. This tool intentionally asks very few questions — a real review asks many more."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why a screen, not a form that promises an answer
            </h2>
            <p className="mb-3">
              Temi currently serves a subset of states and maintains a waitlist for the rest, and
              every prescribing decision ultimately depends on a full clinical review, not a
              handful of form fields. The point of this tool isn't to replace that review — it's
              to route people to the right next step quickly: a waitlist if their state isn't
              served yet, a heads-up that a closer clinical look is coming if something they
              shared warrants it, or a clear signal that the standard next step is a full
              intake.
            </p>
            <p>
              That's also why the outcome copy avoids words like "approved," "qualified," or
              "denied." Those words describe a clinical decision this tool isn't making. What it
              can honestly say is what the screen found and what typically happens next — nothing
              more.
            </p>
          </div>
        </>
      }
    />
  )
}
