import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

const PANEL = {
  background: 'transparent',
};

const headerRow = {
  display: 'grid', gridTemplateColumns: '1fr 110px 110px',
  alignItems: 'baseline', columnGap: 14,
  paddingBottom: 6, borderBottom: `1px solid ${T.INK}`, marginBottom: 4,
};

const dataRow = {
  display: 'grid', gridTemplateColumns: '1fr 110px 110px',
  alignItems: 'baseline', columnGap: 14,
  padding: '8px 0', borderBottom: `1px solid ${T.SUBTLE}`,
};

const totalRow = {
  ...dataRow,
  borderTop: `1px solid ${T.INK}`,
  borderBottom: 'none',
  marginTop: 2,
};

const labelStyle = { fontFamily: T.SANS, fontSize: 12, color: T.INK };
const numStyle = (color, bold = false) => ({
  fontFamily: T.MONO, fontSize: 12, fontWeight: bold ? 600 : 500,
  color, textAlign: 'right',
});

const Header = ({ colorA, colorB }) => (
  <div style={headerRow}>
    <span style={micro}>METRIC</span>
    <span style={{ ...micro, color: colorA, textAlign: 'right' }}>PRODUCT A</span>
    <span style={{ ...micro, color: colorB, textAlign: 'right' }}>PRODUCT B</span>
  </div>
);

const Pair = ({ label, aText, bText, colorA, colorB, total = false }) => (
  <div style={total ? totalRow : dataRow}>
    <span style={{ ...labelStyle, fontWeight: total ? 600 : 500 }}>{label}</span>
    <span style={numStyle(colorA, total)}>{aText}</span>
    <span style={numStyle(colorB, total)}>{bText}</span>
  </div>
);

const Caption = ({ children }) => (
  <div style={{ ...micro, marginTop: 12, lineHeight: 1.6 }}>{children}</div>
);

export const TCODetail = ({ rA, rB, colorA, colorB, PL }) => (
  <div style={PANEL}>
    <Header colorA={colorA} colorB={colorB} />
    <Pair label="Initial capital"          aText={fmt.aud(rA.C_initial)}     bText={fmt.aud(rB.C_initial)}     colorA={colorA} colorB={colorB} />
    <Pair label="PV of energy costs"       aText={fmt.aud(rA.pvEnergyTotal)} bText={fmt.aud(rB.pvEnergyTotal)} colorA={colorA} colorB={colorB} />
    <Pair label="PV of replacements"       aText={fmt.aud(rA.PV_replace)}    bText={fmt.aud(rB.PV_replace)}    colorA={colorA} colorB={colorB} />
    <Pair label="Total Cost of Ownership"  aText={fmt.aud(rA.TC_base)}       bText={fmt.aud(rB.TC_base)}       colorA={colorA} colorB={colorB} total />
    <Caption>[ DISCOUNTED PRESENT VALUES OVER {PL}-YR PROJECT LIFE · AUD ]</Caption>
  </div>
);

export const GWPDetail = ({ rA, rB, colorA, colorB, PL }) => (
  <div style={PANEL}>
    <Header colorA={colorA} colorB={colorB} />
    <Pair label="Embodied carbon"          aText={fmt.co2(rA.gwpBase.embodied)}    bText={fmt.co2(rB.gwpBase.embodied)}    colorA={colorA} colorB={colorB} />
    <Pair label="Operational carbon"       aText={fmt.co2(rA.gwpBase.operational)} bText={fmt.co2(rB.gwpBase.operational)} colorA={colorA} colorB={colorB} />
    <Pair label="Total Global Warming Potential" aText={fmt.co2(rA.gwpBase.total)} bText={fmt.co2(rB.gwpBase.total)} colorA={colorA} colorB={colorB} total />
    <Caption>[ EMBODIED + OPERATIONAL · GRID DECARBONISATION APPLIED OVER {PL}-YR LIFE · SEE CARBON-SPLIT CHART BELOW ]</Caption>
  </div>
);

export const EnergyDetail = ({ rA, rB, colorA, colorB }) => (
  <div style={PANEL}>
    <Header colorA={colorA} colorB={colorB} />
    <Pair label="Annual energy"            aText={fmt.kwh(rA.E_base)}          bText={fmt.kwh(rB.E_base)}          colorA={colorA} colorB={colorB} />
    <Pair label="Equivalent capacity"      aText={`${fmt.num(rA.Q_adj, 0)} W`} bText={`${fmt.num(rB.Q_adj, 0)} W`} colorA={colorA} colorB={colorB} />
    <Pair label="Efficacy"                 aText={fmt.lmw(rA.EFF)}             bText={fmt.lmw(rB.EFF)}             colorA={colorA} colorB={colorB} />
    <Pair label="Luminaire lifetime"       aText={fmt.yr(rA.L_base)}           bText={fmt.yr(rB.L_base)}           colorA={colorA} colorB={colorB} />
    <Caption>[ ANNUAL ENERGY = CAPACITY × OPERATING HOURS · LIFETIME REFLECTS LUMEN MAINTENANCE ]</Caption>
  </div>
);

const YearRibbon = ({ schedule, color }) => {
  if (!schedule || schedule.length === 0) {
    return <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.MUTED, padding: '6px 0' }}>NO REPLACEMENTS WITHIN PROJECT LIFE</div>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 0' }}>
      {schedule.map(r => (
        <span key={r.n} style={{
          fontFamily: T.MONO, fontSize: 10, color,
          border: `1px solid ${color}`, padding: '2px 6px',
          letterSpacing: '0.06em',
        }}>
          YR {String(r.replacementYear).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
};

export const CapitalDetail = ({ rA, rB, colorA, colorB, PL }) => (
  <div style={PANEL}>
    <Header colorA={colorA} colorB={colorB} />
    <Pair label="Initial capital"          aText={fmt.aud(rA.C_initial)}  bText={fmt.aud(rB.C_initial)}  colorA={colorA} colorB={colorB} />
    <Pair label={`Replacements (${PL} yr)`} aText={`${rA.N_replace}×`}    bText={`${rB.N_replace}×`}     colorA={colorA} colorB={colorB} />
    <Pair label="PV of replacements"       aText={fmt.aud(rA.PV_replace)} bText={fmt.aud(rB.PV_replace)} colorA={colorA} colorB={colorB} />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, marginTop: 14 }}>
      <div>
        <div style={{ ...micro, color: colorA, paddingBottom: 4, borderBottom: `1px solid ${T.INK}`, marginBottom: 2 }}>
          PRODUCT A · REPLACEMENT YEARS
        </div>
        <YearRibbon schedule={rA.replaceSchedule} color={colorA} />
      </div>
      <div>
        <div style={{ ...micro, color: colorB, paddingBottom: 4, borderBottom: `1px solid ${T.INK}`, marginBottom: 2 }}>
          PRODUCT B · REPLACEMENT YEARS
        </div>
        <YearRibbon schedule={rB.replaceSchedule} color={colorB} />
      </div>
    </div>
    <Caption>[ CAPITAL OUTLAY IS UPFRONT · REPLACEMENT COSTS ARE DISCOUNTED TO PRESENT VALUE ]</Caption>
  </div>
);

export const PhotoDetail = ({ aValue, bValue, colorA, colorB, caption }) => (
  <div style={PANEL}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28 }}>
      <div style={{ borderTop: `2px solid ${colorA}`, paddingTop: 10 }}>
        <div style={{ ...micro, color: colorA }}>PRODUCT A</div>
        <div style={{ fontFamily: T.MONO, fontSize: 32, fontWeight: 500, color: colorA, lineHeight: 1.1, marginTop: 4 }}>
          {aValue ?? '—'}
        </div>
      </div>
      <div style={{ borderTop: `2px solid ${colorB}`, paddingTop: 10 }}>
        <div style={{ ...micro, color: colorB }}>PRODUCT B</div>
        <div style={{ fontFamily: T.MONO, fontSize: 32, fontWeight: 500, color: colorB, lineHeight: 1.1, marginTop: 4 }}>
          {bValue ?? '—'}
        </div>
      </div>
    </div>
    {caption && <Caption>{caption}</Caption>}
  </div>
);
