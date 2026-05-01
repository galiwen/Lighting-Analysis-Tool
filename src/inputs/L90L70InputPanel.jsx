import { T, micro } from '../design/tokens.js';
import { NF } from './NumberField.jsx';

export const L90L70InputPanel = ({
  proj, setProj,
  lum, setLum,
  l90, setL90,
  l70, setL70,
}) => {
  const sp  = k => v => setProj(p => ({ ...p, [k]: v }));
  const sl  = k => v => setLum(p  => ({ ...p, [k]: v }));
  const s90 = k => v => setL90(p  => ({ ...p, [k]: v }));
  const s70 = k => v => setL70(p  => ({ ...p, [k]: v }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
      <div style={{ padding: '16px 22px', borderRight: `1px solid ${T.SUBTLE}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      paddingBottom: 8, borderBottom: `1px solid ${T.INK}`, marginBottom: 4 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600 }}>01 · Project</span>
          <span style={micro}>SHARED</span>
        </div>
        <NF label="Operating hours" unit="hr/yr" value={proj.OH} onChange={sp('OH')} tipKey="OH" />
        <NF label="Project life"    unit="yr"    value={proj.PL} onChange={sp('PL')} tipKey="PL" />
        <NF label="Electricity"     unit="$/kWh" value={proj.ER} onChange={sp('ER')} step={0.01} tipKey="ER" />
        <NF label="Grid carbon"     unit="kg/kWh" value={proj.GF_0} onChange={sp('GF_0')} step={0.01} tipKey="GF_0" />
        <NF label="Decarb %"        unit="%" value={Math.round(proj.GD * 100)} onChange={v => sp('GD')(v / 100)} step={1} tipKey="GD" />
        <NF label="Decarb over"     unit="yr" value={proj.GDT} onChange={sp('GDT')} tipKey="GDT" />
        <NF label="Inflation"       unit="%" value={Math.round(proj.i * 1000) / 10} onChange={v => sp('i')(v / 100)} step={0.1} tipKey="i" />
        <NF label="Discount"        unit="%" value={Math.round(proj.d * 1000) / 10} onChange={v => sp('d')(v / 100)} step={0.1} tipKey="d" />
      </div>

      <div style={{ padding: '16px 22px', borderRight: `1px solid ${T.SUBTLE}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      paddingBottom: 8, borderBottom: `1px solid ${T.INK}`, marginBottom: 4 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600 }}>02 · Luminaire</span>
          <span style={micro}>SINGLE FIXTURE</span>
        </div>
        <NF label="Wattage"      unit="W"     value={lum.W}       onChange={sl('W')}       tipKey="W" />
        <NF label="Lumens"       unit="lm"    value={lum.FL}      onChange={sl('FL')}      tipKey="FL" />
        <NF label="Quantity"                  value={lum.Q}       onChange={sl('Q')}       step={1} min={1} tipKey="Q" />
        <NF label="Supply + Inst" unit="$/ea" value={lum.C_SI}    onChange={sl('C_SI')}    step={10} tipKey="C_SI" />
        <NF label="Embodied C"   unit="kg/ea" value={lum.GWP_CG}  onChange={sl('GWP_CG')}  step={0.5} tipKey="GWP_CG" />
        <NF label="End of life"  unit="kg/ea" value={lum.GWP_EOL} onChange={sl('GWP_EOL')} step={0.1} tipKey="GWP_EOL" />
      </div>

      <div style={{ padding: '16px 22px', borderRight: `1px solid ${T.SUBTLE}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      paddingBottom: 8, borderBottom: `2px solid ${T.BLUE}`, marginBottom: 4 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600, color: T.BLUE }}>L90</span>
          <span style={{ ...micro, color: T.BLUE }}>HIGH MAINT.</span>
        </div>
        <NF label="LMF"            value={l90.LMF} onChange={s90('LMF')} step={0.01} tipKey="LMF" hint="Typically 0.90" accent={T.BLUE} />
        <NF label="Rated lifetime" unit="hr" value={l90.LH} onChange={s90('LH')} tipKey="LH" accent={T.BLUE} />
      </div>

      <div style={{ padding: '16px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      paddingBottom: 8, borderBottom: `2px solid ${T.VERM}`, marginBottom: 4 }}>
          <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600, color: T.VERM }}>L70</span>
          <span style={{ ...micro, color: T.VERM }}>LOW MAINT.</span>
        </div>
        <NF label="LMF"            value={l70.LMF} onChange={s70('LMF')} step={0.01} tipKey="LMF" hint="Typically 0.70" accent={T.VERM} />
        <NF label="Rated lifetime" unit="hr" value={l70.LH} onChange={s70('LH')} tipKey="LH" accent={T.VERM} />
      </div>
    </div>
  );
};
