import { useState, useRef } from 'react';
import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';
import { Tooltip } from '../components/Tooltip.jsx';

const pctDelta = (a, b) => {
  if (!b) return '—';
  const p = ((a - b) / b) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};

export const CumulativeCostChart = ({ rA, rB, PL, labelA = 'A', labelB = 'B', colorA, colorB }) => {
  const [hover, setHover] = useState(null);
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);

  if (!rA || !rB) return null;
  const W = 1180, H = 320, PAD_L = 64, PAD_R = 140, PAD_T = 16, PAD_B = 30;
  const dataA = rA.profile.cumulativeCost;
  const dataB = rB.profile.cumulativeCost;
  const points = Math.min(dataA.length, dataB.length);
  const span = points - 1 || 1;
  const maxCost = Math.max(...dataA, ...dataB) * 1.05 || 1;

  const px = i => PAD_L + (i / span) * (W - PAD_L - PAD_R);
  const py = v => PAD_T + (1 - v / maxCost) * (H - PAD_T - PAD_B);

  const buildPath = data => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const pathA = buildPath(dataA);
  const pathB = buildPath(dataB);

  // Find first crossover point where cumulative costs swap leader.
  // Multiple crossovers are possible with different replacement schedules
  // but only the first is marked, as it represents the initial payback point.
  let crossover = null;
  for (let i = 1; i < points; i++) {
    if ((dataA[i - 1] > dataB[i - 1]) !== (dataA[i] > dataB[i])) {
      crossover = i + 1;
      break;
    }
  }

  const tickStep =
    maxCost > 200000 ? 50000 :
    maxCost > 100000 ? 25000 :
    maxCost > 40000  ? 10000 : 5000;
  const yTicks = [];
  for (let v = 0; v <= maxCost; v += tickStep) yTicks.push(v);

  const xStep = PL > 20 ? 5 : PL > 10 ? 2 : 1;
  const xTicks = [];
  for (let y = xStep; y < PL; y += xStep) xTicks.push(y);
  if (xTicks.length > 0 && PL - xTicks[xTicks.length - 1] < xStep) {
    xTicks[xTicks.length - 1] = PL;
  } else {
    xTicks.push(PL);
  }

  const lastIdx = points - 1;
  const lastA = dataA[lastIdx];
  const lastB = dataB[lastIdx];

  const aHeavier = lastA > lastB;
  const heavyDelta = lastA === lastB
    ? ''
    : aHeavier ? pctDelta(lastA, lastB) : pctDelta(lastB, lastA);

  const handleMove = (e) => {
    if (!svgRef.current || !wrapperRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const wrapRect = wrapperRef.current.getBoundingClientRect();
    const vbX = (e.clientX - svgRect.left) / svgRect.width * W;
    const ratio = (vbX - PAD_L) / (W - PAD_L - PAD_R);
    const i = Math.max(0, Math.min(span, Math.round(ratio * span)));
    setHover({
      idx: i,
      tipX: e.clientX - wrapRect.left,
      tipY: e.clientY - wrapRect.top,
    });
  };
  const clearHover = () => setHover(null);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', padding: '20px 28px', borderBottom: `1px solid ${T.INK}` }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        {yTicks.map(t => (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={py(t)} y2={py(t)} stroke={T.SUBTLE} strokeWidth="1" />
            <text x={PAD_L - 8} y={py(t) + 3} fontFamily={T.MONO} fontSize="10" fill={T.MUTED} textAnchor="end">${(t / 1000).toFixed(0)}k</text>
          </g>
        ))}
        <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke={T.INK} strokeWidth="1" />
        {xTicks.map(y => (
          <g key={y}>
            <line x1={px(y - 1)} x2={px(y - 1)} y1={H - PAD_B} y2={H - PAD_B + 4} stroke={T.INK} strokeWidth="1" />
            <text x={px(y - 1)} y={H - PAD_B + 18} fontFamily={T.MONO} fontSize="10" fill={T.MUTED} textAnchor="middle">{`y${y}`}</text>
          </g>
        ))}
        {crossover && crossover > 1 && crossover <= PL && (
          <g>
            <line x1={px(crossover - 1)} x2={px(crossover - 1)} y1={PAD_T} y2={H - PAD_B}
                  stroke={T.INK} strokeDasharray="2 3" strokeWidth="1" opacity="0.5" />
            <text x={px(crossover - 1) + 6} y={PAD_T + 14} fontFamily={T.MONO} fontSize="10" fill={T.INK}>
              crossover · y{crossover}
            </text>
          </g>
        )}
        <path d={pathB} fill="none" stroke={colorB} strokeWidth="2.5" />
        <path d={pathA} fill="none" stroke={colorA} strokeWidth="2.5" />
        <circle cx={px(lastIdx)} cy={py(lastA)} r="4" fill={colorA} />
        <circle cx={px(lastIdx)} cy={py(lastB)} r="4" fill={colorB} />
        <text x={px(lastIdx) + 10} y={py(lastA) + 4} fontFamily={T.MONO} fontSize="11" fill={colorA} textAnchor="start" fontWeight="600">
          {labelA} · {fmt.audK(lastA)}{aHeavier && heavyDelta ? ` · ${heavyDelta}` : ''}
        </text>
        <text x={px(lastIdx) + 10} y={py(lastB) + 4} fontFamily={T.MONO} fontSize="11" fill={colorB} textAnchor="start" fontWeight="600">
          {labelB} · {fmt.audK(lastB)}{!aHeavier && heavyDelta ? ` · ${heavyDelta}` : ''}
        </text>
        {hover && (
          <g>
            <line x1={px(hover.idx)} x2={px(hover.idx)} y1={PAD_T} y2={H - PAD_B}
                  stroke={T.INK} strokeWidth="1" opacity="0.35" />
            <circle cx={px(hover.idx)} cy={py(dataA[hover.idx])} r="3.5" fill={colorA} stroke={T.BG} strokeWidth="1.5" />
            <circle cx={px(hover.idx)} cy={py(dataB[hover.idx])} r="3.5" fill={colorB} stroke={T.BG} strokeWidth="1.5" />
          </g>
        )}
        <rect
          x={PAD_L} y={PAD_T}
          width={W - PAD_L - PAD_R} height={H - PAD_T - PAD_B}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={clearHover}
          style={{ cursor: 'crosshair' }}
        />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.SUBTLE}` }}>
        <div style={{ display: 'flex', gap: 18 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 22, height: 2.5, background: colorA }} />
            <span style={{ fontFamily: T.SANS, fontSize: 11, color: colorA, fontWeight: 500 }}>{labelA} · cumulative</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 22, height: 2.5, background: colorB }} />
            <span style={{ fontFamily: T.SANS, fontSize: 11, color: colorB, fontWeight: 500 }}>{labelB} · cumulative</span>
          </span>
        </div>
        <span style={micro}>[ AUD · PRESENT VALUE · DISCOUNT APPLIED ]</span>
      </div>
      {hover && (
        <Tooltip
          x={hover.tipX}
          y={hover.tipY}
          lines={[
            `YEAR y${String(hover.idx + 1).padStart(2, '0')}`,
            `${labelA} · ${fmt.aud(dataA[hover.idx])}`,
            `${labelB} · ${fmt.aud(dataB[hover.idx])}`,
          ]}
        />
      )}
    </div>
  );
};
