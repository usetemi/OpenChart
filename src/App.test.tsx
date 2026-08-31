import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App from "@/App"
import { tools } from "@/data/tools"

afterEach(() => {
  cleanup()
})

function renderAt(hash: string) {
  window.location.hash = hash
  return render(<App />)
}

describe("Home page", () => {
  it("renders the hub heading and a card for every tool", () => {
    renderAt("#/")
    expect(
      screen.getByRole("heading", { level: 1, name: /^temi tools$/i })
    ).toBeInTheDocument()
    for (const tool of tools) {
      expect(screen.getByRole("heading", { level: 3, name: tool.name })).toBeInTheDocument()
    }
  })
})

describe("Tool pages", () => {
  it.each(tools)("renders $name at /$slug with its title and safety framing", async (tool) => {
    renderAt(`#/${tool.slug}`)
    expect(screen.getByRole("heading", { level: 1, name: tool.name })).toBeInTheDocument()
    // Every tool page must show the reviewer byline (physician sign-off framing).
    expect(screen.getByText(/pending sign-off/i)).toBeInTheDocument()
    // Every tool page must show a Methodology block per the on-page template spec.
    expect(screen.getByRole("heading", { name: /methodology/i })).toBeInTheDocument()
  })

  it("navigates from the home page to a tool and back", async () => {
    const user = userEvent.setup()
    renderAt("#/")
    await user.click(screen.getByRole("link", { name: /glp-1 cost calculator/i }))
    expect(
      await screen.findByRole("heading", { level: 1, name: "GLP-1 Cost Calculator" })
    ).toBeInTheDocument()

    // Both the header nav and the tool page's back-link are named "All tools".
    const [backLink] = screen.getAllByRole("link", { name: /all tools/i })
    await user.click(backLink)
    expect(
      await screen.findByRole("heading", { level: 1, name: /^temi tools$/i })
    ).toBeInTheDocument()
  })
})

describe("GLP-1 Cost Calculator", () => {
  it("shows an estimated total that responds to membership selection", async () => {
    const user = userEvent.setup()
    renderAt("#/glp-1-cost-calculator")

    expect(screen.getByText(/estimated total this month/i)).toBeInTheDocument()

    // Before selecting membership, the itemized marketplace fee line is shown.
    expect(screen.getByText(/marketplace service fee \(20%\)/i)).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: /temi care member/i }))
    // Membership waives the itemized marketplace service fee line.
    expect(screen.queryByText(/marketplace service fee \(20%\)/i)).not.toBeInTheDocument()
    expect(screen.getByText(/temi care membership \(\$449\/yr\)/i)).toBeInTheDocument()
  })
})

describe("Dose & Vial Calculator", () => {
  it("computes units from dose and concentration", async () => {
    renderAt("#/glp-1-dose-calculator")
    // Default inputs (0.5 mg over 5 mg/mL) should compute to 10 units.
    expect(await screen.findByText("10.0 units")).toBeInTheDocument()
  })
})

describe("Eligibility & Availability Checker", () => {
  it("flags an unserved state instead of running the clinical screen", async () => {
    const user = userEvent.setup()
    renderAt("#/eligibility-checker")

    // The eligibility checker has a single combobox (state); no accessible
    // name is wired to it yet, so select it positionally.
    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Wyoming" }))

    expect(await screen.findByText(/not yet available in wyoming/i)).toBeInTheDocument()
  })
})
