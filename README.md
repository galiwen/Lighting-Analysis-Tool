# Lighting Analysis Tool

Compare the environmental and financial performance of luminaire products over a project's full lifecycle. All calculations run client-side; no data is sent to any server.

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

The built bundle uses relative asset paths (`./assets/…`) and absolute font paths (`/fonts/…`), so it works as-is on any host that serves `dist/` from the domain root (Vercel, Netlify, GitHub Pages with a custom domain). If deploying to a subpath (e.g. `https://user.github.io/Lighting-Analysis-Tool/`), update `base` in `vite.config.js` and the `@font-face` `url(…)` paths in `src/styles.css`.

## Project layout

```
src/
├── App.jsx              Root component, top-bar tabs, calculation orchestration
├── main.jsx             React bootstrap
├── styles.css           Font-face, body, scrollbar, input resets
├── calc/engine.js       Pure-JS calculation engine (lifecycle GWP, PV cost, NPV)
├── design/tokens.js     `T` color/font tokens shared by every component
├── components/          Atoms (Field, Modal, Toggle, Collapse…) + custom SVG charts + format helpers
├── inputs/              Input panels (Project, Product, Controls, L90/L70) + defaults + tooltips
├── results/             Result panels (AB Summary, GWP / Controls / Financial tabs, L90/L70 results)
└── modals/InfoModal.jsx The "About this tool" dialog
```

## Calculation methodology

The calculation engine implements [`Lighting_Analysis_Calculation_Documentation_v2.md`](./Lighting_Analysis_Calculation_Documentation_v2.md) — the source of truth for all formulas, constants, and validation ranges. Edits to `src/calc/engine.js` should be cross-checked against that document.

All monetary values are in AUD. Intermediate calculations use 4 decimal places; display values are rounded to 2.

## License

MIT — see [LICENSE](./LICENSE).
