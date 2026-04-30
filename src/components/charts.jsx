import { T } from '../design/tokens.js';

export const PieChart = ({ slices, size = 120, label: centerLabel }) => {
  if (!slices || slices.length === 0) return null;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  const cx = size / 2, cy = size / 2, r = size / 2 - 8, innerR = r * 0.5;

  const toXY = (angle, radius) => {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const paths = [];
  let startAngle = 0;
  slices.forEach(sl => {
    const sweep = (sl.value / total) * 360;
    const endAngle = startAngle + sweep;
    const large = sweep > 180 ? 1 : 0;
    const s = toXY(startAngle, r);
    const e = toXY(endAngle, r);
    const si = toXY(startAngle, innerR);
    const ei = toXY(endAngle, innerR);
    const d = `M ${si.x} ${si.y} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${innerR} ${innerR} 0 ${large} 0 ${si.x} ${si.y} Z`;
    paths.push({ ...sl, d, midAngle: startAngle + sweep / 2, pct: ((sl.value / total) * 100).toFixed(0) });
    startAngle = endAngle;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {paths.map(p => <path key={p.label} d={p.d} fill={p.color} opacity={0.9} />)}
        {centerLabel && (
          <text x={cx} y={cy + 4} textAnchor="middle" style={{ fontFamily: T.font, fontSize: 9, fontWeight: 500, fill: T.c800, letterSpacing: '0.05em' }}>
            {centerLabel}
          </text>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {paths.map(p => (
          <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, background: p.color, flexShrink: 0 }} />
            <span style={{ fontFamily: T.font, fontSize: 9, color: T.c400, letterSpacing: '0.06em' }}>
              {p.label} — {p.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LineChart = ({ series, height = 120 }) => {
  if (!series || series.length === 0 || !series[0].data.length) return (
    <div style={{ height, background: T.c050, border: `1px solid ${T.c100}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: T.font, fontSize: 9, color: T.c200 }}>No data</span>
    </div>
  );
  const W = 600, H = height;
  const PAD = { top: 10, right: 10, bottom: 24, left: 52 };
  const iW = W - PAD.left - PAD.right, iH = H - PAD.top - PAD.bottom;
  const allVals = series.flatMap(s => s.data);
  const maxV = Math.max(...allVals) * 1.05 || 1;
  const years = series[0].data.length;
  const px = i => PAD.left + (i / Math.max(years - 1, 1)) * iW;
  const py = v => PAD.top + iH - (v / maxV) * iH;
  const fmt2 = v => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v.toFixed(0);
  const gridLines = 4;
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}>
        {Array.from({ length: gridLines + 1 }, (_, gi) => {
          const v = (gi / gridLines) * maxV;
          const y = py(v);
          return (
            <g key={gi}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke={T.c100} strokeWidth={1} />
              <text x={PAD.left - 4} y={y + 3} textAnchor="end" style={{ fontSize: 8, fill: T.c300, fontFamily: T.font }}>{fmt2(v)}</text>
            </g>
          );
        })}
        {series[0].data.map((_, i) => {
          if (i === 0 || i === years - 1 || i % Math.ceil(years / 5) === 0)
            return <text key={i} x={px(i)} y={H - 4} textAnchor="middle" style={{ fontSize: 8, fill: T.c300, fontFamily: T.font }}>Yr {i + 1}</text>;
          return null;
        })}
        {series.map(s => {
          const pts = s.data.map((v, i) => `${px(i)},${py(v)}`).join(' ');
          const areaPath = `M ${px(0)},${py(0)} ${s.data.map((v, i) => `L ${px(i)},${py(v)}`).join(' ')} L ${px(s.data.length - 1)},${py(0)} Z`;
          return (
            <g key={s.label}>
              <path d={areaPath} fill={s.color} opacity={0.07} />
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 14, position: 'absolute', top: 4, right: 8 }}>
        {series.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 18, height: 2, background: s.color }} />
            <span style={{ fontFamily: T.font, fontSize: 7.5, letterSpacing: '0.08em', color: T.c400 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StackedBarComparison = ({ bars, formatValue }) => {
  if (!bars || bars.length === 0) return null;
  const maxTotal = Math.max(...bars.map(b => b.total)) || 1;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bars.map(bar => {
          const widthPct = (bar.total / maxTotal) * 100;
          return (
            <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 80, flexShrink: 0, fontFamily: T.font, fontSize: 9, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>{bar.label}</span>
              <div style={{ flex: 1, height: 28, background: T.c050 }}>
                <div style={{ display: 'flex', height: '100%', width: `${widthPct}%` }}>
                  {bar.segments.map(seg => (
                    <div key={seg.label} style={{ flex: seg.value, background: seg.color }} />
                  ))}
                </div>
              </div>
              <span style={{ width: 120, flexShrink: 0, fontFamily: T.font, fontSize: 11, color: T.c800, textAlign: 'right' }}>{formatValue(bar.total)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10, paddingLeft: 92 }}>
        {bars.flatMap(bar =>
          bar.segments.map(seg => (
            <div key={`${bar.label}-${seg.label}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, background: seg.color, flexShrink: 0 }} />
              <span style={{ fontFamily: T.font, fontSize: 8, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>
                {seg.label} {bar.label.replace(/^Product\s+/, '')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
