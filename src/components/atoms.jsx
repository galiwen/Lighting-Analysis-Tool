import { useEffect, useState } from 'react';
import { T, micro } from '../design/tokens.js';

export const Tip = ({ text }) => {
  const [show, setShow] = useState(false);
  if (!text) return null;
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        fontFamily: T.MONO, fontSize: 9, fontWeight: 500, color: T.MUTED,
        cursor: 'help', userSelect: 'none', lineHeight: 1,
        border: `1px solid ${T.SUBTLE}`, borderRadius: '50%',
        width: 13, height: 13,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>i</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, width: 240, padding: '8px 10px',
          background: T.INK, color: T.BG,
          fontFamily: T.SANS, fontSize: 11, fontWeight: 400, lineHeight: 1.5,
          letterSpacing: '0.01em', whiteSpace: 'normal', pointerEvents: 'none',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        }}>{text}</div>
      )}
    </span>
  );
};

export const SectionHead = ({ idx, title, right }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    padding: '14px 28px 10px', borderBottom: `1px solid ${T.INK}`,
  }}>
    <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600, color: T.INK }}>
      {idx && <span style={{ color: T.MUTED, marginRight: 8 }}>{idx}</span>}{title}
    </span>
    {right && <span style={micro}>{right}</span>}
  </div>
);

export const Modal = ({ open, onClose, title, width = 620, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.65)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.BG, width, maxWidth: '95vw', maxHeight: '88vh', overflowY: 'auto',
        border: `1px solid ${T.INK}`, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: `1px solid ${T.INK}`, background: T.BG_PANEL,
        }}>
          <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600, color: T.INK }}>{title}</span>
          <button onClick={onClose} style={{
            background: T.INK, color: T.BG, border: 'none', padding: '5px 10px',
            fontFamily: T.MONO, fontSize: 10, cursor: 'pointer', letterSpacing: '0.06em',
          }}>✕ CLOSE</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

export const Toggle = ({ on, onChange, label }) => (
  <button onClick={() => onChange(!on)} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  }}>
    <span style={{
      width: 30, height: 16, background: on ? T.VERM : T.SUBTLE,
      position: 'relative', transition: 'background 200ms', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 12, height: 12, background: T.BG, transition: 'left 200ms',
      }} />
    </span>
    <span style={{
      fontFamily: T.MONO, fontSize: 10, fontWeight: 500,
      color: on ? T.VERM : T.INK,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>{label}</span>
  </button>
);
