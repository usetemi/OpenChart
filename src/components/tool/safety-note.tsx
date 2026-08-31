import { ShieldAlert, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SafetyNote({
  title,
  children,
  variant = "warning",
}: {
  title: string
  children: React.ReactNode
  variant?: "warning" | "default"
}) {
  const Icon = variant === "warning" ? ShieldAlert : Info
  return (
    <Alert variant={variant}>
      <Icon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
