import { useMemo, useState } from "react"
import { Syringe } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { getToolBySlug } from "@/data/tools"

const meta = getToolBySlug("glp-1-dose-calculator")!

const CONCENTRATION_PRESETS: Record<string, number> = {
  "2.5 mg/mL": 2.5,
  "5 mg/mL": 5,
  "10 mg/mL": 10,
  "17 mg/mL": 17,
  "20 mg/mL": 20,
  Custom: 0,
}

export function DoseCalculatorPage() {
  const [concentrationLabel, setConcentrationLabel] = useState<string>("5 mg/mL")
  const [customConcentration, setCustomConcentration] = useState<string>("")
  const [doseInput, setDoseInput] = useState<string>("0.5")

  const concentration =
    concentrationLabel === "Custom"
      ? parseFloat(customConcentration) || 0
      : CONCENTRATION_PRESETS[concentrationLabel]

  const dose = parseFloat(doseInput) || 0

  const result = useMemo(() => {
    if (!concentration || !dose) return null
    const volumeMl = dose / concentration
    const units = volumeMl * 100
    return { volumeMl, units }
  }, [concentration, dose])

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
              <Syringe className="h-5 w-5 text-primary" />
              Convert a dose to a syringe reading
            </CardTitle>
            <CardDescription>
              An educational unit-conversion only — not an instruction to inject.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label>Vial concentration</Label>
                <Select value={concentrationLabel} onValueChange={setConcentrationLabel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CONCENTRATION_PRESETS).map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Check your vial label or pharmacy printout — concentration varies by pharmacy
                  and by fill.
                </p>
              </div>

              {concentrationLabel === "Custom" && (
                <div className="grid gap-2">
                  <Label htmlFor="custom-concentration">Custom concentration (mg/mL)</Label>
                  <Input
                    id="custom-concentration"
                    type="number"
                    min={0}
                    step="0.1"
                    value={customConcentration}
                    onChange={(e) => setCustomConcentration(e.target.value)}
                    placeholder="e.g. 12.5"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="dose">Your prescribed dose (mg)</Label>
                <Input
                  id="dose"
                  type="number"
                  min={0}
                  step="0.05"
                  value={doseInput}
                  onChange={(e) => setDoseInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use exactly the dose written on your prescription — not a dose you're
                  considering.
                </p>
              </div>
            </div>

            <ResultPanel
              eyebrow="On a standard U-100 syringe"
              headline={result ? `${result.units.toFixed(1)} units` : "Enter a dose to see units"}
              detail={
                result
                  ? `That's ${result.volumeMl.toFixed(3)} mL drawn to the ${result.units.toFixed(
                      0
                    )}-unit mark.`
                  : undefined
              }
              tone={result ? "positive" : "neutral"}
            >
              {result && (
                <>
                  <Separator className="mb-3" />
                  <ol className="grid gap-1.5 text-sm text-muted-foreground">
                    <li>
                      1. Dose ÷ concentration ={" "}
                      <span className="font-medium text-foreground">
                        {dose} mg ÷ {concentration} mg/mL = {result.volumeMl.toFixed(3)} mL
                      </span>
                    </li>
                    <li>
                      2. Volume × 100 units/mL (U-100 syringe) ={" "}
                      <span className="font-medium text-foreground">
                        {result.volumeMl.toFixed(3)} mL × 100 = {result.units.toFixed(1)} units
                      </span>
                    </li>
                  </ol>
                </>
              )}
            </ResultPanel>
          </CardContent>
        </Card>
      }
      supportingContent={
        <>
          <SafetyNote title="Educational math only — not a dosing instruction" variant="warning">
            This tool converts a prescribed milligram dose into a syringe unit reading. It does
            not tell you whether a dose is right for you, and it is not a substitute for
            instructions from your prescriber or pharmacist. Never change your dose, your vial, or
            your injection technique based on this calculator alone. If a number here doesn't
            match what your prescriber or pharmacy label says, stop and call them before drawing
            up an injection.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation="Volume (mL) = prescribed dose (mg) ÷ vial concentration (mg/mL). Units on a standard U-100 syringe = volume (mL) × 100, since a U-100 syringe is calibrated at 100 units per milliliter."
            dataSource="Standard pharmacology unit-conversion math and common U-100 syringe calibration. Concentration presets reflect typical compounded semaglutide and tirzepatide vial strengths seen in Temi's blog content, not a specific patient's prescription."
            limitations="Syringes calibrated differently from U-100 (for example U-40), dead space in the needle or syringe, and any rounding your pharmacy applies when dispensing. Always confirm the concentration on your actual vial label, which can vary by fill."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why this confusion is so common
            </h2>
            <p className="mb-3">
              Compounded GLP-1 medications are typically dispensed as a multi-dose vial measured
              in milligrams per milliliter, while the syringes used to draw them up are marked in
              units — a labeling mismatch that doesn't exist with a pre-filled pen. That gap is
              exactly where dosing errors happen, and it's also the single most common
              vial-and-dose question on Temi's own blog, which has already published on vial
              concentration math and dose-splitting for both semaglutide and tirzepatide.
            </p>
            <p className="mb-3">
              The two numbers that actually vary are the ones this tool asks for first:
              concentration (which can differ between pharmacies and even between fills from the
              same pharmacy) and your prescribed dose (which changes as you move through a
              titration schedule). Getting either one wrong scales the other, which is why this
              tool shows the intermediate volume-in-mL step rather than jumping straight to a
              units number — so a mistaken input is easier to catch before it matters.
            </p>
            <p>
              This is deliberately framed as arithmetic, not medical advice. A prescriber or
              pharmacist has context this tool doesn't: your specific vial, your injection
              technique, and how your dose may be changing. When the two disagree, the person, not
              the calculator, is right.
            </p>
          </div>
        </>
      }
    />
  )
}
