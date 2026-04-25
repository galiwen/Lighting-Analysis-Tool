export const fmt = {
  num:  (v, dp = 0) => v == null ? '—' : Number(v).toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  aud:  (v, dp = 0) => v == null ? '—' : `$${Number(v).toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`,
  pct:  (v, dp = 1) => v == null ? '—' : `${Number(v).toFixed(dp)}%`,
  co2:  (v) => v == null ? '—' : `${Number(v).toLocaleString('en-AU', { maximumFractionDigits: 0 })} kgCO₂e`,
  kwh:  (v) => v == null ? '—' : `${Number(v).toLocaleString('en-AU', { maximumFractionDigits: 0 })} kWh`,
  lmw:  (v) => v == null ? '—' : `${Number(v).toFixed(1)} lm/W`,
  yr:   (v) => v == null ? '—' : `${Number(v).toFixed(1)} yrs`,
};
