import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

const pctDelta = (a, b) => {
  if (!b) return '—';
  const p = ((a - b) / b) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};

export const ControlsTable = ({ rA, ctrl, PL: _PL }) => {
  if (!rA?.ctrlResults) return null;
  const cr = rA.ctrlResults;
  const pb = cr.simple_payback;
  const inLoan = pb <= ctrl.LT;

  const scenarios = [
    {
      lab: 'Base case',
      eA: cr.base.E,
      LA: cr.base.L,        nA: cr.base.N_replace,
      tcA: cr.base.TC,
      embA: cr.base.gwp.embodied, opA: cr.base.gwp.operational, gA: cr.base.gwp.total,
      loan: '—',
    },
    {
      lab: '+ Controls',
      eA: cr.E_control,
      LA: cr.L_control,           nA: cr.N_replace_ctrl,
      tcA: cr.TC_control,
      embA: cr.gwpCtrl.embodied,  opA: cr.gwpCtrl.operational,  gA: cr.gwpCtrl.total,
      loan: `${fmt.aud(cr.ALP)}/yr`,
    },
    {
      lab: '+ Controls + Dim',
      eA: cr.E_control_maint,
      LA: cr.L_control_maint,         nA: cr.N_replace_ctrl_maint,
      tcA: cr.TC_control_maint,
      embA: cr.gwpCtrlMaint.embodied, opA: cr.gwpCtrlMaint.operational, gA: cr.gwpCtrlMaint.total,
      loan: `${fmt.aud(cr.ALP)}/yr`,
    },
  ];

  const co2Diff = (from, to) => {
    const delta = from - to;
    const pct = from ? (delta / from) * 100 : 0;
    return { delta, pct };
  };
  const dBase2Ctrl    = co2Diff(cr.base.gwp.total, cr.gwpCtrl.total);
  const dCtrl2Maint   = co2Diff(cr.gwpCtrl.total, cr.gwpCtrlMaint.total);
  const dBase2Maint   = co2Diff(cr.base.gwp.total, cr.gwpCtrlMaint.total);

  const carbonCells = [
    { lab: 'Base → + Controls',           d: dBase2Ctrl },
    { lab: '+ Controls → + Ctrl + Dim',   d: dCtrl2Maint },
    { lab: 'Base → + Controls + Dim',     d: dBase2Maint },
  ];

  const headers = [
    'Scenario','Energy A','Lifetime A','Repls A','TCO A','Embodied A','Operational A','GWP A','Loan/yr',
  ];
  const aIdx = new Set([1, 2, 3, 4, 5, 6, 7]);
  const headerColor = i => aIdx.has(i) ? T.BLUE : T.INK;

  const numStyle = (color, sz = 11) => ({ fontFamily: T.MONO, fontSize: sz, padding: '6px 4px', textAlign: 'right', color });

  return (
    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.RULE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600 }}>09 · Controls — scenario breakdown</span>
        <span style={micro}>[ ALL CONTROLS SCENARIOS ASSUME LOAN-FINANCED CAPITAL ]</span>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14, padding: '10px 12px', background: T.BG_PANEL, border: `1px solid ${T.SUBTLE}` }}>
        <div style={{ ...micro, fontSize: 9, gridColumn: '1 / -1', marginBottom: 4 }}>[ CARBON AVOIDED · PRODUCT A ]</div>
        {carbonCells.map(c => (
          <div key={c.lab}>
            <div style={{ ...micro, fontSize: 8.5, color: T.MUTED }}>{c.lab}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{ fontFamily: T.SANS, fontSize: 14, fontWeight: 600, color: c.d.delta >= 0 ? T.SUCCESS : T.ERROR }}>
                {c.d.delta >= 0 ? '−' : '+'}{fmt.co2(Math.abs(c.d.delta))}
              </span>
              <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.MUTED }}>
                ({c.d.delta >= 0 ? '−' : '+'}{Math.abs(c.d.pct).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderTop: `1px solid ${T.INK}`, borderBottom: `1px solid ${T.INK}` }}>
              {headers.map((h, i) => (
                <th key={h} style={{ ...micro, padding: '6px 4px', textAlign: i === 0 ? 'left' : 'right', color: headerColor(i), whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map(sc => (
              <tr key={sc.lab} style={{ borderBottom: `1px solid ${T.SUBTLE}` }}>
                <td style={{ fontFamily: T.SANS, fontSize: 12, padding: '6px 4px' }}>{sc.lab}</td>
                <td style={numStyle(T.BLUE)}>{fmt.kwh(sc.eA)}</td>
                <td style={numStyle(T.BLUE)}>{fmt.yr(sc.LA)}</td>
                <td style={numStyle(T.BLUE)}>{sc.nA}×</td>
                <td style={numStyle(T.BLUE)}>{fmt.aud(sc.tcA)}</td>
                <td style={numStyle(T.BLUE)}>{fmt.co2(sc.embA)}</td>
                <td style={numStyle(T.BLUE)}>{fmt.co2(sc.opA)}</td>
                <td style={numStyle(T.BLUE)}>{fmt.co2(sc.gA)}</td>
                <td style={numStyle(T.MUTED, 10)}>{sc.loan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ ...micro, fontSize: 9, marginTop: 8, lineHeight: 1.5 }}>
        Main A-vs-B results above use the <strong>+ Controls + Dim</strong> scenario for both products. Controls reduce operational emissions via lower energy use, and embodied emissions via fewer replacement cycles thanks to longer effective lifetime. Δ vs base · A: TCO {pctDelta(cr.TC_control_maint, cr.base.TC)}, GWP {pctDelta(cr.gwpCtrlMaint.total, cr.base.gwp.total)}, Energy {pctDelta(cr.E_control_maint, cr.base.E)}.
      </div>
    </div>
  );
};
