import { T } from '../design/tokens.js';
import { LineChart } from '../components/charts.jsx';
import { fmt } from '../components/format.js';
import { SectionHead, EmptyState } from './shared.jsx';

export const FinancialTab = ({ rA, rB, proj, npv }) => {
  if (!rA || !rB) return <EmptyState />;
  const { PL } = proj;

  const rows = [
    { lbl: 'Initial Capital',    a: rA.C_initial,     b: rB.C_initial },
    { lbl: 'PV of Energy Costs', a: rA.pvEnergyTotal,  b: rB.pvEnergyTotal },
    { lbl: 'PV of Replacements', a: rA.PV_replace,     b: rB.PV_replace },
  ];

  const chartSeries = [
    { label: 'Product A', color: T.c800, data: rA.profile.cumulativeCost },
    { label: 'Product B', color: T.amber, data: rB.profile.cumulativeCost },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: 4, paddingBottom: 6, borderBottom: `1.5px solid ${T.c800}`, alignItems: 'end', marginBottom: 2 }}>
        <span />
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, textAlign: 'right' }}>Product A</span>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.amberD, textAlign: 'right' }}>Product B</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.lbl} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: 4, padding: '5px 0', borderBottom: i === rows.length - 1 ? `1.5px solid ${T.c800}` : `1px solid ${T.c100}`, alignItems: 'center' }}>
          <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>{r.lbl}</span>
          <span style={{ fontFamily: T.font, fontSize: 12, textAlign: 'right' }}>{fmt.aud(r.a)}</span>
          <span style={{ fontFamily: T.font, fontSize: 12, textAlign: 'right', color: T.amberD }}>{fmt.aud(r.b)}</span>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: 4, padding: '6px 0', alignItems: 'center' }}>
        <span style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c800 }}>Total Cost (TCO)</span>
        <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 500, textAlign: 'right' }}>{fmt.aud(rA.TC_base)}</span>
        <span style={{ fontFamily: T.font, fontSize: 14, fontWeight: 500, textAlign: 'right', color: T.amberD }}>{fmt.aud(rB.TC_base)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', gap: 4, padding: '6px 8px', background: T.c050, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c400 }}>NPV (A vs B)</span>
        <span style={{ fontFamily: T.font, fontSize: 13, color: npv >= 0 ? T.success : T.error }}>
          {npv >= 0 ? 'A saves ' : 'A costs more by '}{fmt.aud(Math.abs(npv))} over {PL} yr
        </span>
        <span />
      </div>
      <SectionHead>Cumulative Cost — {PL}-Year Profile (Present Value)</SectionHead>
      <LineChart series={chartSeries} height={130} />
      <div style={{ fontFamily: T.font, fontSize: 8, color: T.c300, marginTop: 6, letterSpacing: '0.04em', lineHeight: 1.5 }}>
        Costs in present value terms, discounted at {fmt.pct(proj.d * 100, 1)}. Step changes in the chart indicate scheduled replacement events.
      </div>
      {(rA.replaceSchedule.length > 0 || rB.replaceSchedule.length > 0) && (
        <div style={{ marginTop: 16 }}>
          <SectionHead>Replacement Schedule</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[{ label: 'Product A', schedule: rA.replaceSchedule }, { label: 'Product B', schedule: rB.replaceSchedule }].map(p => (
              <div key={p.label}>
                <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.c400, marginBottom: 6 }}>{p.label}</div>
                {p.schedule.length === 0
                  ? <div style={{ fontFamily: T.font, fontSize: 11, color: T.c300 }}>No replacements within project life</div>
                  : p.schedule.map(r => (
                    <div key={r.n} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: `1px solid ${T.c100}` }}>
                      <span style={{ fontFamily: T.font, fontSize: 10, color: T.c400 }}>Replacement {r.n} — Year {r.replacementYear}</span>
                      <span style={{ fontFamily: T.font, fontSize: 10 }}>{fmt.aud(r.presentValue)} PV</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
