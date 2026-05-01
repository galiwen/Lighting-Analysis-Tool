import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

export const ReplacementSchedule = ({ rA, rB, labelA, labelB, colorA, colorB }) => {
  if (!rA || !rB) return null;
  if (rA.replaceSchedule.length === 0 && rB.replaceSchedule.length === 0) return null;

  const cols = [
    { label: labelA, color: colorA, schedule: rA.replaceSchedule },
    { label: labelB, color: colorB, schedule: rB.replaceSchedule },
  ];

  return (
    <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.RULE}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600 }}>08 · Replacement schedule</span>
        <span style={micro}>[ EVENTS · PRESENT VALUE ]</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {cols.map(p => (
          <div key={p.label}>
            <div style={{ ...micro, color: p.color, paddingBottom: 6, borderBottom: `1px solid ${T.INK}`, marginBottom: 4 }}>
              {p.label}
            </div>
            {p.schedule.length === 0
              ? <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.MUTED, padding: '8px 0' }}>NO REPLACEMENTS WITHIN PROJECT LIFE</div>
              : p.schedule.map(r => (
                <div key={r.n} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', padding: '6px 0', borderBottom: `1px solid ${T.SUBTLE}`, alignItems: 'baseline', gap: 8 }}>
                  <span style={{ ...micro, fontSize: 9 }}>{String(r.n).padStart(2, '0')}</span>
                  <span style={{ fontFamily: T.SANS, fontSize: 11 }}>Replacement · year {r.replacementYear}</span>
                  <span style={{ fontFamily: T.MONO, fontSize: 11, color: p.color }}>{fmt.aud(r.presentValue)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
