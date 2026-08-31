import { Stethoscope } from "lucide-react"

export function ReviewerByline() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Stethoscope className="h-3.5 w-3.5" />
      <span>
        Clinical reviewer: <span className="font-medium text-foreground">pending sign-off</span>{" "}
        — every calculation and output string requires physician review before this tool ships.
      </span>
    </div>
  )
}
