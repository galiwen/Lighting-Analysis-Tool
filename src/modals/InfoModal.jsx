import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';

const ROWS = [
  ['Energy',             'Annual energy = wattage × Q_adj × hours ÷ 1000 (kWh). Q_adj = Q ÷ LMF — the equivalent system capacity that meets the design illuminance after lumen depreciation.'],
  ['Effective lifetime', 'Rated life in years = LH ÷ OH. With controls and dimming, effective life extends because operating hours fall and drive level sits below 100% on average.'],
  ['Replacements',       'Replacement count = ceil(PL ÷ L_yr) − 1, capped at 10. Each replacement re-incurs the supply + install cost, inflated to its year of occurrence at rate i then discounted to present value at rate d.'],
  ['Cost (TCO)',         'Initial capital + present value of yearly energy + present value of replacements (+ present value of the control-system loan annuity, when controls are on). Yearly energy is grown to nominal at inflation i, then divided by (1 + d)^y to present value. Inflation and discount are applied separately — there is no real-rate collapse.'],
  ['Carbon (GWP)',       'Embodied = (1 + replacements) × Q_adj × (GWP_CG + GWP_EOL) — each install cycle carries both manufacturing and end-of-life. Operational = sum over project years of annual_energy × yearly grid factor, where the grid factor decays linearly from GF_0 to GF_0 × (1 − GD) over GDT years.'],
  ['Controls',           'Apply CSC to operational energy, CACC to per-fixture supply + install. ACC is loan-financed over LT years at rate r; the annual payment ALP is then PV-discounted at the project discount rate d, so all TCO terms are apples-to-apples. Effective lifetime extends because controls reduce burn hours and average drive level.'],
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
