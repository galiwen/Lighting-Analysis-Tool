import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';

export const VerdictRibbon = ({ rA, rB, npv, PL, labelA = 'A', labelB = 'B' }) => {
  if (!rA || !rB) return null;
  const aWins = npv >= 0;
  const winner = aWins ? labelA : labelB;
  const winColor = aWins ? T.BLUE : T.VERM;
  const carbonAWins = rA.gwpBase.total < rB.gwpBase.total;
  const costAWins   = rA.TC_base < rB.TC_base;
  const summary =
    (carbonAWins === aWins && costAWins === aWins)
      ? `lower carbon, lower total cost over ${PL}-year project life`
      : carbonAWins === aWins
        ? `lower total cost — carbon outcome ${carbonAWins ? labelA : labelB} preferable`
        : `lower carbon — total cost outcome ${costAWins ? labelA : labelB} preferable`;
  const sign = npv >= 0 ? '+' : '−';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24,
      padding: '10px 28px',
      borderBottom: `1px solid ${T.RULE}`, background: T.BG_PANEL,
      alignItems: 'center',
    }}>
      <span style={{ ...micro, color: T.INK }}>[ VERDICT ]</span>
      <span style={{ fontFamily: T.SANS, fontSize: 13, color: T.INK }}>
        Product <strong style={{ color: winColor }}>{winner}</strong> is preferable — {summary}.
      </span>
      <span style={{ fontFamily: T.MONO, fontSize: 11, color: winColor }}>
        NPV {sign}{fmt.aud(Math.abs(npv)).slice(1)}
      </span>
    </div>
  );
};
