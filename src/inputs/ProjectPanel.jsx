import { T } from '../design/tokens.js';
import { Collapse } from '../components/atoms.jsx';
import { NF } from './NumberField.jsx';

export const ProjectPanel = ({ proj, setProj, validation }) => {
  const s = k => v => setProj(p => ({ ...p, [k]: v }));
  const pv = validation?.project || { errors: [], warnings: [] };
  return (
    <div style={{ padding: 16, background: T.c050 }}>
      <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, marginBottom: 8 }}>
        01 — Project
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 16px' }}>
        <NF label="Op. Hours / Year" value={proj.OH} unit="hrs/yr" onChange={s('OH')} min={1} max={8760} tipKey="OH" error={pv.errors.find(e => e.includes('hours'))} />
        <NF label="Project Life" value={proj.PL} unit="yrs" onChange={s('PL')} min={1} max={50} tipKey="PL" />
        <NF label="Electricity Rate" value={proj.ER} unit="$/kWh" onChange={s('ER')} step={0.01} tipKey="ER" warn={pv.warnings.find(w => w.includes('rate'))} />
        <NF label="Grid Carbon Factor" value={proj.GF_0} unit="kg/kWh" onChange={s('GF_0')} step={0.01} tipKey="GF_0" error={pv.errors.find(e => e.includes('Grid Carbon'))} />
        <div style={{ gridColumn: '4', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 8px' }}>
          <NF label="Grid Decarb %" value={Math.round(proj.GD * 100)} unit="%" onChange={v => s('GD')(v / 100)} min={0} max={100} step={1} tipKey="GD" />
          <NF label="Over" value={proj.GDT} unit="yrs" onChange={s('GDT')} min={1} max={50} tipKey="GDT" />
        </div>
      </div>
      <Collapse title="Advanced" defaultOpen={false}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 16px' }}>
          <NF label="Inflation Rate" value={Math.round(proj.i * 1000) / 10} unit="%" onChange={v => s('i')(v / 100)} step={0.1} tipKey="i" hint="General price index" />
          <NF label="Discount Rate" value={Math.round(proj.d * 1000) / 10} unit="%" onChange={v => s('d')(v / 100)} step={0.1} tipKey="d" hint="Cost of capital" warn={pv.warnings.find(w => w.includes('Discount'))} />
        </div>
      </Collapse>
    </div>
  );
};
