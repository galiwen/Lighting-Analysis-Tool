import { T, micro } from '../design/tokens.js';
import { NF } from './NumberField.jsx';

export const ProductPanel = ({
  num, prod, setProd,
  accent, accentLabel,
  validation,
  presets, selectedPreset, onPresetSelect,
  onClear, canClear,
  last,
  chromeless = false,
}) => {
  const s = k => v => setProd(p => ({ ...p, [k]: v }));
  const errFor = frag => validation.errors.find(e => e.toLowerCase().includes(frag));
  const warnFor = frag => validation.warnings.find(w => w.toLowerCase().includes(frag));
  const sectionNum = num === 'A' ? '03' : '04';

  const outer = chromeless
    ? { padding: 0, borderTop: `2px solid ${accent}` }
    : { padding: '16px 22px', borderRight: last ? 'none' : `1px solid ${T.SUBTLE}` };

  return (
    <div style={outer}>
      {!chromeless && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      paddingBottom: 8, borderBottom: `2px solid ${accent}`, marginBottom: 4 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600, color: accent }}>
            {sectionNum} · Product {num}
          </span>
          <span style={{ ...micro, color: accent }}>{accentLabel}</span>
        </div>
      )}

      {presets && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 0', borderBottom: `1px solid ${T.SUBTLE}`, alignItems: 'center' }}>
          {presets.map(b => (
            <button key={b.id} onClick={() => onPresetSelect(b)} title={b.sub} style={{
              padding: '3px 8px',
              background: selectedPreset === b.id ? T.INK : 'transparent',
              color: selectedPreset === b.id ? T.BG : T.MUTED,
              border: `1px solid ${selectedPreset === b.id ? T.INK : T.SUBTLE}`,
              fontFamily: T.MONO, fontSize: 9, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>{b.label}</button>
          ))}
          <button onClick={onClear} disabled={!canClear} style={{
            marginLeft: 'auto',
            padding: '3px 8px', background: 'transparent',
            border: 'none',
            fontFamily: T.MONO, fontSize: 9, fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: canClear ? accent : T.SUBTLE,
            cursor: canClear ? 'pointer' : 'default',
          }}>× CLEAR</button>
        </div>
      )}

      <NF label="Wattage"     unit="W"  value={prod.W}   onChange={s('W')}   min={0} tipKey="W"   accent={accent} error={errFor('wattage')} />
      <NF label="Lumens"      unit="lm" value={prod.FL}  onChange={s('FL')}  min={0} tipKey="FL"  accent={accent} />
      <NF label="Quantity"              value={prod.Q}   onChange={s('Q')}   min={1} step={1} tipKey="Q" accent={accent} error={errFor('quantity')} />
      <NF label="LMF"                   value={prod.LMF} onChange={s('LMF')} step={0.01} min={0.01} max={1} tipKey="LMF" accent={accent}
          warn={warnFor('lmf')} error={errFor('lmf')} />
      <NF label="Lifetime"    unit="hr" value={prod.LH}      onChange={s('LH')}      min={0} tipKey="LH"     accent={accent} />
      <NF label="Embodied C"  unit="kg/ea" value={prod.GWP_CG}  onChange={s('GWP_CG')}  min={0} step={0.5} tipKey="GWP_CG" accent={accent} />
      <NF label="End of life" unit="kg/ea" value={prod.GWP_EOL} onChange={s('GWP_EOL')} min={0} step={0.1} tipKey="GWP_EOL" accent={accent} />
      <NF label="Supply + Inst" unit="$/ea" value={prod.C_SI}    onChange={s('C_SI')}    min={0} step={10}  tipKey="C_SI" accent={accent} />
      <NF label="CRI"                       value={prod.CRI}     onChange={s('CRI')}     min={0} max={100} step={1} tipKey="CRI" accent={accent} />
      <NF label="UGR"                       value={prod.UGR}     onChange={s('UGR')}     min={5} max={35}  step={1} tipKey="UGR" accent={accent} />
    </div>
  );
};
