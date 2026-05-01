import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

export const ControlsTable = ({ rA, rB, ctrl, PL: _PL }) => {
  if (!rA?.ctrlResults || !rB?.ctrlResults) return null;
  const cr  = rA.ctrlResults;
  const crB = rB.ctrlResults;
  const pb = cr.simple_payback;
  const inLoan = pb <= ctrl.LT;

  const scenarios = [
    { lab: 'Base case',        eA: rA.E_base,           tcA: rA.TC_base,           gA: rA.gwpBase.total,
                               eB: rB.E_base,           tcB: rB.TC_base,           gB: rB.gwpBase.total },
    { lab: '+ Controls',       eA: cr.E_control,        tcA: cr.TC_control,        gA: cr.gwpCtrl.total,
                               eB: crB.E_control,       tcB: crB.TC_control,       gB: crB.gwpCtrl.total },
    { lab: '+ Controls + Dim', eA: cr.E_control_maint,  tcA: cr.TC_control_maint,  gA: cr.gwpCtrlMaint.total,
                               eB: crB.E_control_maint, tcB: crB.TC_control_maint, gB: crB.gwpCtrlMaint.total },
  ];

  const headerColor = i =>
    (i === 2 || i === 4 || i === 6) ? T.VERM
      : (i === 1 || i === 3 || i === 5) ? T.BLUE
      : T.INK;

  return (
    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.RULE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600 }}>08 · Controls — three-scenario breakdown</span>
        <span style={micro}>[ ALL SCENARIOS ASSUME LOAN-FINANCED CONTROLS ]</span>
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
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderTop: `1px solid ${T.INK}`, borderBottom: `1px solid ${T.INK}` }}>
            {['Scenario', 'Energy A', 'Energy B', 'TCO A', 'TCO B', 'GWP A', 'GWP B'].map((h, i) => (
              <th key={h} style={{ ...micro, padding: '6px 4px', textAlign: i === 0 ? 'left' : 'right', color: headerColor(i) }}>
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
              <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.VERM }}>{fmt.kwh(sc.eB)}</td>
              <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.BLUE }}>{fmt.aud(sc.tcA)}</td>
              <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.VERM }}>{fmt.aud(sc.tcB)}</td>
              <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.BLUE }}>{fmt.co2(sc.gA)}</td>
              <td style={{ fontFamily: T.MONO, fontSize: 11, padding: '6px 4px', textAlign: 'right', color: T.VERM }}>{fmt.co2(sc.gB)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ ...micro, fontSize: 9, marginTop: 8, lineHeight: 1.5 }}>
        Controls reduce operational emissions via lower energy use, and embodied emissions via fewer replacement cycles thanks to longer effective lifetime.
      </div>
    </div>
  );
};
