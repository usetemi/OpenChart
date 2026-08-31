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

## Build

```bash
npm run build
```

## Deploy

Pushes to `main` (and the current working branch) build and publish to GitHub Pages via
`.github/workflows/deploy.yml`. GitHub Pages must be set to **Source: GitHub Actions** once in
the repo's Settings → Pages before the first deploy will go live.
