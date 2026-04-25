import { Field } from '../components/atoms.jsx';
import { TIPS } from './tips.js';

export const NF = ({ label: lbl, value, unit, onChange, warn, error: err, hint, link, linkAction, min, max, step = 'any', tipKey }) => (
  <Field
    label={lbl} value={value} unit={unit}
    onChange={v => { const n = parseFloat(v); onChange(!isNaN(n) ? n : v); }}
    warn={warn} error={err} hint={hint}
    link={link} linkAction={linkAction}
    type="number" step={step} min={min} max={max}
    tip={tipKey ? TIPS[tipKey] : undefined}
  />
);
