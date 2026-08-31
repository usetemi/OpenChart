import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { tools } from "@/data/tools"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <Badge variant="secondary" className="mb-3">
          INIT-04 · Free Tool Suite
        </Badge>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Temi tools, prototyped one at a time
        </h1>
        <p className="text-muted-foreground">
          Five standalone prototypes — a cost calculator, a dose &amp; vial calculator, an
          eligibility screen, a refill checker, and a titration planner — built to be reviewed and
          greenlit individually before anything is folded into usetemi.com. Each tool is
          physician-review-pending, runs entirely in your browser, and follows Temi's compliance
          guardrails for clinical framing, pricing disclosures, and compounded-vs-brand
          distinctions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.slug} to={`/${tool.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{tool.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open tool
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
