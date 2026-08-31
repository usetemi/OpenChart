import { cn } from "@/lib/utils"

export function ResultPanel({
  eyebrow,
  headline,
  detail,
  tone = "neutral",
  children,
}: {
  eyebrow: string
  headline: React.ReactNode
  detail?: React.ReactNode
  tone?: "neutral" | "positive" | "caution"
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        tone === "positive" && "border-primary/30 bg-accent",
        tone === "caution" && "border-amber-300 bg-amber-50",
        tone === "neutral" && "border-border bg-secondary/50"
      )}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {eyebrow}
      </p>
      <p className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">{headline}</p>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
