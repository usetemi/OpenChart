import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ReviewerByline } from "@/components/tool/reviewer-byline"

export function ToolPageShell({
  icon: Icon,
  initiative,
  name,
  tagline,
  tool,
  supportingContent,
}: {
  icon: LucideIcon
  initiative: string
  name: string
  tagline: string
  /** The above-the-fold interactive tool + answer-first result. */
  tool: ReactNode
  /** Everything else: methodology, safety framing, supporting long-form content. */
  supportingContent: ReactNode
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        All tools
      </Link>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
              <Icon className="h-5.5 w-5.5" />
            </span>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary">{initiative}</Badge>
                <Badge variant="outline">Prototype</Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
            </div>
          </div>
        </div>
        <p className="max-w-2xl text-muted-foreground">{tagline}</p>
        <ReviewerByline />
      </div>

      {/* Above-the-fold: the tool itself, immediately usable. */}
      <div className="mb-10">{tool}</div>

      <div className="flex flex-col gap-8">{supportingContent}</div>
    </div>
  )
}
