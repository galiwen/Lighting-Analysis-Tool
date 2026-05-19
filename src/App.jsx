import { useState, useMemo } from 'react';
import { T, micro } from './design/tokens.js';
import { runProductAnalysis, validateInputs, checkCalculationWarnings } from './calc/engine.js';
import {
  PROJECT_DEFAULTS, PRODUCT_A_DEFAULTS, PRODUCT_B_DEFAULTS, CTRL_DEFAULTS,
  PRODUCT_A_PRESETS, BENCHMARKS, PROJECT_PRESETS, CTRL_PRESETS,
} from './inputs/defaults.js';
import { ProjectPanel } from './inputs/ProjectPanel.jsx';
import { ProductPanel } from './inputs/ProductPanel.jsx';
import { ControlsPanel } from './inputs/ControlsPanel.jsx';
import { CarbonBars } from './results/CarbonBars.jsx';
import { CumulativeCostChart } from './results/CumulativeCostChart.jsx';
import { ControlsTable } from './results/ControlsTable.jsx';
import { SectionHead, Modal } from './components/atoms.jsx';
import { SectionTile } from './components/SectionTile.jsx';
import { InfoModal } from './modals/InfoModal.jsx';
import { GlossaryModal } from './modals/GlossaryModal.jsx';
import { WelcomeModal } from './modals/WelcomeModal.jsx';

const MAX_W = 1320;

const linkBtnBase = {
  padding: '7px 12px', border: `1px solid ${T.INK}`,
  fontFamily: T.MONO, fontSize: 10, fontWeight: 500, color: T.INK,
  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
  transition: 'background 120ms ease',
};

const LinkBtn = ({ onClick, children }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...linkBtnBase, background: hover ? T.BG_PANEL : 'transparent' }}
    >
      {children}
    </button>
  );
};

const sliceEqual = (a, b, keys) => keys.every(k => a[k] === b[k]);
const PROJ_KEYS = ['OH', 'PL', 'ER', 'GF_0', 'GD', 'GDT', 'i', 'd'];
const PROD_KEYS = ['W', 'FL', 'Q', 'LMF', 'LH', 'GWP_CG', 'GWP_EOL', 'C_SI', 'CRI', 'UGR'];
const CTRL_KEYS = ['CSC', 'CACC', 'r', 'LT'];

const presetLabel = (list, id) => {
  const found = list.find(p => p.id === id);
  return found ? found.label.toUpperCase() : null;
};

const summaryLine = { fontFamily: T.MONO, fontSize: 10, color: T.INK, letterSpacing: '0.04em', lineHeight: 1.7 };
const summaryMuted = { ...summaryLine, color: T.MUTED };
const summaryHeadline = { fontFamily: T.SANS, fontSize: 12, fontWeight: 600, color: T.INK, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.4 };

const ProjectTileBody = ({ proj, presetId }) => {
  const label = presetLabel(PROJECT_PRESETS, presetId);
  return (
    <div>
      <div style={label ? summaryHeadline : { ...summaryHeadline, color: T.MUTED }}>
        {label || '[ CUSTOM ]'}
      </div>
      <div style={{ ...summaryLine, marginTop: 6 }}>
        {proj.OH.toLocaleString()} HR/YR · {proj.PL} YR
      </div>
      <div style={summaryLine}>
        ER ${Number(proj.ER).toFixed(2)}/kWh
      </div>
    </div>
  );
};

const ControlsTileBody = ({ ctrl, presetId }) => {
  const label = presetLabel(CTRL_PRESETS, presetId);
  const disabled = presetId === 'none';
  return (
    <div>
      <div style={label ? summaryHeadline : { ...summaryHeadline, color: T.MUTED }}>
        {label || '[ CUSTOM ]'}
      </div>
      <div style={{ ...(disabled ? summaryMuted : summaryLine), marginTop: 6 }}>
        {disabled ? 'DISABLED' : `CSC ${Number(ctrl.CSC).toFixed(2)} · CACC ${Number(ctrl.CACC).toFixed(2)}`}
      </div>
    </div>
  );
};

const ProductTileBody = ({ prod, presetId, presets }) => {
  const label = presetLabel(presets, presetId);
  return (
    <div>
      <div style={label ? summaryHeadline : { ...summaryHeadline, color: T.MUTED }}>
        {label || '[ CUSTOM ]'}
      </div>
      <div style={{ ...summaryLine, marginTop: 6 }}>
        {prod.W} W · {Number(prod.FL).toLocaleString()} lm · ×{prod.Q}
      </div>
      <div style={summaryLine}>
        LMF {Number(prod.LMF).toFixed(2)} · LH {Number(prod.LH).toLocaleString()} h
      </div>
    </div>
  );
};

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

  const [openTile, setOpenTile] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [glossOpen, setGlossOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const handlePresetProj = (p) => {
    setProj(prev => ({ ...prev, OH: p.OH, PL: p.PL, ER: p.ER }));
    setPresetProj(p.id);
  };
  const handlePresetA = (b) => {
    setProdA(p => ({ ...p, W: b.W, FL: b.FL, LMF: b.LMF, LH: b.LH, GWP_CG: b.GWP_CG, GWP_EOL: b.GWP_EOL, C_SI: b.C_SI, CRI: b.CRI, UGR: b.UGR }));
    setPresetA(b.id);
  };
  const handlePresetB = (b) => {
    setProdB(p => ({ ...p, W: b.W, FL: b.FL, LMF: b.LMF, LH: b.LH, GWP_CG: b.GWP_CG, GWP_EOL: b.GWP_EOL, C_SI: b.C_SI, CRI: b.CRI, UGR: b.UGR }));
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

  const inputValidation = useMemo(() => {
    const p = validateInputs(proj, 'Project');
    const a = validateInputs(prodA, 'Product A');
    const b = validateInputs(prodB, 'Product B');
    return { errors: [...p.errors, ...a.errors, ...b.errors], warnings: [...p.warnings, ...a.warnings, ...b.warnings] };
  }, [proj, prodA, prodB]);

  const hasErrors = inputValidation.errors.length > 0;

  const labelA = 'A';
  const labelB = 'B';
  const controlsEnabled = presetCtrl !== 'none';

  const { rA, rB } = useMemo(() => {
    if (hasErrors) return { rA: null, rB: null };
    try {
      const rawA = runProductAnalysis(proj, prodA, controlsEnabled, ctrl);
      const qB = { ...prodB, Q: prodB.Q || prodA.Q };
      const rawB = runProductAnalysis(proj, qB, controlsEnabled, ctrl);
      return { rA: promote(rawA), rB: promote(rawB) };
    } catch {
      return { rA: null, rB: null };
    }
  }, [hasErrors, proj, prodA, prodB, ctrl, controlsEnabled]);

  const calcWarnings = useMemo(() => {
    if (!rA || !rB) return [];
    const aw = checkCalculationWarnings(rA, proj.PL, proj.GDT, rA.ctrlResults);
    const bw = checkCalculationWarnings(rB, proj.PL, proj.GDT, rB.ctrlResults);
    const aSet = new Set(aw);
    const bSet = new Set(bw);
    const out = [];
    for (const w of aw) if (bSet.has(w) && !out.includes(w)) out.push(w);
    for (const w of aw) if (!bSet.has(w)) out.push(`${labelA}: ${w}`);
    for (const w of bw) if (!aSet.has(w)) out.push(`${labelB}: ${w}`);
    return out;
  }, [rA, rB, proj.PL, proj.GDT]);

  const validation = useMemo(() => ({
    errors: inputValidation.errors,
    warnings: [...inputValidation.warnings, ...calcWarnings],
  }), [inputValidation, calcWarnings]);

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
            <LinkBtn onClick={() => setWelcomeOpen(true)}>Info</LinkBtn>
            <LinkBtn onClick={() => setGlossOpen(true)}>Glossary</LinkBtn>
            <LinkBtn onClick={() => setInfoOpen(true)}>Methodology</LinkBtn>
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
          <div className="hero-tiles" style={{ padding: 14 }}>
            <SectionTile
              index="01" title="PROJECT" accentLabel="SHARED"
              onClick={() => setOpenTile('proj')}
              summary={<ProjectTileBody proj={proj} presetId={presetProj} />}
            />
            <SectionTile
              index="02" title="CONTROLS" accentLabel="PROJECT-LEVEL"
              onClick={() => setOpenTile('ctrl')}
              summary={<ControlsTileBody ctrl={ctrl} presetId={presetCtrl} />}
            />
            <SectionTile
              index="03" title="PRODUCT A" accent={T.BLUE} accentLabel="PROPOSED"
              onClick={() => setOpenTile('a')}
              summary={<ProductTileBody prod={prodA} presetId={presetA} presets={PRODUCT_A_PRESETS} />}
            />
            <SectionTile
              index="04" title="PRODUCT B" accent={T.VERM} accentLabel="BENCHMARK"
              onClick={() => setOpenTile('b')}
              summary={<ProductTileBody prod={prodB} presetId={presetB} presets={BENCHMARKS} />}
            />
          </div>
        </section>

        <section>
          {rA && rB && (
            <>
              <SectionHead idx="05" title="Carbon breakdown" right="[ kgCO₂e · LIFECYCLE ]" />
              <CarbonBars rA={rA} rB={rB} labelA={labelA} labelB={labelB}
                          colorA={colorA} colorB={colorB} colorAd={colorAd} colorBd={colorBd} />
              <SectionHead idx="06" title="Cumulative cost — Net Present Value" right="[ AUD · DISCOUNTED ]" />
              <CumulativeCostChart rA={rA} rB={rB} PL={proj.PL} labelA={labelA} labelB={labelB} colorA={colorA} colorB={colorB} />
            </>
          )}
          {controlsEnabled && rA && (
            <>
              <SectionHead idx="07" title="Controls — scenario breakdown" right="[ LOAN-FINANCED CAPITAL ]" />
              <ControlsTable rA={rA} ctrl={ctrl} PL={proj.PL} />
            </>
          )}
          <footer style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: 18 }}>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.MUTED, letterSpacing: '0.06em', lineHeight: 1.7 }}>
              TCO INCL. CAPITAL, ENERGY, REPLACEMENTS · GWP INCL. EMBODIED + OPERATIONAL · GRID DECARBONISATION APPLIED LINEARLY · NPV USES DISCOUNT RATE · ALL VALUES AUD · NOT FOR CERTIFICATION · SEE METHODOLOGY FOR ASSUMPTIONS
            </span>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.MUTED }}>© BUILT 2025</span>
          </footer>
        </section>
      </main>

      <Modal open={openTile === 'proj'} onClose={() => setOpenTile(null)} title="01 · Project" width={520}>
        <ProjectPanel
          chromeless
          proj={proj} setProj={setProj} validation={validation}
          presets={PROJECT_PRESETS}
          selectedPreset={presetProj} onPresetSelect={handlePresetProj}
          onClear={handleClearProj} canClear={canClearProj}
        />
      </Modal>
      <Modal open={openTile === 'ctrl'} onClose={() => setOpenTile(null)} title="02 · Controls" width={520}>
        <ControlsPanel
          chromeless
          ctrl={ctrl} setCtrl={setCtrl}
          presetId={presetCtrl} onPresetSelect={handlePresetCtrl}
          onClear={handleClearCtrl} canClear={canClearCtrl}
        />
      </Modal>
      <Modal open={openTile === 'a'} onClose={() => setOpenTile(null)} title="03 · Product A — Proposed" width={520}>
        <ProductPanel
          chromeless
          num="A" prod={prodA} setProd={setProdA}
          accent={T.BLUE} accentLabel="PROPOSED"
          validation={validation}
          presets={PRODUCT_A_PRESETS}
          selectedPreset={presetA} onPresetSelect={handlePresetA}
          onClear={handleClearA} canClear={canClearA}
        />
      </Modal>
      <Modal open={openTile === 'b'} onClose={() => setOpenTile(null)} title="04 · Product B — Benchmark" width={520}>
        <ProductPanel
          chromeless
          num="B" prod={prodB} setProd={setProdB}
          accent={T.VERM} accentLabel="BENCHMARK"
          validation={validation}
          presets={BENCHMARKS}
          selectedPreset={presetB} onPresetSelect={handlePresetB}
          onClear={handleClearB} canClear={canClearB}
        />
      </Modal>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <GlossaryModal open={glossOpen} onClose={() => setGlossOpen(false)} />
      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
    </div>
  );
}
