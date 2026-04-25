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
      <Rule />
      <SectionHead>Cumulative Emissions — {proj.PL}-Year Profile</SectionHead>
      <LineChart series={chartSeries} height={130} />
      <div style={{ fontFamily: T.font, fontSize: 8, color: T.c300, marginTop: 6, letterSpacing: '0.04em', lineHeight: 1.5 }}>
        Operational emissions adjusted year-by-year for grid decarbonisation (GD {fmt.pct(proj.GD * 100, 0)} over {proj.GDT} yr).
        Embodied carbon allocated at installation and replacement events.
      </div>
    </div>
  );
};
