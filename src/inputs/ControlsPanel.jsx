import { T } from '../design/tokens.js';
import { Toggle } from '../components/atoms.jsx';
import { NF } from './NumberField.jsx';

export const ControlsPanel = ({ ctrl, setCtrl, enabled, onToggle }) => {
  const s = k => v => setCtrl(p => ({ ...p, [k]: v }));
  return (
    <div style={{ borderTop: `1.5px solid ${T.c100}` }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: enabled ? '#FFFEF5' : T.c050, gap: 16 }}>
        <Toggle on={enabled} onChange={onToggle} label="Control System Module" />
        {!enabled && <span style={{ fontFamily: T.font, fontSize: 9, color: T.c300, letterSpacing: '0.06em' }}>Enable to model occupancy / daylight / maintenance dimming savings</span>}
      </div>
      <div style={{
        padding: '0 16px 16px', background: enabled ? '#FFFEF5' : T.c050,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 16px',
        opacity: enabled ? 1 : 0.38,
        pointerEvents: enabled ? 'auto' : 'none',
        transition: 'opacity 200ms',
      }}>
        <NF label="Savings Coefficient" value={ctrl.CSC} onChange={s('CSC')} step={0.01} min={0.5} max={1} tipKey="CSC" hint="CSC = 0.75 → 25% energy saving" />
        <NF label="Cost Multiplier (CACC)" value={ctrl.CACC} onChange={s('CACC')} step={0.05} min={1} max={2} tipKey="CACC" />
        <NF label="Loan Interest Rate" value={Math.round(ctrl.r * 1000) / 10} unit="%" onChange={v => s('r')(v / 100)} step={0.1} tipKey="r" />
        <NF label="Loan Term" value={ctrl.LT} unit="yrs" onChange={s('LT')} step={1} min={1} max={30} tipKey="LT" hint="Separate from project discount rate" />
      </div>
    </div>
  );
};
