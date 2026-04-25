import { T } from '../design/tokens.js';
import { Collapse, InfoBox } from '../components/atoms.jsx';
import { NF } from './NumberField.jsx';

export const L90L70InputPanel = ({ proj, setProj, lum, setLum, l90, setL90, l70, setL70, projValidation }) => {
  const sp = k => v => setProj(p => ({ ...p, [k]: v }));
  const sl = k => v => setLum(p => ({ ...p, [k]: v }));
  const s90 = k => v => setL90(p => ({ ...p, [k]: v }));
  const s70 = k => v => setL70(p => ({ ...p, [k]: v }));
  const pv = projValidation || { errors: [], warnings: [] };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1.5px solid ${T.c100}` }}>
      <div style={{ padding: 16, background: T.c050, borderRight: `1px solid ${T.c100}` }}>
        <Collapse title="01 — Project" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <NF label="Op. Hours / Year" value={proj.OH} unit="hrs/yr" onChange={sp('OH')} tipKey="OH" />
            <NF label="Project Life" value={proj.PL} unit="yrs" onChange={sp('PL')} tipKey="PL" />
            <NF label="Electricity Rate" value={proj.ER} unit="$/kWh" onChange={sp('ER')} step={0.01} tipKey="ER" />
            <NF label="Grid Carbon Factor" value={proj.GF_0} unit="kg/kWh" onChange={sp('GF_0')} step={0.01} tipKey="GF_0" />
            <NF label="Grid Decarb %" value={Math.round(proj.GD * 100)} unit="%" onChange={v => sp('GD')(v / 100)} step={1} tipKey="GD" />
            <NF label="Over" value={proj.GDT} unit="yrs" onChange={sp('GDT')} tipKey="GDT" />
          </div>
        </Collapse>
        <Collapse title="Advanced" defaultOpen={true} locked={true}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <NF label="Inflation Rate" value={Math.round(proj.i * 1000) / 10} unit="%" onChange={v => sp('i')(v / 100)} step={0.1} tipKey="i" />
            <NF label="Discount Rate" value={Math.round(proj.d * 1000) / 10} unit="%" onChange={v => sp('d')(v / 100)} step={0.1} tipKey="d" warn={pv.warnings.find(w => w.includes('Discount'))} />
          </div>
        </Collapse>
      </div>
      <div style={{ padding: 16 }}>
        <InfoBox type="warn">Enter the luminaire once. The tool runs the full analysis at both L90 and L70 standards side by side.</InfoBox>
        <Collapse title="02 — Luminaire" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
            <NF label="Wattage" value={lum.W} unit="W" onChange={sl('W')} tipKey="W" />
            <NF label="Lumens" value={lum.FL} unit="lm" onChange={sl('FL')} tipKey="FL" />
            <NF label="Base Quantity" value={lum.Q} onChange={sl('Q')} step={1} min={1} tipKey="Q" />
            <NF label="Supply + Install" value={lum.C_SI} unit="$/ea" onChange={sl('C_SI')} step={10} tipKey="C_SI" />
            <NF label="GWP Cradle-to-Gate" value={lum.GWP_CG} unit="kgCO₂e/ea" onChange={sl('GWP_CG')} step={0.5} tipKey="GWP_CG" />
            <NF label="GWP End of Life" value={lum.GWP_EOL} unit="kgCO₂e/ea" onChange={sl('GWP_EOL')} step={0.1} tipKey="GWP_EOL" />
          </div>
        </Collapse>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Collapse title="L90 Parameters" defaultOpen={true}>
            <NF label="LMF" value={l90.LMF} onChange={s90('LMF')} step={0.01} tipKey="LMF" hint="Typically 0.90" />
            <NF label="Rated Lifetime" value={l90.LH} unit="hrs" onChange={s90('LH')} tipKey="LH" />
          </Collapse>
          <Collapse title="L70 Parameters" defaultOpen={true}>
            <NF label="LMF" value={l70.LMF} onChange={s70('LMF')} step={0.01} tipKey="LMF" hint="Typically 0.70" />
            <NF label="Rated Lifetime" value={l70.LH} unit="hrs" onChange={s70('LH')} tipKey="LH" />
          </Collapse>
        </div>
      </div>
    </div>
  );
};
