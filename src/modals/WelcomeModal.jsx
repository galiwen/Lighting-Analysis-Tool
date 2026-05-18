import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';

const STEPS = [
  ['01 · Project',  'Click the Project tile on the left to set operating hours, project life, electricity rate, and grid carbon. Five presets (Retail / Commercial / Residential / Civic Interior / Public Exterior) seed sensible archetypes — fine-tune any field inside the modal.'],
  ['02 · Controls', 'Click the Controls tile to pick a strategy or "No Controls". Presets cover Occupancy, Daylight, Combined, Full Smart, and Task Tuning. The control system is loan-financed; results compare base case to controlled scenarios.'],
  ['03 · Product A',     'Click Product A to configure the proposed luminaire — wattage, lumens, quantity, LMF, lifetime, embodied carbon, supply+install, plus CRI and UGR for quality comparison. Start from a preset (Downlight / Linear / Cylinder / Troffer / Post Top) and tweak.'],
  ['04 · Product B',     'Click Product B to configure the benchmark. Defaults match Product A apart from LMF (0.70 vs 0.90) and rated life (80,000 hr vs 60,000 hr) — i.e. an L70-grade vs an L90-grade option out of the box.'],
  ['Quick comparison',  'The right-hand scorecard shows the headline winner across TCO, GWP, annual energy, capital, plus CRI (highest wins) and UGR (lowest wins). It complements — does not replace — the detailed results below.'],
  ['05–08 · Results',  'Verdict ribbon, KPIs, carbon breakdown, NPV-discounted cumulative cost chart, line items, and replacement schedule. Embodied carbon is the darker swatch; operational is the brighter one.'],
  ['09 · Controls scenarios', 'When controls are enabled, this section compares Base / +Controls / +Controls + Dim across energy, lifetime, replacements, TCO, GWP, and the loan payment schedule. Hidden when "No Controls" is selected.'],
];

export const WelcomeModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Welcome — How to use this tool" width={720}>
    <div style={{ fontFamily: T.SANS, fontSize: 13, lineHeight: 1.65, color: T.INK }}>
      <p style={{ margin: '0 0 12px' }}>
        Compare two lighting products head-to-head over a defined project life — <strong>capital</strong>, <strong>energy</strong>, <strong>carbon</strong>, <strong>replacements</strong>, and now <strong>photometric quality</strong>, with optional control-system financing.
      </p>
      {STEPS.map(([t, d]) => (
        <div key={t} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
          <span style={{ fontFamily: T.MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.MUTED }}>{t}</span>
          <span>{d}</span>
        </div>
      ))}
      <p style={{ margin: '14px 0 0', fontFamily: T.MONO, fontSize: 10, color: T.MUTED, lineHeight: 1.6 }}>
        Each tile opens a modal — pick a preset or edit values. <strong>✕ CLOSE</strong> or <strong>Esc</strong> to confirm. Open <strong>Glossary</strong> for term definitions and <strong>Methodology</strong> for the calculation maths.
      </p>
    </div>
  </Modal>
);
