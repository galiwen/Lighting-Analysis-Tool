import { useState, useMemo } from 'react';
import { T, micro } from './design/tokens.js';
import { runProductAnalysis, validateInputs, calculateComparisonNPV } from './calc/engine.js';
import {
  PROJECT_DEFAULTS, PRODUCT_A_DEFAULTS, PRODUCT_B_DEFAULTS, CTRL_DEFAULTS,
  PRODUCT_A_PRESETS, BENCHMARKS, PROJECT_PRESETS,
} from './inputs/defaults.js';
import { ProjectPanel } from './inputs/ProjectPanel.jsx';
import { ProductPanel } from './inputs/ProductPanel.jsx';
import { ControlsPanel } from './inputs/ControlsPanel.jsx';
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
import { WelcomeModal } from './modals/WelcomeModal.jsx';

const MAX_W = 1320;

const linkBtn = {
  padding: '7px 12px', background: 'transparent', border: `1px solid ${T.INK}`,
  fontFamily: T.MONO, fontSize: 10, fontWeight: 500, color: T.INK,
  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
};

const sliceEqual = (a, b, keys) => keys.every(k => a[k] === b[k]);
const PROJ_KEYS = ['OH', 'PL', 'ER', 'GF_0', 'GD', 'GDT', 'i', 'd'];
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
    ctrlResults: c,
  };
};

export default function App() {
  const [proj, setProj] = useState({ ...PROJECT_DEFAULTS });
  const [prodA, setProdA] = useState({ ...PRODUCT_A_DEFAULTS });
  const [prodB, setProdB] = useState({ ...PRODUCT_B_DEFAULTS });
  const [ctrl, setCtrl] = useState({ ...CTRL_DEFAULTS });

  const [presetProj, setPresetProj] = useState(null);
  const [presetA, setPresetA] = useState(null);
  const [presetB, setPresetB] = useState(null);
  const [presetCtrl, setPresetCtrl] = useState(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [glossOpen, setGlossOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const handlePresetProj = (p) => {
    setProj(prev => ({ ...prev, OH: p.OH, PL: p.PL, ER: p.ER }));
    setPresetProj(p.id);
  };
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

  const handleClearProj = () => { setProj({ ...PROJECT_DEFAULTS }); setPresetProj(null); };
  const handleClearA = () => { setProdA({ ...PRODUCT_A_DEFAULTS }); setPresetA(null); };
  const handleClearB = () => { setProdB({ ...PRODUCT_B_DEFAULTS }); setPresetB(null); };
  const handleClearCtrl = () => { setCtrl({ ...CTRL_DEFAULTS }); setPresetCtrl(null); };

  const canClearProj = !!presetProj || !sliceEqual(proj, PROJECT_DEFAULTS, PROJ_KEYS);
  const canClearA = !!presetA || !sliceEqual(prodA, PRODUCT_A_DEFAULTS, PROD_KEYS);
  const canClearB = !!presetB || !sliceEqual(prodB, PRODUCT_B_DEFAULTS, PROD_KEYS);
  const canClearCtrl = !!presetCtrl || !sliceEqual(ctrl, CTRL_DEFAULTS, CTRL_KEYS);

  const validation = useMemo(() => {
    const p = validateInputs(proj, 'Project');
    const a = validateInputs(prodA, 'Product A');
    const b = validateInputs(prodB, 'Product B');
    return { errors: [...p.errors, ...a.errors, ...b.errors], warnings: [...p.warnings, ...a.warnings, ...b.warnings] };
  }, [proj, prodA, prodB]);

  const hasErrors = validation.errors.length > 0;

  const labelA = 'A';
  const labelB = 'B';
  const controlsEnabled = presetCtrl !== 'none';

  const { rA, rB, npv } = useMemo(() => {
    if (hasErrors) return { rA: null, rB: null, npv: 0 };
    try {
      const rawA = runProductAnalysis(proj, prodA, controlsEnabled, ctrl);
      const qB = { ...prodB, Q: prodB.Q || prodA.Q };
      const rawB = runProductAnalysis(proj, qB, controlsEnabled, ctrl);
      const pA = promote(rawA);
      const pB = promote(rawB);
      const npv = calculateComparisonNPV(
        { C_initial: pB.C_initial, E_base: pB.E_base, PV_replace: pB.PV_replace },
        { C_initial: pA.C_initial, E_base: pA.E_base, PV_replace: pA.PV_replace },
        proj.d, proj.PL, proj.ER, proj.i
      );
      return { rA: pA, rB: pB, npv };
    } catch {
      return { rA: null, rB: null, npv: 0 };
    }
  }, [hasErrors, proj, prodA, prodB, ctrl, controlsEnabled]);

  const colorA = T.BLUE, colorB = T.VERM;
  const colorAd = T.BLUE_D, colorBd = T.VERM_D;

  return (
    <div style={{ minHeight: '100vh', background: T.BG, fontFamily: T.SANS, color: T.INK }}>

      <header style={{ borderBottom: `1px solid ${T.INK}`, background: T.BG }}>
        <div style={{
          maxWidth: MAX_W, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center',
          padding: '14px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: T.SANS, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Lighting Carbon And Cost Comparison Tool
            </span>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.MUTED, letterSpacing: '0.08em' }}>
              v0.5 - Demo - Built by Dimitrios Tsiokaras
            </span>
          </div>
          <div />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setWelcomeOpen(true)} style={linkBtn}>Info</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <ProjectPanel
              proj={proj} setProj={setProj} validation={validation}
              presets={PROJECT_PRESETS}
              selectedPreset={presetProj} onPresetSelect={handlePresetProj}
              onClear={handleClearProj} canClear={canClearProj}
            />
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
            />
            <ProductPanel
              num="B" prod={prodB} setProd={setProdB}
              accent={T.VERM} accentLabel="BENCHMARK"
              validation={validation}
              presets={BENCHMARKS}
              selectedPreset={presetB} onPresetSelect={handlePresetB}
              onClear={handleClearB} canClear={canClearB}
              last
            />
          </div>
        </section>

        <section>
          <VerdictRibbon rA={rA} rB={rB} npv={npv} PL={proj.PL} labelA={labelA} labelB={labelB} controlsActive={controlsEnabled} />
          <KPIGrid rA={rA} rB={rB} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} controlsActive={controlsEnabled} />
          <CarbonBars rA={rA} rB={rB} labelA={labelA} labelB={labelB}
                      colorA={colorA} colorB={colorB} colorAd={colorAd} colorBd={colorBd} />
          <SectionHead idx="06" title="Cumulative cost — Net Present Value" right="[ AUD · DISCOUNTED ]" />
          <CumulativeCostChart rA={rA} rB={rB} PL={proj.PL} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          <LineItems rA={rA} rB={rB} PL={proj.PL} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          <ReplacementSchedule rA={rA} rB={rB} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
          {controlsEnabled && <ControlsTable rA={rA} ctrl={ctrl} PL={proj.PL} />}
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
      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
    </div>
  );
}
