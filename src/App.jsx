import { useState, useMemo } from 'react';
import { T, micro } from './design/tokens.js';
import { runProductAnalysis, validateInputs } from './calc/engine.js';
import {
  PROJECT_DEFAULTS, PRODUCT_A_DEFAULTS, PRODUCT_B_DEFAULTS, CTRL_DEFAULTS,
  LUM_DEFAULTS, L90_DEFAULTS, L70_DEFAULTS,
  PRODUCT_A_PRESETS, BENCHMARKS,
} from './inputs/defaults.js';
import { ProjectPanel } from './inputs/ProjectPanel.jsx';
import { ProductPanel } from './inputs/ProductPanel.jsx';
import { ControlsPanel } from './inputs/ControlsPanel.jsx';
import { L90L70InputPanel } from './inputs/L90L70InputPanel.jsx';
import { VerdictRibbon } from './results/VerdictRibbon.jsx';
import { KPIGrid } from './results/KPIGrid.jsx';
import { CarbonBars } from './results/CarbonBars.jsx';
import { CumulativeCostChart } from './results/CumulativeCostChart.jsx';
import { LineItems } from './results/LineItems.jsx';
import { ReplacementSchedule } from './results/ReplacementSchedule.jsx';
import { ControlsTable } from './results/ControlsTable.jsx';
import { SectionHead } from './components/atoms.jsx';
import { InfoModal } from './modals/InfoModal.jsx';
import { GlossaryModal } from './modals/GlossaryModal.jsx';

const MAX_W = 1320;

const linkBtn = {
  padding: '7px 12px', background: 'transparent', border: `1px solid ${T.INK}`,
  fontFamily: T.MONO, fontSize: 10, fontWeight: 500, color: T.INK,
  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
};

const sliceEqual = (a, b, keys) => keys.every(k => a[k] === b[k]);
const PROD_KEYS = ['W', 'FL', 'Q', 'LMF', 'LH', 'GWP_CG', 'GWP_EOL', 'C_SI'];
const CTRL_KEYS = ['CSC', 'CACC', 'r', 'LT'];

const promote = (r) => {
  if (!r?.ctrlResults) return r;
  const c = r.ctrlResults;
  return {
    ...r,
    E_base: c.E_control_maint,
    L_base: c.L_control_maint,
    N_replace: c.N_replace_ctrl_maint,
    TC_base: c.TC_control_maint,
    gwpBase: c.gwpCtrlMaint,
    pvEnergyTotal: c.pvEnergyTotal_maint,
    PV_replace: c.PV_replace_maint,
    replaceSchedule: c.replaceSchedule_maint,
    profile: c.profile_maint,
    emissionsProfile: c.emissionsProfile_maint,
    ctrlResults: {
      ...c,
      base: { E: r.E_base, L: r.L_base, N_replace: r.N_replace, TC: r.TC_base, gwp: r.gwpBase },
    },
  };
};

export default function App() {
  const [mode, setMode] = useState('AB');
  const [proj, setProj] = useState({ ...PROJECT_DEFAULTS });
  const [prodA, setProdA] = useState({ ...PRODUCT_A_DEFAULTS });
  const [prodB, setProdB] = useState({ ...PRODUCT_B_DEFAULTS });
  const [lum, setLum] = useState({ ...LUM_DEFAULTS });
  const [l90, setL90] = useState({ ...L90_DEFAULTS });
  const [l70, setL70] = useState({ ...L70_DEFAULTS });
  const [ctrl, setCtrl] = useState({ ...CTRL_DEFAULTS });

  const [presetA, setPresetA] = useState(null);
  const [presetB, setPresetB] = useState(null);
  const [presetCtrl, setPresetCtrl] = useState(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [glossOpen, setGlossOpen] = useState(false);

  const handlePresetA = (b) => {
    setProdA(p => ({ ...p, W: b.W, FL: b.FL, LMF: b.LMF, LH: b.LH, GWP_CG: b.GWP_CG, GWP_EOL: b.GWP_EOL, C_SI: b.C_SI }));
    setPresetA(b.id);
  };
  const handlePresetB = (b) => {
    setProdB(p => ({ ...p, W: b.W, FL: b.FL, LMF: b.LMF, LH: b.LH, GWP_CG: b.GWP_CG, GWP_EOL: b.GWP_EOL, C_SI: b.C_SI }));
    setPresetB(b.id);
  };
  const handlePresetCtrl = (p) => {
    setCtrl({ CSC: p.CSC, CACC: p.CACC, r: p.r, LT: p.LT });
    setPresetCtrl(p.id);
  };

  const handleClearA = () => { setProdA({ ...PRODUCT_A_DEFAULTS }); setPresetA(null); };
  const handleClearB = () => { setProdB({ ...PRODUCT_B_DEFAULTS }); setPresetB(null); };
  const handleClearCtrl = () => { setCtrl({ ...CTRL_DEFAULTS }); setPresetCtrl(null); };

  const canClearA = !!presetA || !sliceEqual(prodA, PRODUCT_A_DEFAULTS, PROD_KEYS);
  const canClearB = !!presetB || !sliceEqual(prodB, PRODUCT_B_DEFAULTS, PROD_KEYS);
  const canClearCtrl = !!presetCtrl || !sliceEqual(ctrl, CTRL_DEFAULTS, CTRL_KEYS);

  const switchToL90 = () => setMode('L90L70');

  const validation = useMemo(() => {
    if (mode === 'AB') {
      const p = validateInputs(proj, 'Project');
      const a = validateInputs(prodA, 'Product A');
      const b = validateInputs(prodB, 'Product B');
      return { errors: [...p.errors, ...a.errors, ...b.errors], warnings: [...p.warnings, ...a.warnings, ...b.warnings] };
    }
    const lumA = { ...lum, ...l90 };
    const lumB = { ...lum, ...l70 };
    const p = validateInputs(proj, 'Project');
    const a = validateInputs(lumA, 'L90');
    const b = validateInputs(lumB, 'L70');
    return { errors: [...p.errors, ...a.errors, ...b.errors], warnings: [...p.warnings, ...a.warnings, ...b.warnings] };
  }, [mode, proj, prodA, prodB, lum, l90, l70]);

  const hasErrors = validation.errors.length > 0;

  const { rA, rB, labelA, labelB } = useMemo(() => {
    if (hasErrors) return { rA: null, rB: null, labelA: 'A', labelB: 'B' };
    try {
      if (mode === 'AB') {
        const rawA = runProductAnalysis(proj, prodA, true, ctrl);
        const qB = { ...prodB, Q: prodB.Q || prodA.Q };
        const rawB = runProductAnalysis(proj, qB, true, ctrl);
        return { rA: promote(rawA), rB: promote(rawB), labelA: 'A', labelB: 'B' };
      }
      const lumA = { ...lum, ...l90 };
      const lumB = { ...lum, ...l70 };
      const rA = runProductAnalysis(proj, lumA, false, null);
      const rB = runProductAnalysis(proj, lumB, false, null);
      return { rA, rB, labelA: 'L90', labelB: 'L70' };
    } catch {
      return { rA: null, rB: null, labelA: 'A', labelB: 'B' };
    }
  }, [hasErrors, mode, proj, prodA, prodB, lum, l90, l70, ctrl]);

  const npv = (rA && rB) ? rB.TC_base - rA.TC_base : 0;

  const colorA = T.BLUE, colorB = T.VERM;
  const colorAd = T.BLUE_D, colorBd = T.VERM_D;

  return (
    <div style={{ minHeight: '100vh', background: T.BG, fontFamily: T.SANS, color: T.INK }}>

      <header style={{ borderBottom: `1px solid ${T.INK}`, background: T.BG }}>
        <div style={{
          maxWidth: MAX_W, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center',
          padding: '14px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: T.MONO, fontSize: 9, fontWeight: 500, color: T.MUTED, letterSpacing: '0.12em' }}>
              BLT.AU · DEMO
            </span>
            <span style={{ fontFamily: T.SANS, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Lighting Audit
            </span>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.MUTED, letterSpacing: '0.08em' }}>
              v0.5 · CRC LP · BETA
            </span>
          </div>
          <div />
          <div style={{ display: 'flex', border: `1px solid ${T.INK}` }}>
            {[{ id: 'AB', l: 'A vs B' }, { id: 'L90L70', l: 'L90 ↔ L70' }].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding: '6px 14px', border: 'none', cursor: 'pointer',
                background: mode === m.id ? T.INK : 'transparent',
                color: mode === m.id ? T.BG : T.INK,
                fontFamily: T.MONO, fontSize: 10, fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{m.l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setGlossOpen(true)} style={linkBtn}>Glossary</button>
            <button onClick={() => setInfoOpen(true)} style={linkBtn}>Methodology</button>
          </div>
        </div>
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div style={{
            background: validation.errors.length > 0 ? '#FBE9E5' : T.WARN_BG,
            borderTop: `1px solid ${T.SUBTLE}`,
          }}>
            <div style={{
              maxWidth: MAX_W, margin: '0 auto',
              padding: '6px 28px',
              display: 'flex', gap: 18, alignItems: 'center',
            }}>
              <span style={{ ...micro, color: validation.errors.length > 0 ? T.ERROR : T.WARN_BD }}>
                [ {validation.errors.length > 0
                  ? `${validation.errors.length} ERROR${validation.errors.length > 1 ? 'S' : ''}`
                  : `${validation.warnings.length} WARNING${validation.warnings.length > 1 ? 'S' : ''}`} ]
              </span>
              <span style={{ fontFamily: T.SANS, fontSize: 11, color: T.INK }}>
                {validation.errors[0] || validation.warnings[0]}
              </span>
            </div>
          </div>
        )}
      </header>

      <main style={{ maxWidth: MAX_W, margin: '0 auto' }}>

        <section style={{ borderBottom: `1px solid ${T.INK}` }}>
          {mode === 'AB' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr 1.4fr' }}>
              <ProjectPanel proj={proj} setProj={setProj} validation={validation} />
              <ControlsPanel
                ctrl={ctrl} setCtrl={setCtrl}
                presetId={presetCtrl} onPresetSelect={handlePresetCtrl}
                onClear={handleClearCtrl} canClear={canClearCtrl}
              />
              <ProductPanel
                num="A" prod={prodA} setProd={setProdA}
                accent={T.BLUE} accentLabel="PROPOSED"
                validation={validation}
                presets={PRODUCT_A_PRESETS}
                selectedPreset={presetA} onPresetSelect={handlePresetA}
                onClear={handleClearA} canClear={canClearA}
                onSwitchMode={switchToL90}
              />
              <ProductPanel
                num="B" prod={prodB} setProd={setProdB}
                accent={T.VERM} accentLabel="BENCHMARK"
                validation={validation}
                presets={BENCHMARKS}
                selectedPreset={presetB} onPresetSelect={handlePresetB}
                onClear={handleClearB} canClear={canClearB}
                onSwitchMode={switchToL90}
                last
              />
            </div>
          ) : (
            <L90L70InputPanel
              proj={proj} setProj={setProj}
              lum={lum} setLum={setLum}
              l90={l90} setL90={setL90}
              l70={l70} setL70={setL70}
            />
          )}
        </section>

        <section>
          <VerdictRibbon rA={rA} rB={rB} npv={npv} PL={proj.PL} labelA={labelA} labelB={labelB} />
          <KPIGrid rA={rA} rB={rB} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          <CarbonBars rA={rA} rB={rB} labelA={labelA} labelB={labelB}
                      colorA={colorA} colorB={colorB} colorAd={colorAd} colorBd={colorBd} />
          <SectionHead idx="06" title="Cumulative cost — Net Present Value" right="[ AUD · DISCOUNTED ]" />
          <CumulativeCostChart rA={rA} rB={rB} PL={proj.PL} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          <LineItems rA={rA} rB={rB} PL={proj.PL} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          <ReplacementSchedule rA={rA} rB={rB} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          {mode === 'AB' && (
            <ControlsTable rA={rA} rB={rB} ctrl={ctrl} PL={proj.PL} />
          )}
          <footer style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: 18 }}>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.MUTED, letterSpacing: '0.06em', lineHeight: 1.7 }}>
              CALCULATIONS PER CRC LP METHODOLOGY · TCO INCL. CAPITAL, ENERGY, REPLACEMENTS · GWP INCL. EMBODIED + OPERATIONAL · GRID DECARBONISATION APPLIED LINEARLY · NPV USES DISCOUNT RATE NET OF INFLATION · NOT FOR CERTIFICATION
            </span>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.MUTED }}>© BUILT 2025</span>
          </footer>
        </section>
      </main>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <GlossaryModal open={glossOpen} onClose={() => setGlossOpen(false)} />
    </div>
  );
}
