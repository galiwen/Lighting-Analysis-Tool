import { T, micro } from '../design/tokens.js';
import { Toggle } from '../components/atoms.jsx';
import { NF } from './NumberField.jsx';

export const ControlsPanel = ({ ctrl, setCtrl, enabled, onToggle }) => {
  const s = k => v => setCtrl(p => ({ ...p, [k]: v }));
  return (
    <div style={{
      padding: '14px 22px',
      background: enabled ? T.BG_PANEL : 'transparent',
      borderBottom: `1px solid ${T.INK}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        paddingBottom: 10,
        marginBottom: enabled ? 6 : 0,
        borderBottom: enabled ? `1px solid ${T.SUBTLE}` : 'none',
      }}>
        <Toggle on={enabled} onChange={onToggle} label="04 · Control system" />
        {!enabled && (
          <span style={{ ...micro, fontSize: 10 }}>
            Enable to model occupancy / daylight / dimming savings
          </span>
        )}
        {enabled && (
          <span style={{ ...micro, fontSize: 10, color: T.VERM, marginLeft: 'auto' }}>
            [ ACTIVE — RESULTS UPDATED ]
          </span>
        )}
      </div>
      {enabled && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 22px' }}>
          <NF label="Savings coeff (CSC)" value={ctrl.CSC} onChange={s('CSC')} step={0.01} min={0.5} max={1} tipKey="CSC" hint="0.75 → 25% saving" />
          <NF label="Cost mult (CACC)"    value={ctrl.CACC} onChange={s('CACC')} step={0.05} min={1} max={2} tipKey="CACC" />
          <NF label="Loan interest" unit="%" value={Math.round(ctrl.r * 1000) / 10} onChange={v => s('r')(v / 100)} step={0.1} tipKey="r" />
          <NF label="Loan term"     unit="yr" value={ctrl.LT} onChange={s('LT')} step={1} min={1} max={30} tipKey="LT" />
        </div>
      )}
    </div>
  );
};
