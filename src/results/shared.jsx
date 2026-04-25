import { T } from '../design/tokens.js';

export const MetaCell = ({ label: lbl, value, sub, emphasis }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ fontFamily: T.font, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.c300 }}>{lbl}</div>
    <div style={{ fontFamily: T.font, fontSize: emphasis ? 13 : 11, fontWeight: emphasis ? 500 : 400, color: T.c800 }}>{value}</div>
    {sub && <div style={{ fontFamily: T.font, fontSize: 8, color: T.c300 }}>{sub}</div>}
  </div>
);

export const SectionHead = ({ children }) => (
  <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.c400, marginBottom: 8, marginTop: 4 }}>
    {children}
  </div>
);

export const EmptyState = () => (
  <div style={{ padding: 32, textAlign: 'center' }}>
    <span style={{ fontFamily: T.font, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c200 }}>
      Enter inputs and calculate to see results
    </span>
  </div>
);
