import { T, micro } from '../design/tokens.js';
import { Tip } from '../components/atoms.jsx';
import { TIPS } from './tips.js';

export const NF = ({
  label, value, unit, onChange,
  step = 'any', min, max,
  tipKey, accent, error, warn, hint,
  link, linkAction,
}) => {
  const tip = tipKey ? TIPS[tipKey] : undefined;
  const borderColor = error ? T.ERROR : warn ? T.WARN_BD : T.SUBTLE;
  const handleChange = e => {
    const raw = e.target.value;
    const n = parseFloat(raw);
    onChange(!isNaN(n) ? n : raw);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0', borderBottom: `1px solid ${T.SUBTLE}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <span style={{ ...micro, fontSize: 8.5, color: T.INK, letterSpacing: '0.08em' }}>{label}</span>
        <Tip text={tip} />
        {link && linkAction && (
          <button onClick={linkAction} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.MONO, fontSize: 9, fontWeight: 500, color: T.VERM,
            borderBottom: `1px solid ${T.VERM}`, padding: 0, letterSpacing: '0.04em',
          }}>{link}</button>
        )}
        {!link && unit && <span style={{ ...micro, fontSize: 8, marginLeft: 'auto' }}>{unit}</span>}
      </div>
      <input
        type="number" value={value} step={step} min={min} max={max}
        onChange={handleChange}
        style={{
          width: '100%', height: 28, border: `1px solid ${borderColor}`,
          background: T.BG, fontFamily: T.MONO, fontSize: 13, fontWeight: 500,
          color: accent || T.INK, padding: '0 8px', outline: 'none',
          boxSizing: 'border-box', textAlign: 'right',
        }}
        onFocus={e => e.target.style.borderColor = T.INK}
        onBlur={e => e.target.style.borderColor = borderColor}
      />
      {error && <div style={{ marginTop: 3, fontFamily: T.MONO, fontSize: 9, color: T.ERROR }}>✕ {error}</div>}
      {warn && !error && <div style={{ marginTop: 3, fontFamily: T.MONO, fontSize: 9, color: T.WARN_BD }}>⚠ {warn}</div>}
      {hint && !error && !warn && <div style={{ marginTop: 2, ...micro, fontSize: 8 }}>{hint}</div>}
    </div>
  );
};
