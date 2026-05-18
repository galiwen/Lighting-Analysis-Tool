export const pctDelta = (a, b) => {
  if (!b) return '—';
  const p = ((a - b) / b) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
};

export const decideWinner = (a, b, direction = 'lower') => {
  if (a === b) return 'tie';
  if (direction === 'lower') return a < b ? 'A' : 'B';
  return a > b ? 'A' : 'B';
};
