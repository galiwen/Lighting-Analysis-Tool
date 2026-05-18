import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';
import { pctDelta } from './compare.js';

export const LineItems = ({ rA, rB, PL, labelA, labelB, colorA, colorB }) => {
  if (!rA || !rB) return null;
  const num = (color, size = 12) => ({ fontFamily: T.MONO, fontSize: size, fontWeight: 500, color });
  const rows = [
    ['01', 'Efficacy',                fmt.lmw(rA.EFF),           fmt.lmw(rB.EFF),           pctDelta(rA.EFF, rB.EFF)],
    ['02', 'Equivalent capacity',     fmt.num(rA.Q_adj, 0),      fmt.num(rB.Q_adj, 0),      pctDelta(rA.Q_adj, rB.Q_adj)],
    ['03', 'Annual energy',           fmt.kwh(rA.E_base),        fmt.kwh(rB.E_base),        pctDelta(rA.E_base, rB.E_base)],
    ['04', 'Luminaire lifetime',      fmt.yr(rA.L_base),         fmt.yr(rB.L_base),         pctDelta(rA.L_base, rB.L_base)],
    ['05', `Replacements (${PL} yr)`, `${rA.N_replace}×`,        `${rB.N_replace}×`,        '—'],
    ['06', 'Initial capital',         fmt.aud(rA.C_initial),     fmt.aud(rB.C_initial),     pctDelta(rA.C_initial, rB.C_initial)],
    ['07', 'PV of energy costs',      fmt.aud(rA.pvEnergyTotal), fmt.aud(rB.pvEnergyTotal), pctDelta(rA.pvEnergyTotal, rB.pvEnergyTotal)],
    ['08', 'PV of replacements',      fmt.aud(rA.PV_replace),    fmt.aud(rB.PV_replace),    pctDelta(rA.PV_replace, rB.PV_replace)],
    ['09', 'Total carbon (GWP)',      fmt.co2(rA.gwpBase.total), fmt.co2(rB.gwpBase.total), pctDelta(rA.gwpBase.total, rB.gwpBase.total)],
    ['10', 'Total cost (TCO)',        fmt.aud(rA.TC_base),       fmt.aud(rB.TC_base),       pctDelta(rA.TC_base, rB.TC_base)],
  ];
  return (
    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.RULE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600 }}>07 · Line items</span>
        <span style={micro}>[ {PL}-YR PRESENT VALUE ]</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '24px 2.4fr 1fr 1fr 1fr', padding: '6px 0', borderTop: `1px solid ${T.INK}`, borderBottom: `1px solid ${T.INK}` }}>
        <span style={micro}>#</span>
        <span style={micro}>Metric</span>
        <span style={{ ...micro, color: colorA, textAlign: 'right' }}>{labelA}</span>
        <span style={{ ...micro, color: colorB, textAlign: 'right' }}>{labelB}</span>
        <span style={{ ...micro, textAlign: 'right' }}>Δ</span>
      </div>
      {rows.map(r => (
        <div key={r[0]} style={{ display: 'grid', gridTemplateColumns: '24px 2.4fr 1fr 1fr 1fr', padding: '7px 0', borderBottom: `1px solid ${T.SUBTLE}` }}>
          <span style={{ ...micro, fontSize: 9 }}>{r[0]}</span>
          <span style={{ fontFamily: T.SANS, fontSize: 12 }}>{r[1]}</span>
          <span style={{ ...num(colorA), textAlign: 'right' }}>{r[2]}</span>
          <span style={{ ...num(colorB), textAlign: 'right' }}>{r[3]}</span>
          <span style={{ ...num(T.MUTED, 11), textAlign: 'right' }}>{r[4]}</span>
        </div>
      ))}
    </div>
  );
};
