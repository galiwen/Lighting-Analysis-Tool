import { useState } from 'react';
import { T, micro } from '../design/tokens.js';
import { NF } from './NumberField.jsx';

export const ProjectPanel = ({
  proj, setProj, validation,
  presets, selectedPreset, onPresetSelect,
  onClear, canClear,
}) => {
  const [adv, setAdv] = useState(false);
  const s = k => v => setProj(p => ({ ...p, [k]: v }));
  const errFor = frag => validation.errors.find(e => e.toLowerCase().includes(frag));
  const warnFor = frag => validation.warnings.find(w => w.toLowerCase().includes(frag));
  return (
    <div style={{ padding: '16px 22px', borderRight: `1px solid ${T.SUBTLE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    paddingBottom: 8, borderBottom: `1px solid ${T.INK}`, marginBottom: 4 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600 }}>01 · Project</span>
        <span style={micro}>SHARED</span>
      </div>

      {presets && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 0', borderBottom: `1px solid ${T.SUBTLE}`, alignItems: 'center' }}>
          {presets.map(p => (
            <button key={p.id} onClick={() => onPresetSelect(p)} title={p.sub} style={{
              padding: '3px 8px',
              background: selectedPreset === p.id ? T.INK : 'transparent',
              color: selectedPreset === p.id ? T.BG : T.MUTED,
              border: `1px solid ${selectedPreset === p.id ? T.INK : T.SUBTLE}`,
              fontFamily: T.MONO, fontSize: 9, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>{p.label}</button>
          ))}
          <button onClick={onClear} disabled={!canClear} style={{
            marginLeft: 'auto',
            padding: '3px 8px', background: 'transparent',
            border: 'none',
            fontFamily: T.MONO, fontSize: 9, fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: canClear ? T.INK : T.SUBTLE,
            cursor: canClear ? 'pointer' : 'default',
          }}>× CLEAR</button>
        </div>
      )}

      <NF label="Operating hours" unit="hr/yr" value={proj.OH} onChange={s('OH')} min={1} max={8760} tipKey="OH" error={errFor('hours')} />
      <NF label="Project life"    unit="yr"    value={proj.PL} onChange={s('PL')} min={1} max={50}  tipKey="PL" error={errFor('project life')} />
      <NF label="Electricity rate" unit="$/kWh" value={proj.ER} onChange={s('ER')} step={0.01} tipKey="ER" warn={warnFor('rate')} />
      <NF label="Grid carbon"     unit="kg/kWh" value={proj.GF_0} onChange={s('GF_0')} step={0.01} tipKey="GF_0" error={errFor('grid carbon')} />
      <NF label="Decarb factor"   unit="%" value={Math.round(proj.GD * 100)} onChange={v => s('GD')(v / 100)} min={0} max={100} step={1} tipKey="GD" />
      <NF label="Decarb over"     unit="yr" value={proj.GDT} onChange={s('GDT')} min={1} max={50} tipKey="GDT" />
      <button onClick={() => setAdv(a => !a)} style={{
        marginTop: 8, padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: T.MONO, fontSize: 9, color: T.MUTED,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>{adv ? '▾ ADVANCED' : '▸ ADVANCED'}</button>
      {adv && (
        <div>
          <NF label="Inflation"     unit="%" value={Math.round(proj.i * 1000) / 10} onChange={v => s('i')(v / 100)} step={0.1} tipKey="i" />
          <NF label="Discount rate" unit="%" value={Math.round(proj.d * 1000) / 10} onChange={v => s('d')(v / 100)} step={0.1} tipKey="d" warn={warnFor('discount')} />
        </div>
      )}
    </div>
  );
};
