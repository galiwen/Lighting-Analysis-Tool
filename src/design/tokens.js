export const T = {
  INK:      '#0A0A0A',
  BG:       '#FAFAF7',
  BG_PANEL: '#F4F1E8',
  RULE:     '#1A1A1A',
  MUTED:    '#7A7872',
  SUBTLE:   '#E2DFD6',

  BLUE:     '#3A5C8A',
  BLUE_D:   '#0A1B33',
  VERM:     '#D43A1A',
  VERM_D:   '#5C1408',

  ERROR:    '#B22222',
  SUCCESS:  '#1F6B3F',
  WARN_BG:  '#FFF6E0',
  WARN_BD:  '#C9802A',

  SANS:     "'Space Grotesk', system-ui, -apple-system, sans-serif",
  MONO:     "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};

export const micro = {
  fontFamily: T.MONO, fontSize: 9, fontWeight: 400,
  color: T.MUTED, textTransform: 'uppercase', letterSpacing: '0.06em',
};

export const microSm = { ...micro, fontSize: 8 };
