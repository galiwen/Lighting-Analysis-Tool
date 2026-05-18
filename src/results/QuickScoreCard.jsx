import { useState } from 'react';
import { T, micro } from '../design/tokens.js';
import { fmt } from '../components/format.js';
import { pctDelta, decideWinner } from './compare.js';
import {
  TCODetail, GWPDetail, EnergyDetail, CapitalDetail, PhotoDetail,
} from './QuickDetailPanels.jsx';

const Row = ({ id, label, winnerLetter, winnerColor, descriptor, isSelected, onClick }) => {
  const [hover, setHover] = useState(false);
  const active = isSelected || hover;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: 'auto 28px 1fr',
        alignItems: 'baseline', columnGap: 10,
        padding: '9px 12px',
        background: active ? T.BG_PANEL : 'transparent',
        border: `1px solid ${T.INK}`,
        outline: isSelected ? `2px solid ${T.INK}` : 'none',
        outlineOffset: '-2px',
        cursor: 'pointer', transition: 'background 120ms ease',
        textAlign: 'left',
        fontFamily: T.SANS, color: T.INK,
      }}
    >
      <span style={{ fontFamily: T.SANS, fontSize: 12, fontWeight: 600, color: T.INK, letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 700, color: winnerColor, textAlign: 'center' }}>
        {winnerLetter}
      </span>
      <span style={{ fontFamily: T.MONO, fontSize: 11, color: winnerColor, textAlign: 'right' }}>
        {descriptor}
      </span>
    </button>
  );
};

const buildRow = (id, label, aV, bV, dir, colorA, colorB, fixedDescriptor = null) => {
  const winner = decideWinner(aV, bV, dir);
  if (winner === 'tie') {
    return { id, label, winnerLetter: '—', winnerColor: T.MUTED, descriptor: '' };
  }
  const winnerLetter = winner === 'A' ? 'A' : 'B';
  const winnerColor = winner === 'A' ? colorA : colorB;
  if (fixedDescriptor) {
    return { id, label, winnerLetter, winnerColor, descriptor: fixedDescriptor };
  }
  const winnerValue = winner === 'A' ? aV : bV;
  const loserValue  = winner === 'A' ? bV : aV;
  return { id, label, winnerLetter, winnerColor, descriptor: pctDelta(winnerValue, loserValue) };
};

export const QuickScoreCard = ({
  rA, rB, prodA, prodB, npv, PL,
  controlsActive = false,
  colorA = T.BLUE, colorB = T.VERM,
}) => {
  const [expanded, setExpanded] = useState(null);
  const toggleRow = (id) => setExpanded(prev => (prev === id ? null : id));

  if (!rA || !rB) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        minHeight: 280, padding: '24px 28px', textAlign: 'center',
      }}>
        <span style={micro}>[ COMPARISON RESULTS ]</span>
        <span style={{ ...micro, color: T.MUTED, marginTop: 10 }}>
          AWAITING VALID INPUTS — RESOLVE ERRORS ABOVE
        </span>
      </div>
    );
  }

  const aWins = npv >= 0;
  const tied = npv === 0;
  const overallLabel = tied ? 'MIXED OUTCOME' : aWins ? 'PRODUCT A WINS' : 'PRODUCT B WINS';
  const overallColor = tied ? T.MUTED : aWins ? colorA : colorB;
  const winnerTC = aWins ? rA.TC_base : rB.TC_base;
  const loserTC  = aWins ? rB.TC_base : rA.TC_base;
  const tcoGap = Math.abs(loserTC - winnerTC);

  const economicRows = [
    buildRow('tco',     'TCO',     rA.TC_base,        rB.TC_base,        'lower', colorA, colorB),
    buildRow('gwp',     'GWP',     rA.gwpBase.total,  rB.gwpBase.total,  'lower', colorA, colorB),
    buildRow('energy',  'ENERGY',  rA.E_base,         rB.E_base,         'lower', colorA, colorB),
    buildRow('capital', 'CAPITAL', rA.C_initial,      rB.C_initial,      'lower', colorA, colorB),
  ];

  const photoRows = [
    buildRow('cri', 'CRI', prodA.CRI, prodB.CRI, 'higher', colorA, colorB, 'HIGHEST'),
    buildRow('ugr', 'UGR', prodA.UGR, prodB.UGR, 'lower',  colorA, colorB, 'LOWEST'),
  ];

  const renderDetail = (id) => {
    switch (id) {
      case 'tco':     return <TCODetail     rA={rA} rB={rB} colorA={colorA} colorB={colorB} PL={PL} />;
      case 'gwp':     return <GWPDetail     rA={rA} rB={rB} colorA={colorA} colorB={colorB} PL={PL} />;
      case 'energy':  return <EnergyDetail  rA={rA} rB={rB} colorA={colorA} colorB={colorB} />;
      case 'capital': return <CapitalDetail rA={rA} rB={rB} colorA={colorA} colorB={colorB} PL={PL} />;
      case 'cri':     return <PhotoDetail aValue={prodA.CRI ?? '—'} bValue={prodB.CRI ?? '—'} colorA={colorA} colorB={colorB}
                                          caption="HIGHER IS BETTER · CRI 80 IS THE GENERAL-PURPOSE THRESHOLD FOR INDOOR LIGHTING" />;
      case 'ugr':     return <PhotoDetail aValue={prodA.UGR ?? '—'} bValue={prodB.UGR ?? '—'} colorA={colorA} colorB={colorB}
                                          caption="LOWER IS BETTER · UGR ≤ 19 IS TYPICAL FOR OFFICE WORK" />;
      default: return null;
    }
  };

  const renderRows = (rows) => rows.map(r => (
    <Row key={r.id} {...r} isSelected={expanded === r.id} onClick={toggleRow} />
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '14px 28px 10px', borderBottom: `1px solid ${T.INK}`,
      }}>
        <span style={{ fontFamily: T.SANS, fontSize: 13, fontWeight: 600 }}>Comparison Results</span>
        <span style={micro}>[ A = PROPOSED · B = BENCHMARK ]</span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(200px, 220px) 1fr',
        flex: 1,
      }}>
        <div style={{
          borderRight: `1px solid ${T.SUBTLE}`,
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {renderRows(economicRows)}
          <div style={{ height: 1, background: T.SUBTLE, margin: '4px 0' }} />
          {renderRows(photoRows)}
        </div>

        <div style={{ padding: '18px 24px' }}>
          {expanded ? renderDetail(expanded) : (
            <div>
              <div style={{
                fontFamily: T.SANS, fontSize: 22, fontWeight: 700,
                color: overallColor, letterSpacing: '-0.01em', lineHeight: 1.1,
              }}>
                {overallLabel}
              </div>
              <div style={{ ...micro, color: T.MUTED, marginTop: 8 }}>
                {tied ? 'NPV NEUTRAL' : `TCO ADVANTAGE ${fmt.aud(tcoGap)} OVER ${PL}-YR LIFE`}
              </div>
              <div style={{ fontFamily: T.MONO, fontSize: 11, color: overallColor, fontWeight: 500, marginTop: 6 }}>
                NPV {npv >= 0 ? '+' : '−'}{fmt.aud(Math.abs(npv)).slice(1)}
              </div>

              <div style={{ marginTop: 28, textAlign: 'center' }}>
                <span style={{ ...micro, color: T.MUTED }}>
                  [ SELECT A METRIC ON THE LEFT FOR DETAIL ]
                </span>
                {controlsActive && (
                  <div style={{ ...micro, marginTop: 6 }}>[ INCL. CONTROLS + DIM ]</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
