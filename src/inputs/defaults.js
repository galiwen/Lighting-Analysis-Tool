import { BENCHMARK_DEFAULTS } from '../calc/engine.js';

export const PROJECT_DEFAULTS = { OH: 4990, PL: 15, ER: 0.26, GF_0: 0.39, GD: 0.30, GDT: 15, i: 0.03, d: 0.05 };
export const PRODUCT_A_DEFAULTS = { W: 28, FL: 3200, Q: 500, LMF: 0.90, LH: 50000, GWP_CG: 18, GWP_EOL: 2.0, C_SI: 320 };
export const PRODUCT_B_DEFAULTS = { ...BENCHMARK_DEFAULTS, Q: 500 };
export const CTRL_DEFAULTS = { CSC: 0.75, CACC: 1.15, r: 0.08, LT: 10 };

export const BENCHMARKS = [
  { id: 'downlight', label: 'Downlight',  sub: 'Recessed ceiling, residential/commercial', W: 18, FL: 1600, LMF: 0.80, LH: 50000, GWP_CG: 15,  GWP_EOL: 1.5, C_SI: 180 },
  { id: 'linear',    label: 'Linear',     sub: 'Suspended/surface linear luminaire',        W: 35, FL: 3500, LMF: 0.75, LH: 50000, GWP_CG: 22,  GWP_EOL: 2.2, C_SI: 220 },
  { id: 'cylinder',  label: 'Cylinder',   sub: 'Pendant or surface-mount cylinder',         W: 25, FL: 2200, LMF: 0.80, LH: 50000, GWP_CG: 18,  GWP_EOL: 1.8, C_SI: 200 },
  { id: 'troffer',   label: 'Troffer',    sub: 'Recessed grid ceiling panel',               W: 40, FL: 3600, LMF: 0.70, LH: 50000, GWP_CG: 25,  GWP_EOL: 2.5, C_SI: 250 },
  { id: 'posttop',   label: 'Post Top',   sub: 'Exterior street / amenity luminaire',       W: 80, FL: 8000, LMF: 0.70, LH: 50000, GWP_CG: 45,  GWP_EOL: 5.0, C_SI: 800 },
];
