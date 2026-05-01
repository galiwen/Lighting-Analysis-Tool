import { T, micro } from '../design/tokens.js';
import { NF } from './NumberField.jsx';
import { CTRL_PRESETS } from './defaults.js';

export const ControlsPanel = ({ ctrl, setCtrl, presetId, onPresetSelect, onClear, canClear }) => {
  const s = k => v => setCtrl(p => ({ ...p, [k]: v }));
  return (
    <div style={{ padding: '16px 22px', borderRight: `1px solid ${T.SUBTLE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    paddingBottom: 8, borderBottom: `1px solid ${T.INK}`, marginBottom: 4 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600 }}>02 · Controls</span>
        <span style={micro}>PROJECT-LEVEL</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 0', borderBottom: `1px solid ${T.SUBTLE}`, alignItems: 'center' }}>
        {CTRL_PRESETS.map(p => (
          <button key={p.id} onClick={() => onPresetSelect(p)} title={p.sub} style={{
            padding: '3px 8px',
            background: presetId === p.id ? T.INK : 'transparent',
            color: presetId === p.id ? T.BG : T.MUTED,
            border: `1px solid ${presetId === p.id ? T.INK : T.SUBTLE}`,
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
          color: canClear ? T.VERM : T.SUBTLE,
          cursor: canClear ? 'pointer' : 'default',
        }}>× CLEAR</button>
      </div>

      <NF label="Savings coeff (CSC)" value={ctrl.CSC} onChange={s('CSC')} step={0.01} min={0.01} max={1} tipKey="CSC" hint="0.75 → 25% saving" />
      <NF label="Cost mult (CACC)"    value={ctrl.CACC} onChange={s('CACC')} step={0.05} min={1} max={2} tipKey="CACC" />
      <NF label="Loan interest" unit="%" value={Math.round(ctrl.r * 1000) / 10} onChange={v => s('r')(v / 100)} step={0.1} min={0} max={30} tipKey="r" />
      <NF label="Loan term"     unit="yr" value={ctrl.LT} onChange={s('LT')} step={1} min={1} max={30} tipKey="LT" />
    </div>
  );
};
