import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';

const STEPS = [
  ['01 · Project',  'Set operating hours, project life, electricity rate, and grid carbon. Five preset chips (Retail / Commercial / Residential / Civic Interior / Public Exterior) seed sensible archetypes — fine-tune any field below.'],
  ['02 · Controls', 'Pick a control strategy or "No Controls". Presets cover Occupancy, Daylight, Combined, Full Smart, and Task Tuning. The control system is loan-financed; results compare base case to controlled scenarios.'],
  ['03 · Product A',     'Configure the first luminaire — wattage, lumens, quantity, LMF, lifetime, embodied carbon (cradle-to-gate + end-of-life), and supply+install. Start from a benchmark preset (Downlight / Linear / Cylinder / Troffer / Post Top) and tweak.'],
  ['04 · Product B',     'Configure the comparison luminaire. Defaults match Product A apart from LMF (0.70 vs 0.90) and rated life (80,000 hr vs 60,000 hr) — i.e. an L70-grade vs an L90-grade option out of the box.'],
  ['05–08 · Results',  'Read the verdict ribbon, KPIs, carbon breakdown, NPV-discounted cumulative cost chart, line items, and replacement schedule. Embodied carbon is the darker swatch; operational is the brighter one.'],
  ['09 · Controls scenarios', 'When controls are enabled, this section compares Base / +Controls / +Controls + Dim across energy, lifetime, replacements, TCO, GWP, and the loan payment schedule. Hidden when "No Controls" is selected.'],
];

export const WelcomeModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Welcome — How to use this tool" width={720}>
    <div style={{ fontFamily: T.SANS, fontSize: 13, lineHeight: 1.65, color: T.INK }}>
      <p style={{ margin: '0 0 12px' }}>
        Compare two lighting products head-to-head over a defined project life — <strong>capital</strong>, <strong>energy</strong>, <strong>carbon</strong>, and <strong>replacements</strong>, with optional control-system financing.
      </p>
      {STEPS.map(([t, d]) => (
        <div key={t} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
          <span style={{ fontFamily: T.MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.MUTED }}>{t}</span>
          <span>{d}</span>
        </div>
      ))}
      <p style={{ margin: '14px 0 0', fontFamily: T.MONO, fontSize: 10, color: T.MUTED, lineHeight: 1.6 }}>
        Tip — click any preset chip to apply an archetype; click × CLEAR to revert to defaults. Open <strong>Glossary</strong> for term definitions and <strong>Methodology</strong> for the calculation maths.
      </p>
    </div>
  </Modal>
);
