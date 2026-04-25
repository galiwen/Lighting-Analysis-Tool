import { T } from '../design/tokens.js';
import { SummaryRow } from '../components/atoms.jsx';
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

  const rows = [
    { lbl: 'Efficacy', a: fmt.lmw(rA.EFF), b: fmt.lmw(rB.EFF), d: pctDiff(rA.EFF, rB.EFF) },
    { lbl: 'Adjusted Quantity (Q / LMF)', a: fmt.num(rA.Q_adj, 0), b: fmt.num(rB.Q_adj, 0), d: pctDiff(rA.Q_adj, rB.Q_adj, true) },
    { lbl: 'Annual Energy', a: fmt.kwh(rA.E_base), b: fmt.kwh(rB.E_base), d: pctDiff(rA.E_base, rB.E_base, true) },
    { lbl: `Luminaire Lifetime`, a: fmt.yr(rA.L_base), b: fmt.yr(rB.L_base), d: null },
    { lbl: `Replacements (${PL} yr)`, a: `${rA.N_replace}×`, b: `${rB.N_replace}×`, d: null },
    { lbl: 'Total GWP (lifecycle)', a: fmt.co2(rA.gwpBase.total), b: fmt.co2(rB.gwpBase.total), d: pctDiff(rA.gwpBase.total, rB.gwpBase.total, true), highlight: true },
    { lbl: 'Total Cost of Ownership', a: fmt.aud(rA.TC_base), b: fmt.aud(rB.TC_base), d: pctDiff(rA.TC_base, rB.TC_base, true), highlight: true },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', padding: '5px 8px', borderBottom: `1.5px solid ${T.c800}`, gap: 4 }}>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800 }}>Summary</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, textAlign: 'right' }}>Product A</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.amberD, textAlign: 'right' }}>Product B</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c300, textAlign: 'right' }}>Δ A vs B</span>
      </div>
      {rows.map(r => (
        <SummaryRow key={r.lbl} lbl={r.lbl} a={r.a} b={r.b}
          delta={r.d ? r.d.text : null} positive={r.d ? r.d.positive : true}
          highlight={r.highlight} />
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', padding: '6px 8px', background: T.c050, gap: 4, alignItems: 'center' }}>
        <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>NPV of choosing A over B</span>
        <span /><span />
        <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 400, textAlign: 'right', color: npv >= 0 ? T.success : T.error }}>
          {npv >= 0 ? '+' : ''}{fmt.aud(npv)}
        </span>
      </div>
    </div>
  );
};
