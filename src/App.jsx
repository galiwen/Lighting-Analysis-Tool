import { useState, useMemo } from 'react';
import { T } from './design/tokens.js';
import { runProductAnalysis, calculateComparisonNPV, validateInputs } from './calc/engine.js';
import { PROJECT_DEFAULTS, PRODUCT_A_DEFAULTS, PRODUCT_B_DEFAULTS, CTRL_DEFAULTS } from './inputs/defaults.js';
import { ProjectPanel } from './inputs/ProjectPanel.jsx';
import { ProductPanel } from './inputs/ProductPanel.jsx';
import { ControlsPanel } from './inputs/ControlsPanel.jsx';
import { L90L70InputPanel } from './inputs/L90L70InputPanel.jsx';
import { ABSummary } from './results/ABSummary.jsx';
import { GWPTab } from './results/GWPTab.jsx';
import { ControlsTab } from './results/ControlsTab.jsx';
import { FinancialTab } from './results/FinancialTab.jsx';
import { L90L70Results } from './results/L90L70Results.jsx';
import { InfoModal } from './modals/InfoModal.jsx';

export default function App() {
  const [mode, setMode] = useState('ab');
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [benchmarkId, setBenchmarkId] = useState(null);

  const handleBenchmarkSelect = (b) => {
    setProdB(p => ({ ...p, W: b.W, FL: b.FL, LMF: b.LMF, LH: b.LH, GWP_CG: b.GWP_CG, GWP_EOL: b.GWP_EOL, C_SI: b.C_SI }));
    setBenchmarkId(b.id);
  };

  const [proj, setProj] = useState({ ...PROJECT_DEFAULTS });
  const [prodA, setProdA] = useState({ ...PRODUCT_A_DEFAULTS });
  const [prodB, setProdB] = useState({ ...PRODUCT_B_DEFAULTS });
  const [ctrl, setCtrl] = useState({ ...CTRL_DEFAULTS });
  const [lum, setLum] = useState({ W: 28, FL: 3200, Q: 500, GWP_CG: 18, GWP_EOL: 2.0, C_SI: 320 });
  const [l90, setL90] = useState({ LMF: 0.90, LH: 40000 });
  const [l70, setL70] = useState({ LMF: 0.70, LH: 60000 });

  const validation = useMemo(() => ({
    project:  validateInputs(proj,  'Project'),
    productA: validateInputs(prodA, 'Product A'),
    productB: validateInputs(prodB, 'Product B'),
  }), [proj, prodA, prodB]);

  const hasErrors = validation.project.errors.length > 0
    || validation.productA.errors.length > 0
    || validation.productB.errors.length > 0;

  const computation = useMemo(() => {
    if (hasErrors) return { results: null, error: null };
    try {
      if (mode === 'ab') {
        const rA = runProductAnalysis(proj, prodA, controlsEnabled, ctrl);
        const qB = { ...prodB, Q: prodB.Q || prodA.Q };
        const rB = runProductAnalysis(proj, qB, controlsEnabled, ctrl);
        const npv = calculateComparisonNPV(
          { C_initial: rA.C_initial, E_base: rA.E_base, PV_replace: rA.PV_replace },
          { C_initial: rB.C_initial, E_base: rB.E_base, PV_replace: rB.PV_replace },
          proj.d, proj.PL, proj.ER, proj.i
        );
        return { results: { mode: 'ab', rA, rB, npv }, error: null };
      } else {
        const prod90 = { ...lum, LMF: l90.LMF, LH: l90.LH };
        const prod70 = { ...lum, LMF: l70.LMF, LH: l70.LH };
        const r90 = runProductAnalysis(proj, prod90, false, null);
        const r70 = runProductAnalysis(proj, prod70, false, null);
        r90.LMF_used = l90.LMF; r90.LH_used = l90.LH;
        r70.LMF_used = l70.LMF; r70.LH_used = l70.LH;
        const npv = calculateComparisonNPV(
          { C_initial: r90.C_initial, E_base: r90.E_base, PV_replace: r90.PV_replace },
          { C_initial: r70.C_initial, E_base: r70.E_base, PV_replace: r70.PV_replace },
          proj.d, proj.PL, proj.ER, proj.i
        );
        return { results: { mode: 'l90l70', r90, r70, npv }, error: null };
      }
    } catch (e) {
      return { results: null, error: e.message || 'Calculation error — check inputs' };
    }
  }, [mode, proj, prodA, prodB, ctrl, lum, l90, l70, controlsEnabled, hasErrors]);

  const results = computation.results;
  const calcError = computation.error;

  const switchToL90 = () => { setMode('l90l70'); };

  const rA = results?.mode === 'ab' ? results.rA : null;
  const rB = results?.mode === 'ab' ? results.rB : null;
  const r90 = results?.mode === 'l90l70' ? results.r90 : null;
  const r70 = results?.mode === 'l90l70' ? results.r70 : null;

  return (
    <div style={{ minHeight: '100vh', background: T.warm, display: 'flex', flexDirection: 'column' }}>

      <div style={{ background: T.c900, flexShrink: 0, borderBottom: `1px solid ${T.c700}` }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px 10px' }}>
          <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.white }}>
            Lighting Analysis Tool
          </span>
          <button
            onClick={() => setInfoOpen(true)}
            title="About this tool"
            style={{
              padding: '3px 10px', border: `1px solid ${T.c400}`, background: 'none',
              fontFamily: T.font, fontSize: 9, fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.c200, cursor: 'pointer',
            }}
          >Info</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', paddingLeft: 20, gap: 0 }}>
          {[['ab', 'Product A vs B'], ['l90l70', 'L90 vs L70']].map(([id, lbl]) => (
            <button key={id} onClick={() => setMode(id)} style={{
              padding: '8px 20px', background: 'none', border: 'none',
              borderBottom: `2px solid ${mode === id ? T.amber : 'transparent'}`,
              fontFamily: T.font, fontWeight: 500, fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: mode === id ? T.amber : T.c100, cursor: 'pointer',
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1200, width: '100%', margin: '0 auto', padding: 20, gap: 12 }}>

        <div style={{ background: T.white, border: `1px solid ${T.c100}` }}>
          {mode === 'ab' ? (
            <>
              <ProjectPanel proj={proj} setProj={setProj} validation={validation} />
              <div style={{ borderTop: `1px solid ${T.c100}`, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ borderRight: `1px solid ${T.c100}` }}>
                  <ProductPanel
                    num="A" title="Product A"
                    prod={prodA} setProd={setProdA}
                    result={rA}
                    onSwitchMode={switchToL90}
                    validation={validation.productA}
                  />
                </div>
                <div>
                  <ProductPanel
                    num="B" title="Product B"
                    prod={prodB} setProd={setProdB}
                    result={rB}
                    selectedBenchmark={benchmarkId}
                    onBenchmarkSelect={handleBenchmarkSelect}
                    onSwitchMode={switchToL90}
                    validation={validation.productB}
                  />
                </div>
              </div>
              <ControlsPanel
                ctrl={ctrl} setCtrl={setCtrl}
                enabled={controlsEnabled}
                onToggle={setControlsEnabled}
              />
            </>
          ) : (
            <L90L70InputPanel
              proj={proj} setProj={setProj}
              lum={lum} setLum={setLum}
              l90={l90} setL90={setL90}
              l70={l70} setL70={setL70}
              projValidation={validation.project}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 16px', background: T.white, border: `1px solid ${T.c100}` }}>
          {hasErrors
            ? <span style={{ fontFamily: T.font, fontSize: 9, color: T.error, letterSpacing: '0.06em' }}>⚠ Fix input errors to update analysis</span>
            : calcError
              ? <span style={{ fontFamily: T.font, fontSize: 9, color: T.error, letterSpacing: '0.06em' }}>{calcError}</span>
              : results
                ? <span style={{ fontFamily: T.font, fontSize: 9, color: T.c300, letterSpacing: '0.06em' }}>Analysis complete — Currency: AUD</span>
                : <span style={{ fontFamily: T.font, fontSize: 9, color: T.c300, letterSpacing: '0.06em' }}>Currency: AUD</span>}
        </div>

        {mode === 'ab' && (
          <div style={{ background: T.white, border: `1px solid ${T.c100}`, padding: 20 }}>
            <ABSummary rA={rA} rB={rB} proj={proj} npv={results?.npv} />

            <div style={{ borderTop: `1px solid ${T.c100}`, marginTop: 4, paddingTop: 20 }}>
              <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, marginBottom: 12 }}>Carbon (GWP)</div>
              <GWPTab rA={rA} rB={rB} proj={proj} />
            </div>

            <div style={{ borderTop: `1px solid ${T.c100}`, marginTop: 20, paddingTop: 20 }}>
              <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, marginBottom: 12 }}>Financial</div>
              <FinancialTab rA={rA} rB={rB} proj={proj} npv={results?.npv} />
            </div>

            {controlsEnabled && rA?.ctrlResults && rB?.ctrlResults && (
              <div style={{ borderTop: `1px solid ${T.c100}`, marginTop: 20, paddingTop: 20 }}>
                <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, marginBottom: 12 }}>Controls</div>
                <ControlsTab rA={rA} rB={rB} proj={proj} ctrl={ctrl} />
              </div>
            )}
          </div>
        )}

        {mode === 'l90l70' && (
          <div style={{ background: T.white, border: `1px solid ${T.c100}` }}>
            <L90L70Results r90={r90} r70={r70} proj={proj} npv={results?.npv} />
          </div>
        )}
      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
