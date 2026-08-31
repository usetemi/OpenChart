import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MethodologyBlock({
  lastUpdated,
  dataSource,
  calculation,
  limitations,
}: {
  lastUpdated: string
  dataSource: string
  calculation: string
  limitations: string
}) {
  return (
    <Card className="bg-secondary/40">
      <CardHeader>
        <CardTitle className="text-base">Methodology</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-1 font-medium text-foreground">How this is calculated</p>
          <p className="text-muted-foreground">{calculation}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-foreground">Data source</p>
          <p className="text-muted-foreground">{dataSource}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-foreground">Last updated</p>
          <p className="text-muted-foreground">{lastUpdated}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-foreground">What this does not account for</p>
          <p className="text-muted-foreground">{limitations}</p>
        </div>
      </CardContent>
    </Card>
  )
}
