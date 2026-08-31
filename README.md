# Temi Tools — INIT-04 Free Tool Suite (prototype)

Standalone prototypes of the five tools proposed in INIT-04 · Free Tool Suite, built to be
reviewed and greenlit individually before anything is folded into usetemi.com.

- GLP-1 Cost Calculator
- Dose & Vial Calculator
- Eligibility & Availability Checker
- Refill Timing & Renewal Checker
- Titration Schedule Planner

Each tool runs entirely client-side — nothing entered is saved, transmitted, or stored — and
follows the on-page template spec (above-the-fold tool, answer-first result, methodology block,
clinical safety framing, supporting content, physician-reviewer byline) minus embed code and
conversion-path work, which are intentionally out of scope for this prototype. Compliance
guardrails (educational-only dosing math, screening-not-diagnosis language, dated/labeled pricing,
compounded-vs-brand distinctions) are baked into each page's copy.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui-style components (Radix primitives, CVA,
`cn` utility) + React Router (hash-based, for static GitHub Pages hosting).

## Development

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
```

Rendering smoke tests (Vitest + React Testing Library) cover: the homepage lists every tool, each
tool page renders its heading/reviewer byline/methodology block, home ↔ tool navigation works, and
each tool's core calculation (cost estimate, dose-to-units conversion, state-availability
screening) responds correctly to input.

## Build

```bash
npm run build
```

The build uses a relative (`./`) asset base so it works whether GitHub Pages serves it from a
domain root (private-repo Pages sites use an obscured root domain) or from a `/repo-name/`
subpath (public-repo Pages sites) — paired with a hash router for client-side routing either way.

## Deploy

Pushes to `main` (and the current working branch) run the test suite, build, and publish to
GitHub Pages via `.github/workflows/deploy.yml`. GitHub Pages must be set to **Source: GitHub
Actions** once in the repo's Settings → Pages before the first deploy will go live.
