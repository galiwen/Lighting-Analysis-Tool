import { useState, useMemo, useCallback } from 'react';
import { T } from './design/tokens.js';
import { runProductAnalysis, calculateComparisonNPV, validateInputs } from './calc/engine.js';
import { PROJECT_DEFAULTS, PRODUCT_A_DEFAULTS, PRODUCT_B_DEFAULTS, CTRL_DEFAULTS } from './inputs/defaults.js';
import { ProjectPanel } from './inputs/ProjectPanel.jsx';
import { ProductPanel } from './inputs/ProductPanel.jsx';
import { ControlsPanel } from './inputs/ControlsPanel.jsx';
import { L90L70InputPanel } from './inputs/L90L70InputPanel.jsx';
import { BenchmarkModal } from './inputs/BenchmarkModal.jsx';
import { ABSummary } from './results/ABSummary.jsx';
import { GWPTab } from './results/GWPTab.jsx';
import { ControlsTab } from './results/ControlsTab.jsx';
import { FinancialTab } from './results/FinancialTab.jsx';
import { L90L70Results } from './results/L90L70Results.jsx';
import { InfoModal } from './modals/InfoModal.jsx';

export default function App() {
  const [mode, setMode] = useState('ab');
  const [activeTab, setActiveTab] = useState('gwp');
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [results, setResults] = useState(null);
  const [calcErrors, setCalcErrors] = useState([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [benchmarkLabel, setBenchmarkLabel] = useState(null);

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

  const calculate = useCallback(() => {
    setCalcErrors([]);
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
        setResults({ mode: 'ab', rA, rB, npv });
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
        setResults({ mode: 'l90l70', r90, r70, npv });
      }
    } catch (e) {
      setCalcErrors([e.message || 'Calculation error — check inputs']);
    }
  }, [mode, proj, prodA, prodB, ctrl, lum, l90, l70, controlsEnabled]);

  const switchToL90 = () => { setMode('l90l70'); setResults(null); };

  const abTabs = [
    { id: 'gwp',       label: '1. GWP / Emissions' },
    { id: 'controls',  label: '2. Controls' },
    { id: 'financial', label: '3. Financial' },
  ];

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
            <button key={id} onClick={() => { setMode(id); setResults(null); }} style={{
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div style={{ borderRight: `1px solid ${T.c100}` }}>
                  <ProjectPanel proj={proj} setProj={setProj} validation={validation} />
                </div>
                <div style={{ borderRight: `1px solid ${T.c100}` }}>
                  <ProductPanel
                    num="A" title="Product A"
                    prod={prodA} setProd={setProdA}
                    result={rA}
                    isBenchmark={false}
                    onSwitchMode={switchToL90}
                    validation={validation.productA}
                  />
                </div>
                <div>
                  <ProductPanel
                    num="B" title="Product B"
                    prod={prodB} setProd={setProdB}
                    result={rB}
                    isBenchmark={true}
                    benchmarkLabel={benchmarkLabel}
                    onSwitchMode={switchToL90}
                    onBenchmarkClick={() => setBenchmarkOpen(true)}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', background: T.white, border: `1px solid ${T.c100}` }}>
          <button
            onClick={calculate}
            disabled={hasErrors}
            style={{
              padding: '9px 24px',
              background: hasErrors ? T.c300 : T.c800,
              color: T.white, border: 'none',
              fontFamily: T.font, fontWeight: 500, fontSize: 9,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              cursor: hasErrors ? 'not-allowed' : 'pointer',
            }}
          >
            {mode === 'ab' ? 'Calculate Analysis' : 'Compare L90 vs L70'} ▶
          </button>
          {hasErrors && <span style={{ fontFamily: T.font, fontSize: 9, color: T.error, letterSpacing: '0.06em' }}>Fix input errors before calculating</span>}
          {calcErrors.map((e, i) => <span key={i} style={{ fontFamily: T.font, fontSize: 9, color: T.error }}>{e}</span>)}
          {!hasErrors && !results && <span style={{ fontFamily: T.font, fontSize: 9, color: T.c300, letterSpacing: '0.06em' }}>All calculations run client-side · Currency: AUD</span>}
          {results && <span style={{ fontFamily: T.font, fontSize: 9, color: T.success, letterSpacing: '0.06em' }}>✓ Analysis complete</span>}
        </div>

        {mode === 'ab' && (
          <div style={{ background: T.white, border: `1px solid ${T.c100}`, display: 'grid', gridTemplateColumns: '460px 1fr', minHeight: 300 }}>
            <div style={{ borderRight: `1px solid ${T.c100}`, padding: 20, overflowY: 'auto' }}>
              <ABSummary rA={rA} rB={rB} proj={proj} npv={results?.npv} />
            </div>
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.c100}`, marginBottom: 20 }}>
                {abTabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    padding: '8px 16px', background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeTab === t.id ? T.c800 : 'transparent'}`,
                    fontFamily: T.font, fontWeight: 500, fontSize: 9,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: activeTab === t.id ? T.c800 : T.c300, cursor: 'pointer',
                  }}>{t.label}</button>
                ))}
              </div>
              {activeTab === 'gwp'      && <GWPTab rA={rA} rB={rB} proj={proj} />}
              {activeTab === 'controls' && <ControlsTab rA={rA} rB={rB} proj={proj} ctrl={ctrl} controlsEnabled={controlsEnabled} onToggleControls={() => setControlsEnabled(true)} />}
              {activeTab === 'financial'&& <FinancialTab rA={rA} rB={rB} proj={proj} npv={results?.npv} />}
            </div>
          </div>
        )}

        {mode === 'l90l70' && (
          <div style={{ background: T.white, border: `1px solid ${T.c100}` }}>
            <L90L70Results r90={r90} r70={r70} proj={proj} npv={results?.npv} />
          </div>
        )}
      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <BenchmarkModal
        open={benchmarkOpen}
        onClose={() => setBenchmarkOpen(false)}
        currentQ={prodB.Q || prodA.Q}
        onSelect={preset => {
          setProdB(p => ({ ...p, W: preset.W, FL: preset.FL, LMF: preset.LMF, LH: preset.LH, GWP_CG: preset.GWP_CG, GWP_EOL: preset.GWP_EOL, C_SI: preset.C_SI }));
          setBenchmarkLabel(preset.label);
        }}
      />
    </div>
  );
}
