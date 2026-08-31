export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-muted-foreground sm:px-6">
        <p className="mb-2 font-medium text-foreground">
          Prototype for internal review — INIT-04 Free Tool Suite
        </p>
        <p>
          This is a working prototype built to evaluate each tool individually before it is
          folded into usetemi.com. Nothing on this site is medical advice, a diagnosis, or a
          guarantee of treatment or pricing. Every tool runs entirely in your browser: nothing you
          enter is saved, transmitted, or stored anywhere. Figures shown are illustrative examples
          for demonstration purposes and are not live pricing or a personalized clinical
          recommendation. Always confirm your specific price, dose, and eligibility with a
          licensed clinician or pharmacist.
        </p>
      </div>
    </footer>
  )
}
