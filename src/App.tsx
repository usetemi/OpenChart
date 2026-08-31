import { HashRouter, Routes, Route, Outlet } from "react-router-dom"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Home } from "@/pages/Home"
import { CostCalculatorPage } from "@/pages/CostCalculator"
import { DoseCalculatorPage } from "@/pages/DoseCalculator"
import { EligibilityCheckerPage } from "@/pages/EligibilityChecker"
import { RefillCheckerPage } from "@/pages/RefillChecker"
import { TitrationPlannerPage } from "@/pages/TitrationPlanner"

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/glp-1-cost-calculator" element={<CostCalculatorPage />} />
          <Route path="/glp-1-dose-calculator" element={<DoseCalculatorPage />} />
          <Route path="/eligibility-checker" element={<EligibilityCheckerPage />} />
          <Route path="/refill-checker" element={<RefillCheckerPage />} />
          <Route path="/titration-planner" element={<TitrationPlannerPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
