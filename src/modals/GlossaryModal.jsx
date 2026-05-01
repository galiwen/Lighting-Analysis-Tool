import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';
import { GLOSSARY } from '../inputs/defaults.js';

export const GlossaryModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="Glossary" width={620}>
    <div>
      {GLOSSARY.map(([term, def]) => (
        <div key={term} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, padding: '10px 0', borderBottom: `1px solid ${T.SUBTLE}` }}>
          <span style={{ fontFamily: T.MONO, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: T.INK }}>{term}</span>
          <span style={{ fontFamily: T.SANS, fontSize: 12, lineHeight: 1.55, color: T.INK }}>{def}</span>
        </div>
      ))}
    </div>
  </Modal>
);
