// Lighting Analysis Calculation Engine
// Source of truth: Lighting_Analysis_Calculation_Documentation_v2.md
// All intermediate calculations use 4dp; display rounds to 2dp.

// ── 3.2 Grid decarbonisation schedule ──────────────────────────────
export function calculateGridFactor(year, GF_0, GD, GDT) {
  const GF_floor = GF_0 * (1 - GD);
  if (GDT <= 1) return GF_floor;
  if (year <= GDT) {
    const fraction = (year - 1) / (GDT - 1);
    return GF_0 - (GF_0 - GF_floor) * fraction;
  }
  return Math.max(GF_floor, 0);
}

// ── 3.3 Lifetime ───────────────────────────────────────────────────
function calculateLifetimes(LH, OH, CSC, LMF) {
  const L_base = LH / OH;
  const L_control = L_base / CSC;
  const dimming_factor = 1 - (1 - LMF) / 2;
  const L_control_maint = L_control / dimming_factor;
  return { L_base, L_control, L_control_maint, dimming_factor };
}

// ── 3.4 Replacement count ──────────────────────────────────────────
export function calculateReplacements(projectLife, luminaireLife) {
  if (luminaireLife <= 0) return 0;
  if (luminaireLife >= projectLife) return 0;
  return Math.min(Math.ceil(projectLife / luminaireLife) - 1, 10);
}

// ── 3.5 Energy ─────────────────────────────────────────────────────
function calculateEnergy(W, Q_adj, OH, CSC, LMF) {
  const E_base = (W * Q_adj * OH) / 1000;
  const E_control = E_base * CSC;
  const dimming_factor = 1 - (1 - LMF) / 2;
  const E_control_maint = Math.max(0, E_control * dimming_factor);
  return { E_base, E_control, E_control_maint };
}

// ── 3.6 Emissions profile (year-by-year) ───────────────────────────
function calculateEmissionsProfile(annualEnergy, PL, GF_0, GD, GDT) {
  const profile = [];
  let cumulative = 0;
  for (let year = 1; year <= PL; year++) {
    const GF_year = calculateGridFactor(year, GF_0, GD, GDT);
    const annual = GF_year * annualEnergy;
    cumulative += annual;
    profile.push({ year, gridFactor: GF_year, annualEmissions: annual, cumulativeEmissions: cumulative });
  }
  return { profile, totalEmissions: cumulative };
}

// ── 3.7 GWP ────────────────────────────────────────────────────────
function calculateTotalGWP(Q_adj, GWP_CG, GWP_EOL, numReplacements, totalOperationalEmissions) {
  const embodiedGWP = (1 + numReplacements) * Q_adj * (GWP_CG + GWP_EOL);
  const operationalGWP = totalOperationalEmissions;
  const total = embodiedGWP + operationalGWP;
  return {
    embodied: embodiedGWP,
    operational: operationalGWP,
    total,
    embodiedPercent: total > 0 ? (embodiedGWP / total) * 100 : 0,
    operationalPercent: total > 0 ? (operationalGWP / total) * 100 : 0,
  };
}

// ── 3.8 Cost profile ───────────────────────────────────────────────
function calculatePVEnergyCosts(annualEnergy, ER, i, d, PL) {
  const profile = [];
  let pvTotal = 0;
  for (let y = 1; y <= PL; y++) {
    const nominalCost = annualEnergy * ER * Math.pow(1 + i, y - 1);
    const presentValue = nominalCost / Math.pow(1 + d, y);
    pvTotal += presentValue;
    profile.push({ year: y, nominalCost, presentValue, cumulativePV: pvTotal });
  }
  return { profile, totalPV: pvTotal };
}

function calculatePVReplacements(C_initial, luminaireLife, numReplacements, i, d) {
  let pvTotal = 0;
  const schedule = [];
  for (let n = 1; n <= numReplacements; n++) {
    const replacementYear = Math.round(n * luminaireLife);
    const nominalCost = C_initial * Math.pow(1 + i, replacementYear);
    const presentValue = nominalCost / Math.pow(1 + d, replacementYear);
    pvTotal += presentValue;
    schedule.push({ n, replacementYear, nominalCost, presentValue });
  }
  return { pvTotal, schedule };
}

// ── 3.9 Control system financing ───────────────────────────────────
function PMT(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  const pvif = Math.pow(1 + rate, nper);
  return pv * rate * pvif / (pvif - 1);
}

function calculateControlFinancing(C_SI, Q_adj, CACC, r, LT) {
  const ACC_unit = C_SI * (CACC - 1);
  const ACC_total = Q_adj * ACC_unit;
  const ALP = PMT(r, LT, ACC_total);
  const TLP = ALP * LT;
  const TIP = TLP - ACC_total;
  return { ACC_unit, ACC_total, ALP, TLP, TIP };
}

// ── 3.10 NPV comparison ────────────────────────────────────────────
export function calculateComparisonNPV(A, B, d, PL, ER, i) {
  const initialDiff = A.C_initial - B.C_initial;
  let npv = initialDiff;
  for (let y = 1; y <= PL; y++) {
    const energySavings = (A.E_base - B.E_base) * ER * Math.pow(1 + i, y - 1);
    npv += energySavings / Math.pow(1 + d, y);
  }
  npv += A.PV_replace - B.PV_replace;
  return npv;
}

// ── 4.3 Year-by-year cumulative profile for charts ─────────────────
function generateCumulativeProfile(product, PL, GF_0, GD, GDT, ER, i, d) {
  const years = [];
  const cumulativeEmissions = [];
  const cumulativeCost = [];

  let cumEmissions = 0;
  let cumCost = product.C_initial;

  for (let y = 1; y <= PL; y++) {
    const GF_year = calculateGridFactor(y, GF_0, GD, GDT);
    cumEmissions += GF_year * product.E_base;

    const annualEnergyCost = product.E_base * ER * Math.pow(1 + i, y - 1);
    cumCost += annualEnergyCost / Math.pow(1 + d, y);

    product.replaceSchedule.forEach(r => {
      if (r.replacementYear === y) cumCost += r.presentValue;
    });

    years.push(y);
    cumulativeEmissions.push(parseFloat(cumEmissions.toFixed(4)));
    cumulativeCost.push(parseFloat(cumCost.toFixed(4)));
  }
  return { years, cumulativeEmissions, cumulativeCost };
}

// ── 5.1 Validation ─────────────────────────────────────────────────
export function validateInputs(p, label) {
  const errors = [];
  const warnings = [];
  if (p.GF_0 !== undefined) {
    if (p.GF_0 < 0 || p.GF_0 > 1.2) errors.push('Grid Carbon Factor must be 0–1.2 kg/kWh');
    if (p.OH < 1 || p.OH > 8760) errors.push('Operational hours must be 1–8760 hrs/yr');
    if (p.PL < 1 || p.PL > 50) errors.push('Project life must be 1–50 years');
    if (p.ER < 0.05 || p.ER > 1.99) warnings.push('Electricity rate outside typical range ($0.05–$1.99/kWh)');
    if (p.d !== undefined && p.i !== undefined && p.d < p.i) warnings.push('Discount rate is below inflation rate — amplifies future costs in PV terms');
  }
  if (p.W !== undefined) {
    if (p.W <= 0) errors.push(`${label}: Wattage must be > 0`);
    if (p.Q <= 0) errors.push(`${label}: Quantity must be ≥ 1`);
    if (p.LMF <= 0 || p.LMF > 1) errors.push(`${label}: LMF must be between 0 (exclusive) and 1`);
    if (p.LH <= 0) errors.push(`${label}: Rated lifetime must be > 0 hrs`);
    if (p.LMF < 0.6 || p.LMF > 0.95) warnings.push(`${label}: LMF outside typical LED range (0.6–0.95)`);
  }
  return { errors, warnings };
}

export function checkCalculationWarnings(results, PL, GDT) {
  const warnings = [];
  if (results.L_base < 1) warnings.push('Luminaire lifetime is less than 1 year at these operational hours');
  if (results.N_replace >= 3) warnings.push(`Luminaires replaced ${results.N_replace}× — consider technology refresh assumptions`);
  if (GDT > PL) warnings.push('Grid decarbonisation target extends beyond the project life');
  return warnings;
}

// ── Main analysis runner ───────────────────────────────────────────
export function runProductAnalysis(proj, prod, controlsEnabled, ctrl) {
  const { OH, PL, GF_0, GD, GDT, ER, i, d } = proj;
  const { W, FL, Q, LMF, LH, GWP_CG, GWP_EOL, C_SI } = prod;
  const CSC = controlsEnabled && ctrl ? ctrl.CSC : 1;

  const EFF = FL / W;
  const Q_adj = Q / LMF;
  const { L_base, L_control, L_control_maint } = calculateLifetimes(LH, OH, controlsEnabled && ctrl ? ctrl.CSC : 1, LMF);
  const N_replace = calculateReplacements(PL, L_base);
  const N_replace_ctrl = controlsEnabled ? calculateReplacements(PL, L_control) : N_replace;
  const N_replace_ctrl_maint = controlsEnabled ? calculateReplacements(PL, L_control_maint) : N_replace;

  const { E_base, E_control, E_control_maint } = calculateEnergy(W, Q_adj, OH, CSC, LMF);

  const emissBase = calculateEmissionsProfile(E_base, PL, GF_0, GD, GDT);
  const gwpBase = calculateTotalGWP(Q_adj, GWP_CG, GWP_EOL, N_replace, emissBase.totalEmissions);

  const C_initial = C_SI * Q_adj;
  const pvEnergy = calculatePVEnergyCosts(E_base, ER, i, d, PL);
  const pvReplace = calculatePVReplacements(C_initial, L_base, N_replace, i, d);
  const TC_base = C_initial + pvEnergy.totalPV + pvReplace.pvTotal;

  let ctrlResults = null;
  if (controlsEnabled && ctrl) {
    const { ACC_total, ALP, TLP } = calculateControlFinancing(C_SI, Q_adj, ctrl.CACC, ctrl.r, ctrl.LT);
    const pvEnergyCtrl = calculatePVEnergyCosts(E_control, ER, i, d, PL);
    const pvReplaceCtrl = calculatePVReplacements(C_initial, L_control, N_replace_ctrl, i, d);
    const TC_control = C_initial + TLP + pvEnergyCtrl.totalPV + pvReplaceCtrl.pvTotal;

    const pvEnergyCtrlMaint = calculatePVEnergyCosts(E_control_maint, ER, i, d, PL);
    const pvReplaceCtrlMaint = calculatePVReplacements(C_initial, L_control_maint, N_replace_ctrl_maint, i, d);
    const TC_control_maint = C_initial + TLP + pvEnergyCtrlMaint.totalPV + pvReplaceCtrlMaint.pvTotal;

    const annual_savings = (E_base - E_control) * ER;
    const simple_payback = annual_savings > 0 ? ACC_total / annual_savings : Infinity;

    ctrlResults = {
      ACC_total, ALP, TLP,
      E_control, E_control_maint,
      L_control, L_control_maint,
      N_replace_ctrl, N_replace_ctrl_maint,
      TC_control, TC_control_maint,
      annual_savings, simple_payback,
    };
  }

  const profile = generateCumulativeProfile(
    { C_initial, E_base, replaceSchedule: pvReplace.schedule },
    PL, GF_0, GD, GDT, ER, i, d
  );

  return {
    EFF, Q_adj, L_base, N_replace,
    E_base, C_initial,
    pvEnergyTotal: pvEnergy.totalPV,
    PV_replace: pvReplace.pvTotal,
    replaceSchedule: pvReplace.schedule,
    TC_base,
    gwpBase,
    emissionsProfile: emissBase.profile,
    profile,
    ctrlResults,
  };
}

// ── Benchmark defaults ─────────────────────────────────────────────
export const BENCHMARK_DEFAULTS = {
  W: 40, FL: 3600, LMF: 0.70, LH: 50000,
  GWP_CG: 25, GWP_EOL: 2.5, C_SI: 250,
};
