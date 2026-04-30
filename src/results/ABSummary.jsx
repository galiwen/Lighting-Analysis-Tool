import { T } from '../design/tokens.js';
import { SummaryRow, StatBox } from '../components/atoms.jsx';
import { fmt } from '../components/format.js';

export const ABSummary = ({ rA, rB, proj, npv }) => {
  if (!rA || !rB) return (
    <div style={{ padding: '24px 8px', textAlign: 'center' }}>
      <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c200 }}>
        Enter inputs and calculate to see the comparison summary
      </span>
    </div>
  );
  const { PL } = proj;

  const pctDiff = (a, b, lowerBetter = false) => {
    if (!b) return null;
    const p = ((a - b) / b) * 100;
    const better = lowerBetter ? p < 0 : p > 0;
    return { text: `${p > 0 ? '+' : ''}${p.toFixed(1)}%`, positive: better };
  };

  const gwpA = rA.gwpBase.total;
  const gwpB = rB.gwpBase.total;
  const gwpAIsLower = gwpA < gwpB;
  const gwpDiff = Math.abs(gwpA - gwpB);

  const tcoA = rA.TC_base;
  const tcoB = rB.TC_base;
  const tcoAIsLower = tcoA < tcoB;
  const tcoDiff = Math.abs(tcoA - tcoB);

  const aPreferable = npv >= 0;

  const rows = [
    { lbl: 'Efficacy', a: fmt.lmw(rA.EFF), b: fmt.lmw(rB.EFF), d: pctDiff(rA.EFF, rB.EFF) },
    { lbl: 'Equiv. System Capacity (Q / LMF)', a: fmt.num(rA.Q_adj, 0), b: fmt.num(rB.Q_adj, 0), d: pctDiff(rA.Q_adj, rB.Q_adj, true),
      tip: 'Total installed capacity needed to maintain design light levels at end of life, expressed as luminaire-equivalents. Accounts for lumen depreciation (LMF). Total system energy scales by this factor regardless of whether over-provision is achieved through additional luminaires or higher-output variants.' },
    { lbl: 'Annual Energy', a: fmt.kwh(rA.E_base), b: fmt.kwh(rB.E_base), d: pctDiff(rA.E_base, rB.E_base, true) },
    { lbl: `Luminaire Lifetime`, a: fmt.yr(rA.L_base), b: fmt.yr(rB.L_base), d: null },
    { lbl: `Replacements (${PL} yr)`, a: `${rA.N_replace}×`, b: `${rB.N_replace}×`, d: null },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatBox
          lbl="Total GWP"
          val={fmt.co2(Math.min(gwpA, gwpB))}
          sub={`Product ${gwpAIsLower ? 'A' : 'B'} saves ${fmt.co2(gwpDiff)}`}
          accent={gwpAIsLower}
        />
        <StatBox
          lbl="Total Cost (TCO)"
          val={fmt.aud(Math.min(tcoA, tcoB))}
          sub={`Product ${tcoAIsLower ? 'A' : 'B'} saves ${fmt.aud(tcoDiff)}`}
          accent={tcoAIsLower}
        />
        <StatBox
          lbl="NPV (A vs B)"
          val={`${npv >= 0 ? '+' : ''}${fmt.aud(npv)}`}
          sub={aPreferable ? 'A is financially preferable' : 'B is financially preferable'}
          accent={aPreferable}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', padding: '5px 8px', borderBottom: `1.5px solid ${T.c800}`, gap: 4 }}>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800 }}>Summary</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, textAlign: 'right' }}>Product A</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.amberD, textAlign: 'right' }}>Product B</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c300, textAlign: 'right' }}>Δ A vs B</span>
      </div>
      {rows.map(r => (
        <SummaryRow key={r.lbl} lbl={r.lbl} a={r.a} b={r.b}
          delta={r.d ? r.d.text : null} positive={r.d ? r.d.positive : true}
          highlight={r.highlight} tip={r.tip} />
      ))}
    </div>
  );
};
