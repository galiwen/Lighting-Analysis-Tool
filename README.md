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

The app is organised as a single page with a header, a hero region of four input tiles, and a stack of detailed result sections below.

**Header.** Title, version tagline, and three outlined modal buttons (`LinkBtn`):
- **Info** — opens the Welcome modal (also opens automatically on every page load) walking through the page.
- **Glossary** — term definitions (LMF, Q_adj, EFF, TCO, NPV, GWP, CSC, CACC, CRI, UGR, decarb factor, dimming).
- **Methodology** — calculation summary (energy, lifetime, replacements, TCO, GWP, controls).

A validation banner under the header surfaces input errors (red) or warnings (amber). The error layer comes from `validateInputs` in `src/calc/engine.js` (range checks on raw inputs); the warning layer adds post-calculation hits from `checkCalculationWarnings` — effective lifetime under one year, replacement count ≥ 3, grid-decarb horizon beyond project life, payback exceeding the loan term or the project life.

**Inputs (four clickable tiles in the hero region).** Each `SectionTile` shows its section number + title, the active preset name (or `[ CUSTOM ]` if unmatched), and a 2–3 line mono summary of the current state. Clicking any tile opens a modal containing that section's preset chips, × CLEAR affordance, and stacked `NumberField` rows. The modal closes on **Esc**, backdrop click, or **✕ CLOSE**.

| Section | Scope | Preset chips | Modal fields |
|---|---|---|---|
| **01 · Project** | shared | Retail / Commercial / Residential / Civic Interior / Public Exterior | operating hours, project life, electricity rate, grid carbon factor + decarb trajectory, interest, discount rate |
| **02 · Controls** | project-level | No Controls / Occupancy / Daylight / Combined / Full Smart / Task Tuning | CSC, CACC, loan rate, loan term |
| **03 · Product A** | product-level | Downlight / Linear / Cylinder / Troffer / Post Top — high-spec L90 defaults (LMF 0.90, life 60,000 hr) | W, FL, Q, LMF, LH, GWP_CG, GWP_EOL, C_SI, **CRI**, **UGR** |
| **04 · Product B** | product-level | Same chip set — L70-grade defaults (LMF 0.70, life 80,000 hr) | W, FL, Q, LMF, LH, GWP_CG, GWP_EOL, C_SI, **CRI**, **UGR** |

When the **No Controls** chip is active in section 02, the four CTRL fields are dimmed (with a `[ DISABLED — SCENARIO SHORT-CIRCUITED ]` caption inside the modal), the controls scenario is skipped in the engine (`ctrlResults: null`), and section 07 is hidden. KPIs and charts then reflect the raw base case.

**Detailed results.** Three stacked sections sit below the hero, each with the same external `SectionHead` + `padding: 20px 28px` body + `1px solid T.INK` bottom rule rhythm:

- **05 · Carbon breakdown.** Stacked carbon bars per product — embodied (darker shade) + operational (brighter shade of the same hue).
- **06 · Cumulative cost — Net Present Value.** NPV-discounted cumulative cost line per product over the project life; x-axis ticks run `y1 … y{PL}` (no `y0`).
- **07 · Controls — scenario breakdown** (when controls are enabled). A 4-up cost KPI strip (control system cost / annual energy saving / simple payback / total loan payments), a 3-up carbon-avoided KPI strip using the same bordered-card recipe, Total Cost of Ownership and Lifecycle carbon bar groups, and a residual scenario table.

There is no single-figure verdict — when products split metrics, the cost chart and carbon bars surface the split honestly rather than collapsing it into prose.

## Design language

The interface is editorial: a sans-serif body paired with strictly monospaced metadata, thin 1px rules instead of cards or shadows, and a small palette where every color carries a defined role. The tokens, fonts, and component patterns below all live in `src/design/tokens.js` and `src/components/atoms.jsx` — anything new should re-use them rather than introduce parallel styling.

### Typography

- **Space Grotesk** (variable, 300–700) — body text, panel titles, modal headings, NumberField input values. Used via `T.SANS`.
- **JetBrains Mono** (variable, 100–800) — labels, units, micro-tags, axis labels, button text, the × CLEAR affordance, the modal close button. Used via `T.MONO`.
- Both fonts are bundled relatively as `./fonts/*.ttf` from the `@font-face` rules in `src/styles.css`, so they ship with the build and the bundle is portable.
- Convention: uppercase mono with `0.06–0.08em` letter-spacing carries every interaction affordance and metadata label. Sans carries content. The exported `micro` (mono 9px uppercase, `T.MUTED`) and `microSm` (8px variant) helpers cover most metadata callsites.

### Color tokens

Sourced verbatim from `src/design/tokens.js`:

| Token | Hex | Role |
|---|---|---|
| `INK` | `#0A0A0A` | Primary text and structural rules |
| `BG` | `#FAFAF7` | Page background |
| `BG_PANEL` | `#F4F1E8` | Modal headers, hover backgrounds |
| `RULE` | `#1A1A1A` | Heavy horizontal divider variant |
| `MUTED` | `#7A7872` | Secondary text, micro labels, axis text |
| `SUBTLE` | `#E2DFD6` | Field borders, light gridlines, column rules |
| `BLUE` | `#6F00FF` | Product A primary (PROPOSED) |
| `BLUE_D` | `#3D008C` | Product A embodied / darker shade |
| `VERM` | `#FF5900` | Product B primary (BENCHMARK) |
| `VERM_D` | `#8A3000` | Product B embodied / darker shade |
| `ERROR` | `#B22222` | Validation error (border, icon, text) |
| `SUCCESS` | `#1F6B3F` | Success indicator |
| `WARN_BG` / `WARN_BD` | `#FFF6E0` / `#C9802A` | Warning banner background / accent |
| `SANS` / `MONO` | — | Font-stack constants |

### Color semantics

- **Product A** uses the BLUE family with accent label `PROPOSED`.
- **Product B** uses the VERM family with accent label `BENCHMARK`.
- The `_D` suffix denotes the darker shade of a product's hue and is reserved for **embodied carbon** treatment (manufacturing + end-of-life) wherever a chart or KPI separates the two carbon sources.
- Chart convention: bright = operational (electricity over project life); dark = embodied. Same hue, two depths — one product reads as one visual unit.

### Layout grammar

- Page structure: header (title + outlined Info / Glossary / Methodology buttons) → optional validation banner → hero region (four input tiles) → stacked result sections (05 / 06 / 07) → footer disclaimer.
- Max content width is 1320px, centered.
- Sections are numbered `01 · Project`, `02 · Controls`, `03 · Product A`, `04 · Product B`, `05 · Carbon breakdown`, `06 · Cumulative cost — Net Present Value`, `07 · Controls — scenario breakdown` (when controls are enabled). The number renders in `T.MUTED`, separated from the title by a bullet.
- The hero region uses the `.hero-tiles` CSS grid in `src/styles.css` — 4 columns by default, collapsing to 2 columns at the 900 px breakpoint and 1 column at 560 px. Each outlined `SectionTile` sits as a discrete card; the whole hero is wrapped in a `1px solid T.INK` bottom rule.
- Every result section below the hero follows the same vertical rhythm: external `SectionHead` bar (idx + title + uppercase `micro` caption) on top, `padding: 20px 28px` body, `1px solid T.INK` bottom rule. One repeated unit, one repeated boundary line.
- Vertical column dividers elsewhere are `1px solid T.SUBTLE`. Horizontal section rules are `1px solid T.INK` (or `T.RULE` where a slightly lighter bar reads better).
- Every input panel (rendered inside its tile's modal) follows the same vertical rhythm:
  1. Modal title bar (`01 · Project`, etc.) — supplied by the `Modal` atom; panels render in `chromeless` mode and omit their own inline header.
  2. Preset chip row plus `× CLEAR`, separated below by a thin rule.
  3. Stacked `NumberField` rows.

  For Product modals, a 2px accent top-rule (BLUE / VERM) on the body wrapper restores the product identity that the suppressed inline header used to provide.

### Component vocabulary

- **SectionTile** (`src/components/SectionTile.jsx`) — clickable summary card in the hero. Full `1px solid T.INK` outline over a transparent fill that swaps to `T.BG_PANEL` cream on hover (120ms transition). Two-row interior: index + title + accent label on top, divider rule (2px accent for Product tiles, 1px INK for Project / Controls), then a 2–3 line mono summary of the current state. Click opens the corresponding input modal.
- **LinkBtn** (defined in `src/App.jsx`) — the outlined-button style shared by the three header buttons (Info / Glossary / Methodology). Same 1px INK border + transparent fill + hover swap to `T.BG_PANEL` as `SectionTile`. MONO 10px uppercase content.
- **Preset chip** — small rectangular button (`3px × 8px` padding), MONO 9px uppercase with 0.06em spacing. Active: filled `T.INK` background with `T.BG` text. Inactive: transparent with `T.SUBTLE` border and `T.MUTED` text.
- **× CLEAR** — borderless trailing button at `marginLeft: auto` in the chip row. MONO 9px uppercase. Color is `T.VERM` when something is dirty, `T.SUBTLE` when there is nothing to clear.
- **Section micro-tag** — `micro` style, right-aligned in the panel header. Communicates scope (`SHARED` / `PROJECT-LEVEL` / `PRODUCT-LEVEL`) without competing with the title.
- **NumberField (`NF`)** — micro label on top with an optional `Tip` "i" icon, mono 13px right-aligned input, optional unit suffix. States: error (`T.ERROR` border + icon + message), warn (`T.WARN_BD`), focus (border darkens to `T.INK`), hint below in `microSm`. Numeric value color follows the panel `accent` (BLUE / VERM / INK).
- **Modal** (`src/components/atoms.jsx`) — fixed centered, default 620px width (configurable), 1px `T.INK` border, `T.BG_PANEL` header bar with title (SANS bold) + "✕ CLOSE" button (INK bg, BG text, MONO 10px), 0.65 dark backdrop. Closes on backdrop click, ✕ CLOSE, or the **Esc** key. Used by the Welcome, Glossary, Methodology, and four input dialogs.
- **SectionHead** (`src/components/atoms.jsx`) — shared header bar for results sections: `idx · title` on the left, optional uppercase `micro` meta on the right, `borderBottom 1px T.INK`. Always rendered externally — immediately above a `padding: 20px 28px` body that itself closes with a `1px solid T.INK` bottom rule. Used by sections 05, 06, and 07.
- **KPI card** — `padding: 10px 12px`, `1px solid T.SUBTLE` border, micro top label, SANS 18px 600-weight value, micro 8px subtitle. Used for the four cost metrics and three carbon-avoided deltas in section 07.
- **Tooltip** (`src/components/Tooltip.jsx`) — absolutely-positioned mono panel anchored above the cursor. 1px INK border, BG fill, multi-line. Consumed by `CarbonBars`, `CumulativeCostChart`, and `ControlsTable`.
- **Tip** (`src/components/atoms.jsx`) — small circular "i" icon (13px, `T.SUBTLE` border) that reveals a dark tooltip on hover. Sits inline next to NF labels for unit / definition help.

### Visual conventions worth preserving

- **Editorial pairing.** Sans for content, mono for metadata and affordances. Avoid icon-driven UI; the type does the work.
- **Thin rules over cards.** All structural separation is `1px solid` in `T.INK`, `T.RULE`, or `T.SUBTLE`. No box shadows except on the modal / tooltip layer.
- **One section rhythm.** Hero + each of the three result sections share the same boundary line (`1px solid T.INK` bottom rule) and the result sections share the same internal recipe (external `SectionHead` + `padding 20px 28px` body). Don't fork into per-section variants.
- **Outlined buttons share one hover pattern.** `SectionTile`, `LinkBtn`, and the three header buttons all use the same idiom: transparent fill, 1px INK border, hover swaps the background to `T.BG_PANEL` cream over a 120ms ease. Every clickable surface in the editorial chrome therefore reads the same way.
- **Chip row → divider → fields** rhythm repeats across all four input panels for visual continuity.
- **Charts** use `T.SUBTLE` gridlines, `T.MUTED` axis labels, and `T.INK` axis lines — hierarchy keeps data foregrounded. Line widths 2.5px with terminal end-of-curve circles.
- **Carbon bars** are two-segment stacked: embodied (`_D`, darker) on the left, operational (bright) on the right, with a small swatch legend underneath. Section 07 (Controls scenarios) re-uses the idiom for its Lifecycle carbon bar group, and adds a sibling Total Cost of Ownership bar group with a single `colorA` fill — both bar groups share a tick row scaled by the same dynamic step logic as section 05.
- **Canonical comparison surfaces.** Cost is compared via the section-06 cumulative-cost chart; carbon via the section-05 stacked bars. There is no single-figure verdict — when products split metrics, surfacing the split honestly is the point. `VerdictRibbon.jsx` and the older `QuickScoreCard` two-pane scoreboard remain on disk for a possible future print / export view but are not rendered.
- **Validation banners** distinguish severity by color family: error in red (`T.ERROR`), warn in amber (`T.WARN_BD` on `T.WARN_BG`). Icon + short prefix + message. Warnings include both input-range hits (`validateInputs`) and post-calculation hits (`checkCalculationWarnings` — lifetime, replacement count, decarb horizon, payback).

## Project layout

```
src/
├── App.jsx                Root component, state, calculation orchestration, tile +
│                          modal wiring (openTile state), LinkBtn definition, the
│                          three results-section SectionHeads (05 / 06 / 07).
├── main.jsx               React bootstrap
├── styles.css             Font-face, body, scrollbar, input resets, `.hero-tiles`
│                          responsive grid (4 → 2 → 1 columns at 900 / 560 px)
├── calc/engine.js         Pure-JS calculation engine — lifetimes, replacements, energy,
│                          PV cost (incl. PV-discounted control-loan annuity), NPV,
│                          GWP, controls scenarios, two-layer validation
│                          (`validateInputs` + `checkCalculationWarnings`)
├── design/tokens.js       T color/font tokens shared by every component
├── components/
│   ├── atoms.jsx          Modal (Esc-to-close), SectionHead, Tip, Toggle
│   ├── SectionTile.jsx    Clickable hero tile — opens its corresponding input modal
│   ├── Tooltip.jsx        Cursor-anchored mono tooltip shared by all three charts
│   └── format.js          Number / currency / unit formatters
├── inputs/
│   ├── ProjectPanel.jsx   01 · Project — supports `chromeless` prop for modal rendering
│   ├── ControlsPanel.jsx  02 · Controls — `chromeless` prop; DISABLED caption when
│   │                      "No Controls" preset is active
│   ├── ProductPanel.jsx   03 / 04 · Product A and Product B — `chromeless` prop adds a
│   │                      2px accent top-rule for identity; includes CRI + UGR fields
│   ├── NumberField.jsx    Labelled numeric input with hint, error, warn states
│   ├── defaults.js        PROJECT_DEFAULTS, PRODUCT_A/B_DEFAULTS (incl. CRI / UGR),
│   │                      CTRL_DEFAULTS, PROJECT_PRESETS, PRODUCT_A_PRESETS,
│   │                      BENCHMARKS, CTRL_PRESETS, GLOSSARY (incl. CRI / UGR)
│   └── tips.js            Per-field tooltip copy (incl. CRI / UGR)
├── results/
│   ├── CarbonBars.jsx              05 · Stacked carbon bars — embodied (darker) +
│   │                                operational (brighter). Body only; section header
│   │                                supplied externally by `App.jsx`.
│   ├── CumulativeCostChart.jsx     06 · NPV-discounted cumulative cost over project
│   │                                life. X-axis ticks `y1 … y{PL}`; crossover label
│   │                                dashed; tooltip anchored to the cursor.
│   ├── ControlsTable.jsx           07 · Controls scenarios — 4-up cost KPI strip +
│   │                                3-up carbon-avoided KPI strip (same recipe) +
│   │                                Total Cost of Ownership bar group + Lifecycle
│   │                                carbon bar group + residual scenario table.
│   ├── QuickScoreCard.jsx          ⚠ orphaned — superseded two-pane scoreboard
│   ├── QuickDetailPanels.jsx       ⚠ orphaned — per-metric detail panels for the
│   │                                retired scoreboard's right pane
│   ├── VerdictRibbon.jsx           ⚠ orphaned — superseded single-figure verdict
│   ├── KPIGrid.jsx                 ⚠ orphaned
│   ├── LineItems.jsx               ⚠ orphaned
│   ├── ReplacementSchedule.jsx     ⚠ orphaned
│   └── compare.js                  ⚠ orphaned — `pctDelta` + `decideWinner`
│                                    helpers consumed only by `QuickScoreCard`
└── modals/
    ├── WelcomeModal.jsx   "Info" — auto-opens on every visit, walks the four input
    │                      tiles and the three results sections
    ├── GlossaryModal.jsx  "Glossary" — term definitions (incl. CRI / UGR)
    └── InfoModal.jsx      "Methodology" — six concept rows aligned with engine math
```

The orphan group remains on disk for a possible future print / export view but is not imported by `App.jsx`. If you ever re-introduce an NPV-consuming consumer, the engine's `aWins = npv >= 0` sign convention still holds: positive NPV = Product A preferable.

## Calculation methodology

The calculation engine implements [`Lighting_Analysis_Calculation_Documentation_v2.md`](./Lighting_Analysis_Calculation_Documentation_v2.md) — the source of truth for all formulas, constants, and validation ranges. Edits to `src/calc/engine.js` should be cross-checked against that document.

All monetary values are in AUD. Intermediate calculations use 4 decimal places; display values are rounded to 2.

The current engine reflects the audit-pass corrections logged in changelog entries #14–#18 of the methodology doc:

- `TC_control` includes `PV_loan` — the PV-discounted control-loan annuity at the project discount rate `d` — rather than the nominal `TLP = ALP × LT`. All TCO terms are now PV-consistent.
- `calculateComparisonNPV` follows the convention **positive NPV = Product A preferable** over the project life.
- `checkCalculationWarnings` runs after `runProductAnalysis` and feeds the validation banner alongside the input-range layer. Surfaced warnings: effective lifetime < 1 yr, replacement count ≥ 3, grid-decarb horizon beyond project life, controls payback exceeding the loan term or the project life.

## License

MIT — see [LICENSE](./LICENSE).
