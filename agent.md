# agent.md

Context for future agents working in this repo.

## What this is

Standalone prototypes of the five tools proposed in **INIT-04 · Free Tool Suite**
(from the `Temi-SEO-Strategy-Drugs-com-Benchmark` strategy doc). Each tool is
reviewed and greenlit individually before anything is folded into usetemi.com.
This is a throwaway prototyping repo, not the production Temi codebase (that's
`usetemi/temi`, which this session did not have push access to — styling here
is a generic shadcn/ui look, not Temi's real brand).

Tools: GLP-1 Cost Calculator, Dose & Vial Calculator, Eligibility & Availability
Checker, Refill Timing & Renewal Checker, Titration Schedule Planner — plus a
homepage hub linking to all five.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui-style components
(hand-written, not CLI-generated: Radix primitives + CVA + `cn` in
`src/components/ui/`) + React Router (`HashRouter` — required for a static SPA
on GitHub Pages) + Vitest + React Testing Library.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run test     # vitest run — keep this green before pushing
npm run build    # tsc -b && vite build
```

## Structure

- `src/pages/*.tsx` — one file per tool, each self-contained (inputs, calc
  logic, result, methodology, safety copy) via `ToolPageShell`.
- `src/components/tool/` — shared tool-page pieces: `ToolPageShell`,
  `ResultPanel` (answer-first result), `MethodologyBlock`, `SafetyNote`,
  `ReviewerByline`.
- `src/components/ui/` — shadcn-style primitives.
- `src/data/tools.ts` — tool metadata (name, slug, icon, tagline) driving the
  homepage and nav.
- `src/App.test.tsx` — rendering smoke tests for all pages + core calc logic.

## Deployment

GitHub Pages via `.github/workflows/deploy.yml`, triggered on push to `main`
and `claude/google-drive-access-vl2e8k`. **Vite `base` must stay `'./'`
(relative)** — a private repo's Pages site is served from an obscured root
domain (`https://<random>.pages.github.io/`), not a `/tuuls/` subpath, so an
absolute base breaks every asset URL (this happened once; see git history).
Pages must have **Source: GitHub Actions** enabled once in repo Settings →
Pages (not something this session's GitHub token could toggle).

## Content rules baked into every tool page

From the sheet's "On-page template specification" and "Compliance
guardrails" (INIT-04 tab) — preserve these when editing:

- Tool is above the fold; answer-first result before explanation.
- Every page has a `MethodologyBlock` (calculation, data source, last
  updated, limitations) and a `SafetyNote`.
- Copy is written in Simplified Technical English style (short sentences,
  one idea each, active voice) — match this when adding prose.
- Dose calculator: educational math only, never reads as a prescribing
  instruction.
- Eligibility checker: screens, never diagnoses or guarantees a prescription.
- Any price shown states its date/basis and is explicitly illustrative.
- Compounded medications are never presented as equivalent to
  FDA-approved/brand products (kept in separate selections, not one list).
- No real physician has reviewed these tools — `ReviewerByline` says
  "pending sign-off" on purpose; don't replace with a real name without
  actual sign-off.

**Explicitly out of scope for this prototype** (per the user, not an
oversight): embed code, conversion-path CTAs, internal linking/schema/
indexation rules, WCAG audit.

## Known gaps (as of last check against the INIT-04 tab)

- Supporting content is ~200-400 words/tool; the sheet asks for 800–1,500.
- No global privacy statement since the footer was trimmed to "Prototype for
  internal review" — the Eligibility Checker collects health info (BMI,
  clinical flags) with no on-page privacy note. Worth revisiting.
- All pricing/state-availability data is illustrative sample data, not live.
- Radix `Select` triggers aren't wired to their `<Label>` via `htmlFor`/`id`
  (accessibility was explicitly deferred, but it's a cheap fix later).
