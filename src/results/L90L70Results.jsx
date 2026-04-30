import { T } from '../design/tokens.js';
import { LineChart } from '../components/charts.jsx';
import { fmt } from '../components/format.js';
import { SectionHead, EmptyState } from './shared.jsx';

export const L90L70Results = ({ r90, r70, proj, npv }) => {
  if (!r90 || !r70) return <EmptyState />;
  const { PL } = proj;

  const rows = [
    ['Equiv. Capacity (Q / LMF)', fmt.num(r90.Q_adj, 0), fmt.num(r70.Q_adj, 0), r90.Q_adj < r70.Q_adj],
    ['Annual Energy', fmt.kwh(r90.E_base), fmt.kwh(r70.E_base), r90.E_base < r70.E_base],
    ['Luminaire Lifetime', fmt.yr(r90.L_base), fmt.yr(r70.L_base), null],
    [`Replacements (${PL} yr)`, `${r90.N_replace}×`, `${r70.N_replace}×`, null],
    ['Total GWP', fmt.co2(r90.gwpBase.total), fmt.co2(r70.gwpBase.total), r90.gwpBase.total < r70.gwpBase.total],
    ['Initial Capital', fmt.aud(r90.C_initial), fmt.aud(r70.C_initial), r90.C_initial < r70.C_initial],
    ['PV Energy Costs', fmt.aud(r90.pvEnergyTotal), fmt.aud(r70.pvEnergyTotal), r90.pvEnergyTotal < r70.pvEnergyTotal],
    ['PV Replacements', fmt.aud(r90.PV_replace), fmt.aud(r70.PV_replace), r90.PV_replace < r70.PV_replace],
    ['Total Cost (TCO)', fmt.aud(r90.TC_base), fmt.aud(r70.TC_base), r90.TC_base < r70.TC_base],
  ];

  const emissChart = [
    { label: 'L90', color: T.c800, data: r90.emissionsProfile.map(p => p.cumulativeEmissions) },
    { label: 'L70', color: T.amber, data: r70.emissionsProfile.map(p => p.cumulativeEmissions) },
  ];
  const costChart = [
    { label: 'L90', color: T.c800, data: r90.profile.cumulativeCost },
    { label: 'L70', color: T.amber, data: r70.profile.cumulativeCost },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 8, paddingBottom: 8, borderBottom: `1.5px solid ${T.c800}`, alignItems: 'end', marginBottom: 4 }}>
        <span />
        <div>
          <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>L90</div>
          <div style={{ fontFamily: T.font, fontSize: 9, color: T.c300, letterSpacing: '0.06em' }}>LMF {r90.LMF_used} · {fmt.num(r90.LH_used, 0)} hrs</div>
        </div>
        <div>
          <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.amberD }}>L70</div>
          <div style={{ fontFamily: T.font, fontSize: 9, color: T.c300, letterSpacing: '0.06em' }}>LMF {r70.LMF_used} · {fmt.num(r70.LH_used, 0)} hrs</div>
        </div>
      </div>
      {rows.map(([lbl, a, b, aGood]) => (
        <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 8, padding: '5px 0', borderBottom: `1px solid ${T.c100}`, alignItems: 'center' }}>
          <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>{lbl}</span>
          <span style={{ fontFamily: T.font, fontSize: 12, color: aGood === true ? T.success : aGood === false ? T.error : T.c800 }}>{a}</span>
          <span style={{ fontFamily: T.font, fontSize: 12, color: aGood === true ? T.error : aGood === false ? T.success : T.amberD }}>{b}</span>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 8, padding: '8px 0', background: T.c050, marginBottom: 20, alignItems: 'center' }}>
        <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>NPV (L90 vs L70)</span>
        <span style={{ fontFamily: T.font, fontSize: 14, color: npv >= 0 ? T.success : T.error }}>
          {npv >= 0 ? 'L90 saves ' : 'L70 saves '}{fmt.aud(Math.abs(npv))}
        </span>
        <span />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><SectionHead>Cumulative Emissions</SectionHead><LineChart series={emissChart} height={180} /></div>
        <div><SectionHead>Cumulative Cost (AUD)</SectionHead><LineChart series={costChart} height={180} /></div>
      </div>
    </div>
  );
};
