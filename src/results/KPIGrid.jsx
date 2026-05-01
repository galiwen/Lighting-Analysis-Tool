import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

const pctDelta = (a, b) => {
  if (!b) return '—';
  const p = ((a - b) / b) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};

export const KPIGrid = ({ rA, rB, labelA, labelB, colorA, colorB }) => {
  if (!rA || !rB) return null;
  const items = [
    { lab: 'Total carbon',   a: fmt.co2(rA.gwpBase.total), b: fmt.co2(rB.gwpBase.total),
      unit: 'CO₂e', winner: rA.gwpBase.total < rB.gwpBase.total ? 'A' : 'B',
      delta: pctDelta(rA.gwpBase.total, rB.gwpBase.total) },
    { lab: 'Total cost',     a: fmt.audK(rA.TC_base), b: fmt.audK(rB.TC_base),
      unit: 'AUD', winner: rA.TC_base < rB.TC_base ? 'A' : 'B',
      delta: pctDelta(rA.TC_base, rB.TC_base) },
    { lab: 'Annual energy',  a: fmt.num(rA.E_base / 1000, 1), b: fmt.num(rB.E_base / 1000, 1),
      unit: 'MWh', winner: rA.E_base < rB.E_base ? 'A' : 'B',
      delta: pctDelta(rA.E_base, rB.E_base) },
    { lab: 'Initial capital', a: fmt.audK(rA.C_initial), b: fmt.audK(rB.C_initial),
      unit: 'AUD', winner: rA.C_initial < rB.C_initial ? 'A' : 'B',
      delta: pctDelta(rA.C_initial, rB.C_initial) },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${T.RULE}` }}>
      {items.map((k, i) => (
        <div key={k.lab} style={{ padding: '18px 22px', borderRight: i < 3 ? `1px solid ${T.SUBTLE}` : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={micro}>{k.lab}</span>
            <span style={{ ...micro, color: k.winner === 'A' ? colorA : colorB }}>
              {k.winner === 'A' ? labelA : labelB} ✓
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontFamily: T.SANS, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: colorA }}>{k.a}</span>
            <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.MUTED }}>vs</span>
            <span style={{ fontFamily: T.SANS, fontSize: 16, fontWeight: 500, color: colorB }}>{k.b}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 6, borderTop: `1px solid ${T.SUBTLE}` }}>
            <span style={micro}>{k.unit}</span>
            <span style={{ fontFamily: T.MONO, fontSize: 11, color: T.INK }}>Δ {k.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
