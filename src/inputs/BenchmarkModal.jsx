import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';
import { BENCHMARKS } from './defaults.js';

export const BenchmarkModal = ({ open, onClose, onSelect, currentQ }) => (
  <Modal open={open} onClose={onClose} title="Select Benchmark Luminaire" width={540}>
    <p style={{ fontFamily: T.font, fontSize: 11, color: T.c400, fontWeight: 300, marginBottom: 20, lineHeight: 1.6 }}>
      Choose a typical luminaire type to pre-populate Product B with representative benchmark values.
      All fields remain editable after selection.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {BENCHMARKS.map(b => (
        <button
          key={b.id}
          onClick={() => { onSelect({ ...b, Q: currentQ }); onClose(); }}
          style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 16,
            padding: '12px 16px', background: T.white,
            border: `1px solid ${T.c100}`, cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.amber}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.c100}
        >
          <div>
            <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c800, marginBottom: 3 }}>{b.label}</div>
            <div style={{ fontFamily: T.font, fontSize: 11, color: T.c400, fontWeight: 300, marginBottom: 6 }}>{b.sub}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[['Wattage', `${b.W} W`], ['Lumens', `${b.FL.toLocaleString()} lm`], ['Efficacy', `${(b.FL / b.W).toFixed(0)} lm/W`], ['LMF', b.LMF], ['Life', `${(b.LH / 1000).toFixed(0)}k hrs`], ['Supply+Install', `$${b.C_SI}`]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c300 }}>{k}</div>
                  <div style={{ fontFamily: T.font, fontSize: 11, color: T.c800 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ alignSelf: 'center', fontFamily: T.font, fontSize: 18, color: T.c200 }}>›</div>
        </button>
      ))}
    </div>
  </Modal>
);
