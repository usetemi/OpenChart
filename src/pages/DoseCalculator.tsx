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
            This tool converts a dose in milligrams to a syringe reading in units. This tool does
            not tell you if a dose is correct for you. This tool does not replace instructions
            from your prescriber or pharmacist. Do not change your dose, your vial, or your
            injection method because of this tool alone. Check this tool's numbers against your
            prescriber's instructions and your pharmacy label. If the numbers do not match, stop.
            Call your prescriber or pharmacist before you draw up an injection.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated="August 31, 2026 (prototype build)"
            calculation="This tool calculates volume in this way: volume in mL = dose in mg, divided by vial concentration in mg/mL. This tool then calculates units on a standard U-100 syringe: units = volume in mL, multiplied by 100. A U-100 syringe has 100 units for each milliliter."
            dataSource="This tool uses standard unit-conversion math. This tool uses the standard scale of a U-100 syringe. The concentration options on this page show common vial strengths for compounded semaglutide and tirzepatide. Temi found these strengths in its own blog articles. These options do not show one patient's real prescription."
            limitations="This tool does not cover syringes with a different scale, for example a U-40 syringe. This tool does not include dead space in the needle or syringe. This tool does not include rounding that your pharmacy may use. Always check the concentration on your vial label. Concentration can change between fills."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why this confusion is so common
            </h2>
            <p className="mb-3">
              A pharmacy usually dispenses compounded GLP-1 medication in a multi-dose vial. The
              vial label shows concentration in milligrams per milliliter. A syringe shows units,
              not milligrams per milliliter. A pre-filled pen does not have this problem. Dosing
              errors can happen at this point. This is the most common vial-and-dose question on
              Temi's blog. Temi's blog already explains vial concentration math and dose-splitting
              for semaglutide and tirzepatide.
            </p>
            <p className="mb-3">
              Two numbers can change: concentration and prescribed dose. This tool asks for both
              numbers first. Concentration can differ between pharmacies. Concentration can also
              differ between fills from the same pharmacy. Prescribed dose can change during a
              titration schedule. A wrong number for either value changes the final result. This
              tool shows the volume in mL as a middle step. This step helps you find a wrong input
              before it causes a problem.
            </p>
            <p>
              This tool provides math only. This tool does not provide medical advice. Your
              prescriber or pharmacist knows things this tool does not know. They know your
              specific vial. They know your injection technique. They know if your dose is
              changing. If this tool and your prescriber disagree, follow your prescriber.
            </p>
          </div>
        </>
      }
    />
  )
}
