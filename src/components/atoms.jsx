import { useState, useRef } from 'react';
import { T } from '../design/tokens.js';

export const Tip = ({ text }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  if (!text) return null;
  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        fontFamily: T.font, fontSize: 9, fontWeight: 500, color: T.c300,
        cursor: 'default', userSelect: 'none', lineHeight: 1,
        border: `1px solid ${T.c200}`, borderRadius: '50%',
        width: 13, height: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        letterSpacing: 0,
      }}>i</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, width: 220, padding: '8px 10px',
          background: T.c800, color: T.warm,
          fontFamily: T.font, fontSize: 10, fontWeight: 300, lineHeight: 1.5,
          letterSpacing: '0.02em', textTransform: 'none', whiteSpace: 'normal',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: `5px solid ${T.c800}`,
          }} />
        </div>
      )}
    </span>
  );
};

export const Modal = ({ open, onClose, title, width = 560, children }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.white, width, maxWidth: '95vw', maxHeight: '88vh',
          overflowY: 'auto', padding: 28,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.c100}` }}>
          <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.c800 }}>{title}</span>
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'none', border: `1px solid ${T.c100}`,
            fontFamily: T.font, fontSize: 10, color: T.c400, cursor: 'pointer',
            padding: '3px 8px', letterSpacing: '0.08em',
          }}>✕ Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Rule = ({ my = 8, color = T.c100 }) => (
  <div style={{ height: 1, background: color, margin: `${my}px 0` }} />
);

export const Field = ({ label: lbl, value, unit, fill = false, warn, error: err, hint, link, linkAction, onChange, type = 'text', step, min, max, tip }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, marginBottom: 3, minHeight: 30 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c400 }}>{lbl}</span>
          <Tip text={tip} />
          {link && linkAction && (
            <button onClick={linkAction} style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: T.amberD,
              borderBottom: `1px solid ${T.amber}`, padding: 0,
            }}>{link}</button>
          )}
        </div>
        <div style={{ height: 14, display: 'flex', alignItems: 'center' }}>
          {unit
            ? <span style={{ fontFamily: T.font, fontWeight: 400, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c200 }}>{unit}</span>
            : <span style={{ display: 'block', height: 14 }} />}
        </div>
      </div>
    </div>
    <input
      type={type} value={value} step={step} min={min} max={max}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        display: 'block', width: '100%', height: 32,
        border: `1px solid ${err ? T.error : warn ? T.warnBd : T.c100}`,
        background: fill ? T.c050 : T.white,
        fontFamily: T.font, fontSize: 13, fontWeight: 400, color: T.c800,
        padding: '0 8px', outline: 'none', boxSizing: 'border-box',
      }}
    />
    {err  && <div style={{ marginTop: 3, padding: '3px 8px', background: '#FDE8E8', borderLeft: `2px solid ${T.error}`, fontFamily: T.font, fontSize: 8, color: T.error, letterSpacing: '0.06em' }}>✕ {err}</div>}
    {warn && <div style={{ marginTop: 3, padding: '3px 8px', background: T.warnBg, borderLeft: `2px solid ${T.warnBd}`, fontFamily: T.font, fontSize: 8, color: T.warnTx, letterSpacing: '0.06em' }}>⚠ {warn}</div>}
    {hint && <div style={{ marginTop: 2, fontFamily: T.font, fontWeight: 500, fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c200 }}>{hint}</div>}
  </div>
);

export const Collapse = ({ title, badge, badgeAction, badgeWarn, defaultOpen = true, locked = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = locked ? true : open;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', minHeight: 32, borderBottom: `1px solid ${T.c100}`, marginBottom: isOpen ? 10 : 0 }}>
        <button onClick={() => !locked && setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: locked ? 'default' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800 }}>{title}</span>
        </button>
        {badge && (
          <button onClick={badgeAction || undefined} style={{
            fontFamily: T.font, fontWeight: 500, fontSize: 8, letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '2px 7px',
            background: T.amberL, border: `1px solid ${T.warnBd}`, color: T.amberD,
            cursor: badgeAction ? 'pointer' : 'default',
          }}>{badge}</button>
        )}
        {badgeWarn && <Tip text={badgeWarn} />}
        {!locked && (
          <button onClick={() => setOpen(o => !o)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.font, fontWeight: 500, fontSize: 7.5, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: T.c200,
          }}>
            {isOpen ? '▾ collapse' : '▸ expand'}
          </button>
        )}
      </div>
      {isOpen && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>
  );
};

export const Toggle = ({ on, onChange, label: lbl }) => (
  <button onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
    <div style={{ width: 32, height: 16, borderRadius: 8, background: on ? T.amber : T.c200, position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 12, height: 12, background: T.white, borderRadius: 6, transition: 'left 200ms' }} />
    </div>
    <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: on ? T.amber : T.c400 }}>{lbl}</span>
  </button>
);

export const DerivedStrip = ({ items, dark = true }) => (
  <div style={{ background: dark ? T.c800 : T.amber, padding: '6px 10px', display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
    {items.map(({ lbl, val, warn: w, tip }) => (
      <div key={lbl}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? T.c300 : T.c700 }}>{lbl}</span>
          {tip && <Tip text={tip} />}
        </div>
        <span style={{ fontFamily: T.font, fontSize: 11, color: dark ? T.white : T.c800 }}>
          {val}{w && <span style={{ color: T.warnBd, marginLeft: 4 }}>⚠</span>}
        </span>
      </div>
    ))}
  </div>
);

export const SummaryRow = ({ lbl, a, b, delta, highlight, positive = true, tip }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px',
    padding: '5px 8px', background: highlight ? T.amberL : 'transparent',
    borderBottom: `1px solid ${T.c100}`, alignItems: 'center', gap: 4,
  }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: T.font, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>
      {lbl}{tip && <Tip text={tip} />}
    </span>
    <span style={{ fontFamily: T.font, fontSize: 13, textAlign: 'right' }}>{a}</span>
    <span style={{ fontFamily: T.font, fontSize: 13, textAlign: 'right', color: T.amberD }}>{b}</span>
    {delta != null
      ? <span style={{ fontFamily: T.font, fontSize: 12, textAlign: 'right', color: positive ? T.success : T.error }}>{delta.startsWith('-') ? '▼' : '▲'} {delta}</span>
      : <span />}
  </div>
);

export const StatBox = ({ lbl, val, sub, accent = false }) => (
  <div style={{ padding: '10px 14px', border: `1px solid ${accent ? T.amber : T.c100}`, background: accent ? T.amberL : T.white, flex: 1 }}>
    <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent ? T.amberD : T.c300, marginBottom: 4 }}>{lbl}</div>
    <div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 300, color: accent ? T.amberD : T.c800 }}>{val}</div>
    {sub && <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 8, letterSpacing: '0.08em', color: T.c300, marginTop: 3 }}>{sub}</div>}
  </div>
);

export const InfoBox = ({ children, type = 'warn' }) => {
  const colors = { warn: { bg: T.warnBg, bd: T.warnBd, tx: T.warnTx }, error: { bg: '#FDE8E8', bd: T.error, tx: T.error }, info: { bg: T.c050, bd: T.c200, tx: T.c400 } };
  const c = colors[type] || colors.warn;
  return (
    <div style={{ padding: '6px 10px', background: c.bg, borderLeft: `2px solid ${c.bd}`, marginBottom: 10 }}>
      <span style={{ fontFamily: T.font, fontSize: 8.5, color: c.tx, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
};
