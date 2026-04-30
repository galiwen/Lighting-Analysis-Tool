import { T } from '../design/tokens.js';
import { Rule } from '../components/atoms.jsx';
import { PieChart, LineChart } from '../components/charts.jsx';
import { fmt } from '../components/format.js';
import { MetaCell, SectionHead, EmptyState } from './shared.jsx';

export const GWPTab = ({ rA, rB, proj }) => {
  if (!rA || !rB) return <EmptyState />;

  const chartSeries = [
    { label: 'Product A', color: T.c800, data: rA.emissionsProfile.map(p => p.cumulativeEmissions) },
    { label: 'Product B', color: T.amber, data: rB.emissionsProfile.map(p => p.cumulativeEmissions) },
  ];

  const products = [
    { label: 'Product A', g: rA.gwpBase, embColor: T.c800, opColor: T.c500 },
    { label: 'Product B', g: rB.gwpBase, embColor: T.amber, opColor: T.amberD },
  ];

  const ctrlScenarios = rA.ctrlResults && rB?.ctrlResults ? [
    { label: 'Base Case',            gA: rA.gwpBase,                  gB: rB.gwpBase },
    { label: '+ Controls',           gA: rA.ctrlResults.gwpCtrl,      gB: rB.ctrlResults.gwpCtrl },
    { label: '+ Controls + Dimming', gA: rA.ctrlResults.gwpCtrlMaint, gB: rB.ctrlResults.gwpCtrlMaint },
  ] : null;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
        {products.map(({ label, g, embColor, opColor }) => (
          <div key={label}>
            <SectionHead>{label} — Carbon Breakdown</SectionHead>
            <PieChart
              size={130}
              centerLabel={`${(g.total / 1000).toFixed(0)}t`}
              slices={[
                { label: 'Embodied', value: g.embodied, color: embColor },
                { label: 'Operational', value: g.operational, color: opColor },
              ]}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <MetaCell label="Embodied" value={fmt.co2(g.embodied)} sub={`${g.embodiedPercent.toFixed(0)}% of total`} />
              <MetaCell label="Operational" value={fmt.co2(g.operational)} sub={`${g.operationalPercent.toFixed(0)}% of total`} />
            </div>
            <div style={{ marginTop: 6 }}>
              <MetaCell label="Total GWP" value={fmt.co2(g.total)} emphasis />
            </div>
          </div>
        ))}
      </div>

      {ctrlScenarios && (
        <>
          <Rule />
          <SectionHead>Control Scenario GWP</SectionHead>
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid ${T.c800}` }}>
                  {['Scenario','Embodied A','Embodied B','Operational A','Operational B','Total A','Total B'].map((h, i) => (
                    <th key={h} style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: (i === 2 || i === 4 || i === 6) ? T.amberD : T.c400, padding: '5px 4px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ctrlScenarios.map((sc, i) => (
                  <tr key={sc.label} style={{ borderBottom: `1px solid ${T.c100}`, background: i === 0 ? T.white : T.c050 }}>
                    <td style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.06em', color: T.c400, padding: '5px 4px' }}>{sc.label}</td>
                    <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: i > 0 ? T.success : T.c800 }}>{fmt.co2(sc.gA.embodied)}</td>
                    <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: T.amberD }}>{fmt.co2(sc.gB.embodied)}</td>
                    <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: i > 0 ? T.success : T.c800 }}>{fmt.co2(sc.gA.operational)}</td>
                    <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: T.amberD }}>{fmt.co2(sc.gB.operational)}</td>
                    <td style={{ fontFamily: T.font, fontSize: 11, fontWeight: 500, textAlign: 'right', padding: '5px 4px', color: i > 0 ? T.success : T.c800 }}>{fmt.co2(sc.gA.total)}</td>
                    <td style={{ fontFamily: T.font, fontSize: 11, fontWeight: 500, textAlign: 'right', padding: '5px 4px', color: T.amberD }}>{fmt.co2(sc.gB.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontFamily: T.font, fontSize: 8, color: T.c300, marginTop: -10, marginBottom: 4, letterSpacing: '0.04em', lineHeight: 1.5 }}>
            Controls reduce operational emissions via lower energy use, and embodied emissions via fewer replacement cycles thanks to the longer effective lifetime.
          </div>
        </>
      )}

      <Rule />
      <SectionHead>Cumulative Emissions — {proj.PL}-Year Profile</SectionHead>
      <LineChart series={chartSeries} height={130} />
      <div style={{ fontFamily: T.font, fontSize: 8, color: T.c300, marginTop: 6, letterSpacing: '0.04em', lineHeight: 1.5 }}>
        Operational emissions adjusted year-by-year for grid decarbonisation (GD {fmt.pct(proj.GD * 100, 0)} over {proj.GDT} yr).
        Embodied carbon allocated at installation and replacement events.
        {ctrlScenarios && ' Chart shows base case only; see table above for control scenario totals.'}
      </div>
    </div>
  );
};
