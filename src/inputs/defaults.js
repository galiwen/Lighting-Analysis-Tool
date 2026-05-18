export const PROJECT_DEFAULTS = { OH: 4990, PL: 15, ER: 0.26, GF_0: 0.39, GD: 0.30, GDT: 15, i: 0.03, d: 0.05 };
export const PRODUCT_A_DEFAULTS = { W: 28, FL: 3200, Q: 500, LMF: 0.90, LH: 60000, GWP_CG: 18, GWP_EOL: 2.0, C_SI: 320, CRI: 80, UGR: 22 };
export const PRODUCT_B_DEFAULTS = { W: 28, FL: 3200, Q: 500, LMF: 0.70, LH: 80000, GWP_CG: 18, GWP_EOL: 2.0, C_SI: 320, CRI: 80, UGR: 22 };
export const CTRL_DEFAULTS = { CSC: 0.75, CACC: 1.15, r: 0.08, LT: 10 };

export const GLOSSARY = [
  ['LMF',          'Lumen Maintenance Factor — fraction of initial output retained at end of rated life. L90 = 0.90, L70 = 0.70.'],
  ['L90 / L70',    'Two conventions for reporting luminaire life. L70 reports a longer life because it lets output drop further before "end of life".'],
  ['Q_adj',        'Adjusted quantity = Q ÷ LMF. Compensates for reduced output at end of life by specifying more capacity up front.'],
  ['EFF',          'Efficacy = Lumens ÷ Wattage (lm/W). Higher is better.'],
  ['TCO',          'Total Cost of Ownership — initial capital + present value of energy + present value of replacements over the project life.'],
  ['NPV',          'Net Present Value — future cash flow differences, discounted to today using the project discount rate. Positive NPV means Product A is preferable.'],
  ['GWP',          'Global Warming Potential — total kgCO₂e over the project lifecycle. Embodied + operational.'],
  ['CSC',          'Control Savings Coefficient — fraction of base energy retained when controls are active. 0.75 = 25 % saving.'],
  ['CACC',         'Control Additional Cost Coefficient — multiplier on supply + install cost when controls are added.'],
  ['Decarb factor', 'Percentage by which grid carbon is expected to fall over the decarbonisation timeframe (linear).'],
  ['LMF dimming',   'Constant Lumen Output controls extend effective lifetime by dimming new luminaires down to match aged output.'],
  ['CRI',          'Colour Rendering Index — 0–100 score for how accurately a light source reveals colour. CRI ≥ 80 is typical interior; ≥ 90 for art, retail, and colour-critical tasks.'],
  ['UGR',          'Unified Glare Rating — psychometric glare index against a representative room. UGR ≤ 19 for offices and reading; ≤ 22 for circulation and retail.'],
];

export const PROJECT_PRESETS = [
  { id: 'retail',      label: 'Retail',          sub: 'Stores, malls — long open hours',          OH: 4380, PL: 15, ER: 0.30 },
  { id: 'commercial',  label: 'Commercial',      sub: 'Offices — weekday daytime',                 OH: 2500, PL: 20, ER: 0.26 },
  { id: 'residential', label: 'Residential',     sub: 'Homes — evening use',                       OH: 1460, PL: 20, ER: 0.32 },
  { id: 'civic',       label: 'Civic Interior',  sub: 'Civic centres, libraries, healthcare',      OH: 3500, PL: 25, ER: 0.26 },
  { id: 'exterior',    label: 'Public Exterior', sub: 'Streetlights, parks — dusk to dawn',        OH: 4380, PL: 20, ER: 0.26 },
];

export const BENCHMARKS = [
  { id: 'downlight', label: 'Downlight',  sub: 'Recessed ceiling, residential/commercial', W: 18, FL: 1600, LMF: 0.70, LH: 80000, GWP_CG: 15,  GWP_EOL: 1.5, C_SI: 180, CRI: 80, UGR: 22 },
  { id: 'linear',    label: 'Linear',     sub: 'Suspended/surface linear luminaire',        W: 35, FL: 3500, LMF: 0.70, LH: 80000, GWP_CG: 22,  GWP_EOL: 2.2, C_SI: 220, CRI: 80, UGR: 25 },
  { id: 'cylinder',  label: 'Cylinder',   sub: 'Pendant or surface-mount cylinder',         W: 25, FL: 2200, LMF: 0.70, LH: 80000, GWP_CG: 18,  GWP_EOL: 1.8, C_SI: 200, CRI: 80, UGR: 19 },
  { id: 'troffer',   label: 'Troffer',    sub: 'Recessed grid ceiling panel',               W: 40, FL: 3600, LMF: 0.70, LH: 80000, GWP_CG: 25,  GWP_EOL: 2.5, C_SI: 250, CRI: 70, UGR: 22 },
  { id: 'posttop',   label: 'Post Top',   sub: 'Exterior street / amenity luminaire',       W: 80, FL: 8000, LMF: 0.70, LH: 80000, GWP_CG: 45,  GWP_EOL: 5.0, C_SI: 800, CRI: 70, UGR: 24 },
];

export const PRODUCT_A_PRESETS = [
  { id: 'hi-downlight', label: 'Downlight', sub: 'High-spec residential/commercial downlight', W: 12, FL: 1600, LMF: 0.90, LH: 60000, GWP_CG: 12, GWP_EOL: 1.2, C_SI: 220, CRI: 90, UGR: 18 },
  { id: 'hi-linear',    label: 'Linear',    sub: 'Premium suspended/surface linear',           W: 24, FL: 3500, LMF: 0.90, LH: 60000, GWP_CG: 16, GWP_EOL: 1.5, C_SI: 280, CRI: 85, UGR: 19 },
  { id: 'hi-cylinder',  label: 'Cylinder',  sub: 'Pendant or surface-mount cylinder',          W: 18, FL: 2200, LMF: 0.90, LH: 60000, GWP_CG: 14, GWP_EOL: 1.4, C_SI: 320, CRI: 90, UGR: 16 },
  { id: 'tunable',      label: 'Troffer',   sub: 'Tunable-white grid panel',                   W: 28, FL: 3600, LMF: 0.90, LH: 60000, GWP_CG: 18, GWP_EOL: 1.8, C_SI: 320, CRI: 85, UGR: 19 },
  { id: 'solar-post',   label: 'Post Top',  sub: 'Premium exterior amenity luminaire',         W: 60, FL: 8000, LMF: 0.90, LH: 60000, GWP_CG: 35, GWP_EOL: 4.0, C_SI: 950, CRI: 80, UGR: 22 },
];

export const CTRL_PRESETS = [
  { id: 'none',      label: 'No Controls', sub: 'No control system — base case only',          CSC: 1.00, CACC: 1.00, r: 0.08, LT: 10 },
  { id: 'occupancy', label: 'Occupancy',   sub: 'Occupancy sensors only',                      CSC: 0.85, CACC: 1.10, r: 0.08, LT: 10 },
  { id: 'daylight',  label: 'Daylight',    sub: 'Daylight harvesting',                         CSC: 0.75, CACC: 1.15, r: 0.08, LT: 10 },
  { id: 'combined',  label: 'Combined',    sub: 'Occupancy + daylight',                        CSC: 0.65, CACC: 1.25, r: 0.08, LT: 10 },
  { id: 'fullsmart', label: 'Full Smart',  sub: 'Networked DALI / scheduling / scene control', CSC: 0.50, CACC: 1.40, r: 0.08, LT: 12 },
  { id: 'task',      label: 'Task Tuning', sub: 'Constant-lumen + task tuning',                CSC: 0.80, CACC: 1.10, r: 0.08, LT: 10 },
];
