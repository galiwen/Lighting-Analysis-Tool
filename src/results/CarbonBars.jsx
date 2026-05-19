import { useState, useRef } from 'react';
import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';
import { Tooltip } from '../components/Tooltip.jsx';

const pctDelta = (a, b) => {
  if (!b) return '—';
  const p = ((a - b) / b) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};

const hatchStyle = (color) => ({
  backgroundColor: color,
  backgroundImage:
    `repeating-linear-gradient(45deg, ${color} 0 5px, #FFFFFF 5px 7px)`,
});

const Bar = ({ name, gwp, max, color, colorD, otherTotal, onHover }) => {
  const embWidth = gwp.embodied / max * 100;
  const opWidth = gwp.operational / max * 100;
  const delta = pctDelta(gwp.total, otherTotal);
  const segHandlers = (lines) => ({
    onMouseEnter: (e) => onHover({ x: e.clientX, y: e.clientY, lines }),
    onMouseMove:  (e) => onHover({ x: e.clientX, y: e.clientY, lines }),
    onMouseLeave: ()  => onHover(null),
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
      <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 500, color }}>{name}</span>
      <div style={{ position: 'relative', height: 18, background: T.SUBTLE }}>
        <div
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: embWidth + '%', ...hatchStyle(colorD), cursor: 'crosshair' }}
          {...segHandlers([`${name} · EMBODIED`, fmt.co2(gwp.embodied)])}
        />
        <div
          style={{ position: 'absolute', left: embWidth + '%', top: 0, height: '100%', width: opWidth + '%', background: color, cursor: 'crosshair' }}
          {...segHandlers([`${name} · OPERATIONAL`, fmt.co2(gwp.operational)])}
        />
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: T.MONO, fontSize: 12, color }}>{fmt.co2(gwp.total)}</div>
        <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.MUTED, marginTop: 1 }}>{delta}</div>
      </div>
    </div>
  );
};

export const CarbonBars = ({ rA, rB, labelA, labelB, colorA, colorB, colorAd, colorBd }) => {
  const [tooltip, setTooltip] = useState(null);
  const wrapperRef = useRef(null);

  if (!rA || !rB) return null;
  const max = Math.max(rA.gwpBase.total, rB.gwpBase.total) * 1.1;
  const tickStep =
    max > 200000 ? 50000 :
    max > 100000 ? 25000 :
    max > 40000  ? 10000 :
    max > 4000   ?  1000 : 500;
  const ticks = [];
  for (let v = 0; v <= max; v += tickStep) ticks.push(v);
  const tickLabel = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

  const handleHover = (info) => {
    if (!info || !wrapperRef.current) { setTooltip(null); return; }
    const rect = wrapperRef.current.getBoundingClientRect();
    setTooltip({ x: info.x - rect.left, y: info.y - rect.top, lines: info.lines });
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', padding: '20px 28px', borderBottom: `1px solid ${T.INK}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px', gap: 12, marginBottom: 4 }}>
        <span />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {ticks.map(v => <span key={v} style={{ ...micro, fontSize: 8 }}>{tickLabel(v)}</span>)}
        </div>
        <span />
      </div>
      <Bar name={labelA} gwp={rA.gwpBase} max={max} color={colorA} colorD={colorAd} otherTotal={rB.gwpBase.total} onHover={handleHover} />
      <Bar name={labelB} gwp={rB.gwpBase} max={max} color={colorB} colorD={colorBd} otherTotal={rA.gwpBase.total} onHover={handleHover} />
      <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, ...hatchStyle(colorAd) }} />
          <span style={{ ...micro, fontSize: 9 }}>Embodied (mfg + EOL)</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: colorA }} />
          <span style={{ ...micro, fontSize: 9 }}>Operational (electricity)</span>
        </span>
      </div>
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} lines={tooltip.lines} />}
    </div>
  );
};
