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
| `BG_PANEL` | `#F4F1E8` | Modal headers, verdict ribbon |
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

- Page structure: header (title + Info / Glossary / Methodology buttons) → optional validation banner → 4-column input row → stacked result sections → footer disclaimer.
- Max content width is 1320px, centered.
- Sections are numbered: `01 · Project`, `02 · Controls`, `03 · Product A`, `04 · Product B`, `05 · KPIs`, `06 · NPV chart`, `09 · Controls scenarios`. The number renders in `T.MUTED`, separated from the title by a bullet.
- Vertical column dividers are `1px solid T.SUBTLE`. Horizontal section rules are `1px solid T.INK` (or `T.RULE` where a slightly lighter bar reads better).
- Every input panel follows the same three-step vertical rhythm:
  1. Section header — title on the left, a `micro` tag on the right (`SHARED` / `PROJECT-LEVEL` / `PRODUCT-LEVEL`).
  2. Preset chip row plus `× CLEAR`, separated below by a thin rule.
  3. Stacked `NumberField` rows.

### Component vocabulary

- **Preset chip** — small rectangular button (`3px × 8px` padding), MONO 9px uppercase with 0.06em spacing. Active: filled `T.INK` background with `T.BG` text. Inactive: transparent with `T.SUBTLE` border and `T.MUTED` text.
- **× CLEAR** — borderless trailing button at `marginLeft: auto` in the chip row. MONO 9px uppercase. Color is `T.VERM` when something is dirty, `T.SUBTLE` when there is nothing to clear.
- **Section micro-tag** — `micro` style, right-aligned in the panel header. Communicates scope (`SHARED` / `PROJECT-LEVEL` / `PRODUCT-LEVEL`) without competing with the title.
- **NumberField (`NF`)** — micro label on top with an optional `Tip` "i" icon, mono 13px right-aligned input, optional unit suffix. States: error (`T.ERROR` border + icon + message), warn (`T.WARN_BD`), focus (border darkens to `T.INK`), hint below in `microSm`. Numeric value color follows the panel `accent` (BLUE / VERM / INK).
- **Modal** (`src/components/atoms.jsx`) — fixed centered, default 620px width (configurable), 1px `T.INK` border, `T.BG_PANEL` header bar with title (SANS bold) + "✕ CLOSE" button (INK bg, BG text, MONO 10px), 0.65 dark backdrop. Used by the Welcome, Glossary, and Methodology dialogs.
- **SectionHead** (`src/components/atoms.jsx`) — shared header for results sections: `idx · title` on the left, optional uppercase `micro` meta on the right, `borderBottom 1px T.INK`.
- **Verdict ribbon** — full-width strip with `T.BG_PANEL` background. `[ VERDICT ]` micro tag on the left, winning product name colored in its accent, NPV value mono right-aligned.
- **Tip** — small circular "i" icon (13px, `T.SUBTLE` border) that reveals a dark tooltip on hover. Sits inline next to NF labels for unit/definition help.

### Visual conventions worth preserving

- **Editorial pairing.** Sans for content, mono for metadata and affordances. Avoid icon-driven UI; the type does the work.
- **Thin rules over cards.** All structural separation is `1px solid` in `T.INK`, `T.RULE`, or `T.SUBTLE`. No box shadows except on the modal/tooltip layer.
- **Chip row → divider → fields** rhythm repeats across all four input panels for visual continuity.
- **Charts** use `T.SUBTLE` gridlines, `T.MUTED` axis labels, and `T.INK` axis lines — hierarchy keeps data foregrounded. Line widths 2.5px with terminal end-of-curve circles.
- **Carbon bars** are two-segment stacked: embodied (`_D`, darker) on the left, operational (bright) on the right, with a small swatch legend underneath.
- **Validation banners** distinguish severity by color family: error in red (`T.ERROR`), warn in amber (`T.WARN_BD` on `T.WARN_BG`). Icon + short prefix + message.

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
