export const fmt = {
  num:  (v, dp = 0) => v == null ? '—' : Number(v).toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  aud:  (v, dp = 0) => v == null ? '—' : `$${Number(v).toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`,
  audK: (v) => {
    if (v == null) return '—';
    const n = Number(v);
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `$${Math.round(n / 1_000)}k`;
    return `$${Math.round(n)}`;
  },
  pct:  (v, dp = 1) => v == null ? '—' : `${Number(v).toFixed(dp)}%`,
  co2:  (v) => {
    if (v == null) return '—';
    const n = Number(v);
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)} tCO₂e`;
    return `${n.toLocaleString('en-AU', { maximumFractionDigits: 0 })} kgCO₂e`;
  },
  kwh:  (v) => v == null ? '—' : `${Number(v).toLocaleString('en-AU', { maximumFractionDigits: 0 })} kWh`,
  lmw:  (v) => v == null ? '—' : `${Number(v).toFixed(0)} lm/W`,
  yr:   (v) => v == null ? '—' : `${Number(v).toFixed(1)} yr`,
};
