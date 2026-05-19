import { useState, useRef } from 'react';
import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';
import { Tooltip } from '../components/Tooltip.jsx';

const pctDelta = (a, b) => {
  if (!b) return '—';
  const p = ((a - b) / b) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};

const hatchStyle = (color) => ({
  backgroundColor: color,
  backgroundImage:
    `repeating-linear-gradient(45deg, ${color} 0 5px, #FFFFFF 5px 7px)`,
});

const tickStep = (max) =>
  max > 200000 ? 50000 :
  max > 100000 ? 25000 :
  max > 40000  ? 10000 :
  max > 4000   ?  1000 : 500;

const tickLabel = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

const TickRow = ({ max }) => {
  const step = tickStep(max);
  const ticks = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px', gap: 12, marginBottom: 4 }}>
      <span />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {ticks.map(v => <span key={v} style={{ ...micro, fontSize: 8 }}>{tickLabel(v)}</span>)}
      </div>
      <span />
    </div>
  );
};

const segHandlers = (onHover, lines) => ({
  onMouseEnter: (e) => onHover({ x: e.clientX, y: e.clientY, lines }),
  onMouseMove:  (e) => onHover({ x: e.clientX, y: e.clientY, lines }),
  onMouseLeave: ()  => onHover(null),
});

const CostBar = ({ name, value, max, color, onHover }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
    <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 500, color: T.INK }}>{name}</span>
    <div style={{ position: 'relative', height: 18, background: T.SUBTLE }}>
      <div
        style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: (value / max * 100) + '%', background: color,
          cursor: 'crosshair',
        }}
        {...segHandlers(onHover, [`${name.toUpperCase()} · TCO`, fmt.aud(value)])}
      />
    </div>
    <span style={{ fontFamily: T.MONO, fontSize: 12, color: T.INK, textAlign: 'right' }}>{fmt.aud(value)}</span>
  </div>
);

const CarbonBar = ({ name, gwp, max, color, colorD, onHover }) => {
  const embWidth = gwp.embodied / max * 100;
  const opWidth = gwp.operational / max * 100;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
      <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 500, color: T.INK }}>{name}</span>
      <div style={{ position: 'relative', height: 18, background: T.SUBTLE }}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: embWidth + '%', ...hatchStyle(colorD), cursor: 'crosshair',
          }}
          {...segHandlers(onHover, [`${name.toUpperCase()} · EMBODIED`, fmt.co2(gwp.embodied)])}
        />
        <div
          style={{
            position: 'absolute', left: embWidth + '%', top: 0, height: '100%',
            width: opWidth + '%', background: color, cursor: 'crosshair',
          }}
          {...segHandlers(onHover, [`${name.toUpperCase()} · OPERATIONAL`, fmt.co2(gwp.operational)])}
        />
      </div>
      <span style={{ fontFamily: T.MONO, fontSize: 12, color: T.INK, textAlign: 'right' }}>{fmt.co2(gwp.total)}</span>
    </div>
  );
};

export const ControlsTable = ({ rA, ctrl, PL: _PL }) => {
  const [tooltip, setTooltip] = useState(null);
  const wrapperRef = useRef(null);

  if (!rA?.ctrlResults) return null;
  const cr = rA.ctrlResults;
  const pb = cr.simple_payback;
  const inLoan = pb <= ctrl.LT;
  const colorA = T.BLUE;
  const colorAd = T.BLUE_D;

  const handleHover = (info) => {
    if (!info || !wrapperRef.current) { setTooltip(null); return; }
    const rect = wrapperRef.current.getBoundingClientRect();
    setTooltip({ x: info.x - rect.left, y: info.y - rect.top, lines: info.lines });
  };

  const scenarios = [
    {
      lab: 'Base',
      eA: cr.base.E,
      LA: cr.base.L,
      nA: cr.base.N_replace,
      tcA: cr.base.TC,
      gwpA: cr.base.gwp,
      loan: '—',
    },
    {
      lab: '+ Controls',
      eA: cr.E_control,
      LA: cr.L_control,
      nA: cr.N_replace_ctrl,
      tcA: cr.TC_control,
      gwpA: cr.gwpCtrl,
      loan: `${fmt.aud(cr.ALP)}/yr`,
    },
    {
      lab: '+ Controls + Dim',
      eA: cr.E_control_maint,
      LA: cr.L_control_maint,
      nA: cr.N_replace_ctrl_maint,
      tcA: cr.TC_control_maint,
      gwpA: cr.gwpCtrlMaint,
      loan: `${fmt.aud(cr.ALP)}/yr`,
    },
  ];

  const co2Diff = (from, to) => {
    const delta = from - to;
    const pct = from ? (delta / from) * 100 : 0;
    return { delta, pct };
  };
  const dBase2Ctrl  = co2Diff(cr.base.gwp.total, cr.gwpCtrl.total);
  const dCtrl2Maint = co2Diff(cr.gwpCtrl.total, cr.gwpCtrlMaint.total);
  const dBase2Maint = co2Diff(cr.base.gwp.total, cr.gwpCtrlMaint.total);

  const carbonCells = [
    { lab: 'Base → + Controls',         d: dBase2Ctrl },
    { lab: '+ Controls → + Ctrl + Dim', d: dCtrl2Maint },
    { lab: 'Base → + Controls + Dim',   d: dBase2Maint },
  ];

  const costMax = Math.max(...scenarios.map(s => s.tcA)) * 1.1;
  const gwpMax  = Math.max(...scenarios.map(s => s.gwpA.total)) * 1.1;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', padding: '20px 28px', borderBottom: `1px solid ${T.INK}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <div style={{ padding: '10px 12px', border: `1px solid ${T.SUBTLE}` }}>
          <div style={micro}>Control system cost</div>
          <div style={{ fontFamily: T.SANS, fontSize: 18, fontWeight: 600, marginTop: 4 }}>{fmt.aud(cr.ACC_total)}</div>
          <div style={{ ...micro, fontSize: 8, marginTop: 2 }}>Additional capital · A</div>
        </div>
        <div style={{ padding: '10px 12px', border: `1px solid ${T.SUBTLE}` }}>
          <div style={micro}>Annual energy saving</div>
          <div style={{ fontFamily: T.SANS, fontSize: 18, fontWeight: 600, marginTop: 4 }}>{fmt.aud(cr.annual_savings)}</div>
          <div style={{ ...micro, fontSize: 8, marginTop: 2 }}>vs base · A</div>
        </div>
        <div style={{
          padding: '10px 12px',
          border: `1px solid ${inLoan ? T.SUCCESS : T.WARN_BD}`,
          background: inLoan ? '#F0F7F2' : T.WARN_BG,
        }}>
          <div style={micro}>Simple payback</div>
          <div style={{ fontFamily: T.SANS, fontSize: 18, fontWeight: 600, marginTop: 4, color: inLoan ? T.SUCCESS : T.WARN_BD }}>
            {pb === Infinity ? '∞' : fmt.yr(pb)}
          </div>
          <div style={{ ...micro, fontSize: 8, marginTop: 2 }}>{inLoan ? 'Within loan term ✓' : 'Exceeds loan term ⚠'}</div>
        </div>
        <div style={{ padding: '10px 12px', border: `1px solid ${T.SUBTLE}` }}>
          <div style={micro}>Total loan payments</div>
          <div style={{ fontFamily: T.SANS, fontSize: 18, fontWeight: 600, marginTop: 4 }}>{fmt.aud(cr.TLP)}</div>
          <div style={{ ...micro, fontSize: 8, marginTop: 2 }}>Over {ctrl.LT} yr @ {fmt.pct(ctrl.r * 100, 1)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
        {carbonCells.map(c => {
          const avoided = c.d.delta >= 0;
          return (
            <div key={c.lab} style={{ padding: '10px 12px', border: `1px solid ${T.SUBTLE}` }}>
              <div style={micro}>{c.lab}</div>
              <div style={{
                fontFamily: T.SANS, fontSize: 18, fontWeight: 600, marginTop: 4,
                color: avoided ? T.SUCCESS : T.ERROR,
              }}>
                {avoided ? '−' : '+'}{fmt.co2(Math.abs(c.d.delta))}
              </div>
              <div style={{ ...micro, fontSize: 8, marginTop: 2 }}>
                Carbon avoided · {avoided ? '−' : '+'}{Math.abs(c.d.pct).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600 }}>Total Cost of Ownership</span>
          <span style={micro}>[ AUD · NPV ]</span>
        </div>
        <TickRow max={costMax} />
        {scenarios.map(s => (
          <CostBar key={s.lab} name={s.lab} value={s.tcA} max={costMax} color={colorA} onHover={handleHover} />
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600 }}>Lifecycle carbon</span>
          <span style={micro}>[ kgCO₂e · LIFECYCLE ]</span>
        </div>
        <TickRow max={gwpMax} />
        {scenarios.map(s => (
          <CarbonBar key={s.lab} name={s.lab} gwp={s.gwpA} max={gwpMax} color={colorA} colorD={colorAd} onHover={handleHover} />
        ))}
        <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, ...hatchStyle(colorAd) }} />
            <span style={{ ...micro, fontSize: 9 }}>Embodied (mfg + EOL)</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: colorA }} />
            <span style={{ ...micro, fontSize: 9 }}>Operational (electricity)</span>
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderTop: `1px solid ${T.INK}`, borderBottom: `1px solid ${T.INK}` }}>
              {['Scenario', 'Energy A', 'Lifetime A', 'Repls A', 'Loan/yr'].map((h, i) => (
                <th key={h} style={{ ...micro, padding: '6px 4px', textAlign: i === 0 ? 'left' : 'right', color: i === 0 ? T.INK : T.BLUE, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(sc => (
              <tr key={sc.lab} style={{ borderBottom: `1px solid ${T.SUBTLE}` }}>
                <td style={{ fontFamily: T.SANS, fontSize: 12, padding: '6px 4px' }}>{sc.lab}</td>
                <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.BLUE }}>{fmt.kwh(sc.eA)}</td>
                <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.BLUE }}>{fmt.yr(sc.LA)}</td>
                <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.BLUE }}>{sc.nA}×</td>
                <td style={{ fontFamily: T.MONO, fontSize: 10, padding: '6px 4px', textAlign: 'right', color: T.MUTED }}>{sc.loan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...micro, fontSize: 9, marginTop: 8, lineHeight: 1.5 }}>
        Main A-vs-B results above use the <strong>+ Controls + Dim</strong> scenario for both products. Controls reduce operational emissions via lower energy use, and embodied emissions via fewer replacement cycles thanks to longer effective lifetime. Δ vs base · A: TCO {pctDelta(cr.TC_control_maint, cr.base.TC)}, GWP {pctDelta(cr.gwpCtrlMaint.total, cr.base.gwp.total)}, Energy {pctDelta(cr.E_control_maint, cr.base.E)}.
      </div>

      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} lines={tooltip.lines} />}
    </div>
  );
};
