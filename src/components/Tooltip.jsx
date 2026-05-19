import { T } from '../design/tokens.js';

export const Tooltip = ({ x, y, lines }) => (
  <div style={{
    position: 'absolute', left: x, top: y,
    transform: 'translate(-50%, calc(-100% - 10px))',
    background: T.BG, border: `1px solid ${T.INK}`,
    padding: '6px 10px',
    fontFamily: T.MONO, fontSize: 11, color: T.INK, lineHeight: 1.5,
    whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20,
  }}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
