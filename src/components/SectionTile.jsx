import { useState } from 'react';
import { T, micro } from '../design/tokens.js';

export const SectionTile = ({ index, title, accent, accentLabel, summary, onClick }) => {
  const [hover, setHover] = useState(false);
  const headerRule = accent ? `2px solid ${accent}` : `1px solid ${T.INK}`;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: hover ? T.BG_PANEL : 'transparent',
        border: `1px solid ${T.INK}`,
        padding: '16px 22px', cursor: 'pointer',
        fontFamily: T.SANS, color: T.INK,
        transition: 'background 120ms ease',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        paddingBottom: 8, borderBottom: headerRule, marginBottom: 10,
      }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600, color: accent || T.INK }}>
          <span style={{ color: T.MUTED, marginRight: 8 }}>{index}</span>
          <span>{title}</span>
        </span>
        <span style={{ ...micro, color: accent || T.MUTED }}>
          {accentLabel ? `${accentLabel} →` : 'EDIT →'}
        </span>
      </div>
      <div>{summary}</div>
    </button>
  );
};
