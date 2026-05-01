# Lighting Carbon And Cost Comparison Tool

A single-page browser tool for comparing two lighting products head-to-head over a defined project life — capital, energy, replacements, embodied + operational carbon, and the financial impact of an optional control system. All calculations run client-side; no data is sent to any server.

Live build deploys automatically to GitHub Pages from `main` via the workflow in `.github/workflows/`.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built bundle locally
```

`vite.config.js` uses `base: './'` and the Space Grotesk + JetBrains Mono fonts are bundled as Vite assets via relative `url(./fonts/…)` references in `src/styles.css`. The build is portable — it serves from a domain root or any subpath without further configuration.

## Tool overview

The app is organised as a single page with a header, a four-column input row, and a stack of result sections.

**Header.** Title, version tagline, and three modal buttons:
- **Info** — opens the Welcome modal (also opens automatically on every page load) walking through the six sections of the page.
- **Glossary** — term definitions (LMF, Q_adj, EFF, TCO, NPV, GWP, CSC, CACC, decarb factor, dimming).
- **Methodology** — calculation summary (energy, lifetime, replacements, TCO, GWP, controls).

A validation banner under the header surfaces input errors (red) or warnings (amber).

**Inputs (four panels in one row).** Each panel has a chip row of presets at the top and editable number fields below. Clicking × CLEAR reverts the section to its defaults.

| Section | Scope | Preset chips |
|---|---|---|
| **01 · Project** | shared | Retail / Commercial / Residential / Civic Interior / Public Exterior — sets operating hours, project life, electricity rate |
| **02 · Controls** | project-level | No Controls / Occupancy / Daylight / Combined / Full Smart / Task Tuning — sets CSC, CACC, loan rate, loan term |
| **03 · Product A** | product-level | Downlight / Linear / Cylinder / Troffer / Post Top — high-spec L90 defaults (LMF 0.90, life 60,000 hr) |
| **04 · Product B** | product-level | Same chip set — L70-grade defaults (LMF 0.70, life 80,000 hr) |

When the **No Controls** chip is active in section 02, the four CTRL fields are dimmed, the controls scenario is skipped in the engine (`ctrlResults: null`), and section 09 is hidden. KPIs and charts then reflect the raw base case.

**Results.** Verdict ribbon, KPI grid, carbon breakdown bars (embodied = darker shade, operational = brighter shade of the same hue), section 06 NPV-discounted cumulative cost chart, line items, replacement schedule, and section 09 controls scenarios (Base / +Controls / +Controls + Dim) when controls are enabled.

## Project layout

```
src/
├── App.jsx                Root component, state, calculation orchestration, modal wiring
├── main.jsx               React bootstrap
├── styles.css             Font-face, body, scrollbar, input resets
├── calc/engine.js         Pure-JS calculation engine — lifetimes, replacements, energy,
│                          PV cost, NPV, GWP, controls scenarios, validation
├── design/tokens.js       T color/font tokens shared by every component
├── components/
│   ├── atoms.jsx          Modal, SectionHead, etc.
│   └── format.js          Number / currency / unit formatters
├── inputs/
│   ├── ProjectPanel.jsx   01 · Project (shared)
│   ├── ControlsPanel.jsx  02 · Controls (project-level)
│   ├── ProductPanel.jsx   03 / 04 · Product A and Product B
│   ├── NumberField.jsx    Labelled numeric input with hint, error, warn states
│   ├── defaults.js        PROJECT_DEFAULTS, PRODUCT_A/B_DEFAULTS, CTRL_DEFAULTS,
│   │                      PROJECT_PRESETS, PRODUCT_A_PRESETS, BENCHMARKS, CTRL_PRESETS, GLOSSARY
│   └── tips.js            Per-field tooltip copy
├── results/
│   ├── VerdictRibbon.jsx  Headline verdict (which product wins on TCO + GWP)
│   ├── KPIGrid.jsx        05 · KPI grid (energy, life, replacements, TCO, GWP, NPV)
│   ├── CarbonBars.jsx     Stacked carbon bars — embodied vs operational
│   ├── CumulativeCostChart.jsx  06 · NPV cumulative cost over project life
│   ├── LineItems.jsx      Itemised cost breakdown
│   ├── ReplacementSchedule.jsx  Year-by-year replacement events
│   └── ControlsTable.jsx  09 · Controls scenarios (Base / +Controls / +Dim)
└── modals/
    ├── WelcomeModal.jsx   "Info" — auto-opens on every visit, walks through the page
    ├── GlossaryModal.jsx  "Glossary" — term definitions
    └── InfoModal.jsx      "Methodology" — calculation summary
```

## Calculation methodology

The calculation engine implements [`Lighting_Analysis_Calculation_Documentation_v2.md`](./Lighting_Analysis_Calculation_Documentation_v2.md) — the source of truth for all formulas, constants, and validation ranges. Edits to `src/calc/engine.js` should be cross-checked against that document.

All monetary values are in AUD. Intermediate calculations use 4 decimal places; display values are rounded to 2.

## License

MIT — see [LICENSE](./LICENSE).
