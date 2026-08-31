import type { LucideIcon } from "lucide-react"
import { Calculator, Syringe, ClipboardCheck, CalendarClock, LineChart } from "lucide-react"

export type ToolMeta = {
  slug: string
  name: string
  shortName: string
  tagline: string
  description: string
  icon: LucideIcon
  initiative: string
}

export const tools: ToolMeta[] = [
  {
    slug: "glp-1-cost-calculator",
    name: "GLP-1 Cost Calculator",
    shortName: "Cost Calculator",
    tagline: "See what you'd actually pay, itemized.",
    description:
      "Estimate your all-in monthly cost for a compounded or brand-name GLP-1, broken out by service fee, membership, and cost-plus medication price.",
    icon: Calculator,
    initiative: "INIT-04",
  },
  {
    slug: "glp-1-dose-calculator",
    name: "Dose & Vial Calculator",
    shortName: "Dose & Vial Calculator",
    tagline: "Convert a prescribed dose into a syringe reading.",
    description:
      "Turn a vial concentration and a prescribed milligram dose into a units reading on a standard U-100 syringe, with the math shown at every step.",
    icon: Syringe,
    initiative: "INIT-04",
  },
  {
    slug: "eligibility-checker",
    name: "Eligibility & Availability Checker",
    shortName: "Eligibility Checker",
    tagline: "See where you stand before you apply.",
    description:
      "A quick screen on state availability and common clinical flags, to set expectations before a licensed clinician reviews your full history.",
    icon: ClipboardCheck,
    initiative: "INIT-04",
  },
  {
    slug: "refill-checker",
    name: "Refill Timing & Renewal Checker",
    shortName: "Refill Checker",
    tagline: "Know if you need a refill or a renewal.",
    description:
      "Enter your last fill date and refills remaining to see when you're eligible for a refill, and whether a new clinical review is needed first.",
    icon: CalendarClock,
    initiative: "INIT-04",
  },
  {
    slug: "titration-planner",
    name: "Titration Schedule Planner",
    shortName: "Titration Planner",
    tagline: "A reference calendar for dose escalation.",
    description:
      "Generate a general dose-escalation reference calendar for semaglutide or tirzepatide, based on typical FDA-labeled titration steps.",
    icon: LineChart,
    initiative: "INIT-04",
  },
]

export function getToolBySlug(slug: string | undefined) {
  return tools.find((t) => t.slug === slug)
}
