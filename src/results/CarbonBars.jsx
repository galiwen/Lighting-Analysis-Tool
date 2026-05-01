import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

const Bar = ({ name, gwp, max, color, colorD }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
    <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 500, color }}>{name}</span>
    <div style={{ position: 'relative', height: 18, background: T.SUBTLE }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%',
                    width: (gwp.embodied / max * 100) + '%', background: colorD }} />
      <div style={{ position: 'absolute', left: (gwp.embodied / max * 100) + '%', top: 0, height: '100%',
                    width: (gwp.operational / max * 100) + '%', background: color }} />
    </div>
    <span style={{ fontFamily: T.MONO, fontSize: 12, color, textAlign: 'right' }}>{fmt.co2(gwp.total)}</span>
  </div>
);

export const CarbonBars = ({ rA, rB, labelA, labelB, colorA, colorB, colorAd, colorBd }) => {
  if (!rA || !rB) return null;
  const max = Math.max(rA.gwpBase.total, rB.gwpBase.total) * 1.1;
  const tickStep =
    max > 200000 ? 50000 :
    max > 100000 ? 25000 :
    max > 40000  ? 10000 :
    max > 4000   ?  1000 : 500;
  const ticks = [];
  for (let v = 0; v <= max; v += tickStep) ticks.push(v);

  const tickLabel = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

  return (
    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.RULE}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600 }}>04 · Carbon breakdown</span>
        <span style={micro}>[ kgCO₂e · LIFECYCLE ]</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px', gap: 12, marginBottom: 4 }}>
        <span />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {ticks.map(v => <span key={v} style={{ ...micro, fontSize: 8 }}>{tickLabel(v)}</span>)}
        </div>
        <span />
      </div>
      <Bar name={labelA} gwp={rA.gwpBase} max={max} color={colorA} colorD={colorAd} />
      <Bar name={labelB} gwp={rB.gwpBase} max={max} color={colorB} colorD={colorBd} />
      <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: colorAd }} />
          <span style={{ ...micro, fontSize: 9 }}>Embodied (mfg + EOL)</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, background: colorA }} />
          <span style={{ ...micro, fontSize: 9 }}>Operational (electricity)</span>
        </span>
      </div>
    </div>
  );
};
