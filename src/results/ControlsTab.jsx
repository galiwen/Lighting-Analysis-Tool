import { T } from '../design/tokens.js';
import { StatBox } from '../components/atoms.jsx';
import { fmt } from '../components/format.js';
import { EmptyState } from './shared.jsx';

export const ControlsTab = ({ rA, rB, proj, ctrl }) => {
  if (!rA?.ctrlResults) return <EmptyState />;

  const cr = rA.ctrlResults;
  const pb = cr.simple_payback;

  const scenarios = [
    { label: 'Base Case',             eA: rA.E_base,                  LA: rA.L_base,                nA: rA.N_replace,                tcA: rA.TC_base,                eB: rB?.E_base,                  tcB: rB?.TC_base,                loan: '—' },
    { label: '+ Controls',            eA: cr.E_control,               LA: cr.L_control,             nA: cr.N_replace_ctrl,           tcA: cr.TC_control,             eB: rB?.ctrlResults?.E_control,  tcB: rB?.ctrlResults?.TC_control, loan: `${fmt.aud(cr.ALP)}/yr` },
    { label: '+ Controls + Dimming',  eA: cr.E_control_maint,         LA: cr.L_control_maint,       nA: cr.N_replace_ctrl_maint,     tcA: cr.TC_control_maint,       eB: rB?.ctrlResults?.E_control_maint, tcB: rB?.ctrlResults?.TC_control_maint, loan: `${fmt.aud(cr.ALP)}/yr` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatBox lbl="Control System Cost" val={fmt.aud(cr.ACC_total)} sub="Additional capital (Product A)" />
        <StatBox lbl="Annual Energy Saving" val={fmt.aud(cr.annual_savings)} sub="vs base case" />
        <StatBox lbl="Simple Payback" val={pb === Infinity ? '∞' : `${pb.toFixed(1)} yrs`}
          sub={pb <= ctrl.LT ? 'Within loan term ✓' : 'Exceeds loan term ⚠'} accent={pb <= ctrl.LT} />
        <StatBox lbl="Total Loan Payments" val={fmt.aud(cr.TLP)} sub={`Over ${ctrl.LT} yr @ ${fmt.pct(ctrl.r * 100, 1)}`} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.font }}>
          <thead>
            <tr style={{ borderBottom: `1.5px solid ${T.c800}` }}>
              {['Scenario','Energy A','Energy B','Lifetime A','Repls A','TCO A','TCO B','Loan/yr'].map((h, i) => (
                <th key={h} style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === 2 || i === 6 ? T.amberD : T.c400, padding: '5px 4px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((sc, i) => (
              <tr key={sc.label} style={{ borderBottom: `1px solid ${T.c100}`, background: i === 0 ? T.white : T.c050 }}>
                <td style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.06em', color: T.c400, padding: '5px 4px' }}>{sc.label}</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: i > 0 ? T.success : T.c800 }}>{fmt.kwh(sc.eA)}</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: T.amberD }}>{sc.eB != null ? fmt.kwh(sc.eB) : '—'}</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: i > 0 ? T.success : T.c800 }}>{fmt.yr(sc.LA)}</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px' }}>{sc.nA}×</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: i > 0 ? T.success : T.c800 }}>{fmt.aud(sc.tcA)}</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px', color: T.amberD }}>{sc.tcB != null ? fmt.aud(sc.tcB) : '—'}</td>
                <td style={{ fontFamily: T.font, fontSize: 11, textAlign: 'right', padding: '5px 4px' }}>{sc.loan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
