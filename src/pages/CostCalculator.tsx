import { useMemo, useState } from "react"
import { Calculator } from "lucide-react"
import { ToolPageShell } from "@/components/tool/tool-page-shell"
import { ResultPanel } from "@/components/tool/result-panel"
import { MethodologyBlock } from "@/components/tool/methodology-block"
import { SafetyNote } from "@/components/tool/safety-note"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getToolBySlug } from "@/data/tools"

const meta = getToolBySlug("glp-1-cost-calculator")!

const PRICING_AS_OF = "August 31, 2026"

type MedType = "compounded-semaglutide" | "compounded-tirzepatide" | "brand"
type Stage = "starting" | "titrating" | "maintenance"
type RxStatus = "new" | "refill"
type BrandName = "Wegovy" | "Zepbound" | "Ozempic" | "Mounjaro"

// Illustrative, non-live sample acquisition costs. These stand in for a real pricing
// feed and exist only to demonstrate the cost-plus mechanism in this prototype.
const ACQUISITION_COST: Record<Exclude<MedType, "brand">, Record<Stage, [number, number]>> = {
  "compounded-semaglutide": {
    starting: [130, 150],
    titrating: [160, 190],
    maintenance: [200, 230],
  },
  "compounded-tirzepatide": {
    starting: [150, 175],
    titrating: [190, 230],
    maintenance: [240, 280],
  },
}

// Approximate, publicly reported manufacturer list prices (cash, no insurance).
// Temi's cost-plus cap applies to compounded orders, not manufacturer list price.
const BRAND_LIST_PRICE: Record<BrandName, number> = {
  Wegovy: 1349,
  Zepbound: 1059,
  Ozempic: 935,
  Mounjaro: 1069,
}

const MARKUP_CAP = 0.15
const MARKETPLACE_FEE_RATE = 0.2
const MEMBERSHIP_ANNUAL = 449
const REFILL_FEE = 15
const NEW_RX_FEE = 79

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

export function CostCalculatorPage() {
  const [medType, setMedType] = useState<MedType>("compounded-semaglutide")
  const [brand, setBrand] = useState<BrandName>("Wegovy")
  const [stage, setStage] = useState<Stage>("titrating")
  const [rxStatus, setRxStatus] = useState<RxStatus>("refill")
  const [isMember, setIsMember] = useState(false)

  const result = useMemo(() => {
    const isCompounded = medType !== "brand"

    let medLow: number
    let medHigh: number
    if (isCompounded) {
      const [accLow, accHigh] = ACQUISITION_COST[medType as Exclude<MedType, "brand">][stage]
      medLow = accLow
      medHigh = Math.round(accHigh * (1 + MARKUP_CAP))
      // accLow shown as-is (0% markup floor), accHigh capped at +15%
    } else {
      medLow = BRAND_LIST_PRICE[brand]
      medHigh = BRAND_LIST_PRICE[brand]
    }

    const marketplaceFeeLow = isCompounded && !isMember ? medLow * MARKETPLACE_FEE_RATE : 0
    const marketplaceFeeHigh = isCompounded && !isMember ? medHigh * MARKETPLACE_FEE_RATE : 0

    const serviceFee = isMember ? 0 : rxStatus === "new" ? NEW_RX_FEE : REFILL_FEE
    const membershipMonthly = isMember ? MEMBERSHIP_ANNUAL / 12 : 0

    const totalLow = medLow + marketplaceFeeLow + serviceFee + membershipMonthly
    const totalHigh = medHigh + marketplaceFeeHigh + serviceFee + membershipMonthly

    return {
      isCompounded,
      medLow,
      medHigh,
      marketplaceFeeLow,
      marketplaceFeeHigh,
      serviceFee,
      membershipMonthly,
      totalLow: Math.round(totalLow),
      totalHigh: Math.round(totalHigh),
    }
  }, [medType, brand, stage, rxStatus, isMember])

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
              <Calculator className="h-5 w-5 text-primary" />
              Estimate your monthly cost
            </CardTitle>
            <CardDescription>
              Sample figures only — see methodology below for what's real and what's
              illustrative.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label>Medication</Label>
                <Select value={medType} onValueChange={(v) => setMedType(v as MedType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compounded-semaglutide">Compounded semaglutide</SelectItem>
                    <SelectItem value="compounded-tirzepatide">Compounded tirzepatide</SelectItem>
                    <SelectItem value="brand">Brand-name GLP-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {medType === "brand" && (
                <div className="grid gap-2">
                  <Label>Brand</Label>
                  <Select value={brand} onValueChange={(v) => setBrand(v as BrandName)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(BRAND_LIST_PRICE) as BrandName[]).map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {medType !== "brand" && (
                <div className="grid gap-2">
                  <Label>Dose stage</Label>
                  <RadioGroup
                    value={stage}
                    onValueChange={(v) => setStage(v as Stage)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                  >
                    {(
                      [
                        ["starting", "Starting dose"],
                        ["titrating", "Titrating up"],
                        ["maintenance", "Maintenance dose"],
                      ] as [Stage, string][]
                    ).map(([val, label]) => (
                      <label
                        key={val}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                      >
                        <RadioGroupItem value={val} />
                        {label}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="grid gap-2">
                <Label>Prescription status</Label>
                <RadioGroup
                  value={rxStatus}
                  onValueChange={(v) => setRxStatus(v as RxStatus)}
                  className="grid grid-cols-2 gap-2"
                >
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                    <RadioGroupItem value="new" />
                    New prescription
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                    <RadioGroupItem value="refill" />
                    Refill
                  </label>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>Membership</Label>
                <RadioGroup
                  value={isMember ? "member" : "non-member"}
                  onValueChange={(v) => setIsMember(v === "member")}
                  className="grid grid-cols-2 gap-2"
                >
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                    <RadioGroupItem value="non-member" />
                    Pay-per-order
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                    <RadioGroupItem value="member" />
                    Temi Care member
                  </label>
                </RadioGroup>
              </div>
            </div>

            <ResultPanel
              eyebrow="Estimated total this month"
              headline={
                result.totalLow === result.totalHigh
                  ? currency(result.totalLow)
                  : `${currency(result.totalLow)}–${currency(result.totalHigh)}`
              }
              detail={`Illustrative example, as of ${PRICING_AS_OF}. Not a quote.`}
              tone="positive"
            >
              <Separator className="mb-3" />
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">
                    Medication {result.isCompounded && "(cost-plus, 15% cap)"}
                  </dt>
                  <dd className="font-medium">
                    {result.medLow === result.medHigh
                      ? currency(result.medLow)
                      : `${currency(result.medLow)}–${currency(result.medHigh)}`}
                  </dd>
                </div>
                {result.isCompounded && !isMember && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Marketplace service fee (20%)</dt>
                    <dd className="font-medium">
                      {currency(result.marketplaceFeeLow)}–{currency(result.marketplaceFeeHigh)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">
                    Prescription service fee {isMember && "(included in membership)"}
                  </dt>
                  <dd className="font-medium">{currency(result.serviceFee)}</dd>
                </div>
                {isMember && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Temi Care membership ($449/yr)</dt>
                    <dd className="font-medium">{currency(Math.round(result.membershipMonthly))}/mo</dd>
                  </div>
                )}
              </dl>
            </ResultPanel>
          </CardContent>
        </Card>
      }
      supportingContent={
        <>
          <SafetyNote title="This is a pricing estimate, not a bill" variant="default">
            The numbers above are illustrative examples built for this prototype — they are not
            connected to Temi's live pricing systems. Your actual price depends on your pharmacy,
            your dose, and current acquisition costs, and will always be shown to you before you
            pay. Compounded medications shown here are not FDA-approved versions of the
            brand-name product; they are prepared by licensed pharmacies to meet an individual
            prescription.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated={`${PRICING_AS_OF} (illustrative sample data, refreshed manually for this prototype)`}
            dataSource="Sample acquisition-cost bands and publicly reported manufacturer list prices, used only to demonstrate the calculation. A production version would connect to Temi's live pharmacy pricing feed."
            calculation="Compounded medication price = pharmacy acquisition cost, marked up by no more than 15% (Temi's stated cap). Non-members additionally pay a 20% marketplace service fee on compounded orders plus a flat prescription service fee ($79 new / $15 refill). Temi Care members ($449/yr) pay no per-order service or marketplace fees, amortized here as a monthly figure. Brand-name medications are shown at manufacturer list price and are not subject to the compounded cost-plus cap."
            limitations="Insurance coverage, pharmacy-to-pharmacy price variation, shipping, and promotional pricing. Does not reflect real-time acquisition costs."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why Temi shows the markup, not just the price
            </h2>
            <p className="mb-3">
              Most pharmacies and telehealth platforms show a single sticker price for a
              compounded medication and leave you to guess how it was set. Temi's stated policy is
              different: medication is priced at pharmacy cost plus a markup capped at 15%. That
              cap is a meaningful, publishable fact — almost no competitor in this category states
              a markup cap at all — and it's the reason this calculator breaks the medication line
              out separately from service and membership fees instead of bundling everything into
              one number.
            </p>
            <p className="mb-3">
              The two pricing paths matter because they suit different usage patterns. Pay-per-order
              pricing (a $15 prescription service fee per refill, $79 for a new prescription, plus
              a 20% marketplace service fee on compounded orders) tends to cost less for someone
              filling infrequently or still deciding whether to continue treatment. The $449/year
              Temi Care membership waives the per-order service and marketplace fees entirely,
              which tends to pay for itself for anyone refilling monthly for more than a few
              months — this calculator's membership toggle is meant to make that break-even
              visible rather than asserted.
            </p>
            <p>
              One more distinction worth being explicit about: compounded semaglutide and
              tirzepatide are not FDA-approved generic or brand versions of the medication. They
              are prepared by a licensed compounding pharmacy to fill an individual prescription,
              typically when the approved product is in shortage or a patient needs a different
              strength or formulation. This calculator keeps compounded and brand-name options in
              separate selections rather than a single side-by-side list, specifically so the
              distinction isn't lost in a price comparison.
            </p>
          </div>
        </>
      }
    />
  )
}
