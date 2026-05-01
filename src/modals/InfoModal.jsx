import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';

const ROWS = [
  ['Energy',             'Annual energy = wattage × quantity × hours / 1000 (kWh).'],
  ['Effective lifetime', 'Adjusted for the Lumen Maintenance Factor (LMF). LMF 0.7 means lifetime is reported until output drops to 70% of initial — a longer, more permissive measure than L90 (0.9).'],
  ['Replacements',       'Number of replacements = floor((PL × hr/yr) / lifetime). Replacement costs use Supply + Install per fixture, escalated at the inflation rate.'],
  ['Cost (TCO)',         'Initial capital + present value of energy + present value of replacements. NPV uses (discount − inflation) as the real rate.'],
  ['Carbon (GWP)',       'Embodied (cradle-to-gate × replacements) + End-of-life × replacements + Operational (annual energy × grid factor, decayed linearly by decarb % over decarb years).'],
  ['Controls',           'Apply CSC to operational energy, CACC to capital cost. Loan-finance ACC over LT years at rate r. Effective lifetime extends because dimming + occupancy reduce burn hours.'],
];

export const InfoModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Methodology — How calculations work" width={720}>
    <div style={{ fontFamily: T.SANS, fontSize: 13, lineHeight: 1.65, color: T.INK }}>
      <p style={{ margin: '0 0 12px' }}>
        This tool models lifecycle <strong>cost</strong> and <strong>carbon</strong> for two lighting scenarios over a defined project life.
      </p>
      {ROWS.map(([t, d]) => (
        <div key={t} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '8px 0', borderTop: `1px solid ${T.SUBTLE}` }}>
          <span style={{ fontFamily: T.MONO, fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.MUTED }}>{t}</span>
          <span>{d}</span>
        </div>
      ))}
      <p style={{ margin: '14px 0 0', fontFamily: T.MONO, fontSize: 10, color: T.MUTED, lineHeight: 1.6 }}>
        Defaults reflect typical AU non-residential lighting projects. All figures should be validated against project-specific quotes and EPDs before specification.
      </p>
    </div>
  </Modal>
);
