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
            The numbers above are sample numbers for this prototype. They are not connected to
            Temi's live pricing system. Your real price depends on your pharmacy, your dose, and
            current costs. Temi will show your price before you pay. The compounded medications on
            this page are not FDA-approved copies of the brand-name product. A licensed pharmacy
            prepares each compounded medication for one prescription.
          </SafetyNote>

          <MethodologyBlock
            lastUpdated={`${PRICING_AS_OF} (illustrative sample data, refreshed manually for this prototype)`}
            dataSource="This page uses sample cost ranges and public manufacturer list prices. These numbers only show how the calculation works. A live version of this tool will connect to Temi's pharmacy pricing system."
            calculation="Temi calculates the compounded medication price like this: pharmacy cost, plus a markup of 15% or less. Non-members also pay a 20% marketplace fee on compounded orders. Non-members also pay a service fee: $79 for a new prescription, or $15 for a refill. Temi Care members pay $449 each year. Members do not pay the service fee or the marketplace fee. This page shows the $449 fee as a monthly amount. This page shows brand-name medications at the manufacturer's list price. The 15% cap does not apply to brand-name medications."
            limitations="This tool does not include insurance coverage. This tool does not include price differences between pharmacies. This tool does not include shipping costs or sale prices. This tool does not show real-time pharmacy costs."
          />

          <div className="max-w-none text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Why Temi shows the markup, not just the price
            </h2>
            <p className="mb-3">
              Most pharmacies show one price for a compounded medication. They do not explain how
              they set the price. Temi's policy is different. Temi prices each medication at
              pharmacy cost, plus a markup of 15% or less. Few other companies state a markup
              limit. This is why the calculator shows the medication cost as a separate line. The
              calculator does not combine the medication cost with the service fee and the
              membership fee.
            </p>
            <p className="mb-3">
              Temi offers two payment paths. Pay-per-order costs $15 per refill, or $79 for a new
              prescription. Pay-per-order also adds a 20% marketplace fee on compounded orders.
              Pay-per-order can cost less for a person who refills rarely. Pay-per-order can also
              suit a person who has not decided to continue treatment. Temi Care membership costs
              $449 each year. A member does not pay the service fee or the marketplace fee.
              Membership can save money for a person who refills every month for several months.
              Use the membership switch on this page to compare both paths.
            </p>
            <p>
              Note this important difference. Compounded semaglutide and compounded tirzepatide
              are not FDA-approved generic or brand medications. A licensed compounding pharmacy
              prepares each one for a single prescription. A pharmacy often does this when the
              approved product is not available, or when a patient needs a different strength or
              form. This calculator lists compounded medications and brand-name medications
              separately. This keeps the difference clear during a price comparison.
            </p>
          </div>
        </>
      }
    />
  )
}
