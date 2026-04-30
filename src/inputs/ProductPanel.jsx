import { T } from '../design/tokens.js';
import { Collapse, InfoBox, DerivedStrip } from '../components/atoms.jsx';
import { fmt } from '../components/format.js';
import { NF } from './NumberField.jsx';
import { BENCHMARKS } from './defaults.js';

export const ProductPanel = ({ num, title, prod, setProd, result, onSwitchMode, validation, selectedBenchmark, onBenchmarkSelect }) => {
  const s = k => v => setProd(p => ({ ...p, [k]: v }));
  const pv = validation || { errors: [], warnings: [] };

  const derivedItems = result ? [
    { lbl: 'Efficacy',        val: fmt.lmw(result.EFF) },
    { lbl: 'Equiv. Capacity', val: `${fmt.num(result.Q_adj, 0)} lum-eq.`,
      tip: 'Total installed capacity needed to maintain design light levels at end of life, expressed as luminaire-equivalents. Accounts for lumen depreciation (LMF). Total system energy scales by this factor regardless of whether over-provision is achieved through additional luminaires or higher-output variants.' },
    { lbl: 'Lifetime',        val: fmt.yr(result.L_base), warn: result.L_base < 1 },
    { lbl: 'Replacements',    val: `${result.N_replace}×` },
  ] : [];

  return (
    <div style={{ padding: 16, background: num === 'B' ? '#FFFDF7' : T.white, height: '100%' }}>
      <Collapse title={`0${num === 'A' ? 2 : 3} — ${title}`} defaultOpen={true}>
        {num === 'B' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {BENCHMARKS.map(b => (
              <button key={b.id} onClick={() => onBenchmarkSelect && onBenchmarkSelect(b)} style={{
                padding: '4px 10px',
                background: selectedBenchmark === b.id ? T.c800 : T.white,
                color: selectedBenchmark === b.id ? T.white : T.c400,
                border: `1px solid ${selectedBenchmark === b.id ? T.c800 : T.c200}`,
                fontFamily: T.font, fontSize: 8, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}>{b.label}</button>
            ))}
          </div>
        )}
        {pv.errors.map((e, i) => <InfoBox key={i} type="error">{e}</InfoBox>)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
          <NF label="Wattage" value={prod.W} unit="W" onChange={s('W')} min={0} tipKey="W" />
          <NF label="Lumens" value={prod.FL} unit="lm" onChange={s('FL')} min={0} tipKey="FL" />
          <NF label="Quantity (base)" value={prod.Q} onChange={s('Q')} min={1} step={1} tipKey="Q" />
          <NF label="LMF" value={prod.LMF} onChange={s('LMF')} step={0.01} min={0.01} max={1} tipKey="LMF"
            warn={pv.warnings.find(w => w.includes('LMF'))}
            link="L90 vs L70 →" linkAction={onSwitchMode} />
          <NF label="Rated Lifetime" value={prod.LH} unit="hrs" onChange={s('LH')} min={0} tipKey="LH" />
          <NF label="Supply + Install" value={prod.C_SI} unit="$/ea" onChange={s('C_SI')} min={0} step={10} tipKey="C_SI" />
        </div>
      </Collapse>
      <Collapse title="Embodied Carbon" defaultOpen={true} locked={true}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
          <NF label="GWP Cradle-to-Gate" value={prod.GWP_CG} unit="kgCO₂e/ea" onChange={s('GWP_CG')} min={0} step={0.5} tipKey="GWP_CG" />
          <NF label="GWP End of Life" value={prod.GWP_EOL} unit="kgCO₂e/ea" onChange={s('GWP_EOL')} min={0} step={0.1} tipKey="GWP_EOL" />
        </div>
      </Collapse>
      {result && <DerivedStrip items={derivedItems} dark={num === 'A'} />}
    </div>
  );
};
