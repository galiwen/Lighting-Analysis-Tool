# Lighting Analysis Calculation Documentation v2

## Changelog from v1

| # | Category | Change | Rationale |
|---|----------|--------|-----------|
| 1 | Bug fix | Grid decarbonisation interpolation corrected | Off-by-one: year GDT never reached target |
| 2 | Bug fix | Replacement count formula corrected | `Math.floor(PL/L)` double-counts at boundary |
| 3 | Bug fix | Total cost for control scenarios now includes loan principal | v1 only added interest (TIP), omitting ACC_total |
| 4 | Structural | Separated discount rate from loan interest rate | Conflating the two distorts PV comparisons |
| 5 | Addition | Luminaire efficacy as a derived metric | First comparison metric professionals look at |
| 6 | Addition | Explicit methodology assumptions section | Maintenance dimming linearity, replacement cost inflation |
| 7 | Addition | NPV fully specified with defined cash flow structure | v1 left cash flows undefined |
| 8 | Addition | Year-by-year profile output structure | Supports cumulative charts for cost and emissions |
| 9 | Structural | Control system analysis made optional | Comparison tool may only need Product A vs B |
| 10 | Addition | Product A vs Product B comparison framework | Replaces fixed L90/L70 comparison structure |
| 11 | Structural | Q_adj relabelled as Equivalent System Capacity | Clarifies that Q_adj represents total system capacity, not necessarily physical luminaire count |
| 12 | Addition | GWP calculated for control scenarios | Controls reduce both operational emissions and embodied carbon via fewer replacements |
| 13 | Bug fix | Section 4.3 replacement detection aligned with engine | Circular rounding logic could misfire with fractional lifetimes; engine's schedule-based approach is authoritative |
| 14 | Bug fix | Section 3.4 verification table row PL=15 / L=7 corrected to 2 replacements | Old row contradicted the formula directly above it; with L=7 the second replacement at year 14 is required to reach PL=15 |
| 15 | Structural | Control-loan term in TCO switched from nominal `TLP` to PV-discounted annuity `PV_loan` | Mixing nominal future payments with PV figures overstated controlled-scenario TCO; new formulation makes all cost terms apples-to-apples at the project discount rate `d`. `TLP` and `TIP` remain available for display |
| 16 | Structural | NPV sign convention flipped — positive NPV now means Product A is preferable | Matches the PROPOSED-vs-BENCHMARK framing used by the verdict component and avoids a latent off-by-sign bug in downstream consumers |
| 17 | Structural | NPV now includes the loan-PV differential when controls are enabled on both products | Without this term, NPV under-counted A's advantage when A's Q_adj × C_SI was lower than B's (i.e., when A's control financing was cheaper) |
| 18 | Bug fix | Section 6 implementation note 8 aligned with Section 1.1 table | Note previously recommended defaulting discount rate to `i`; table says `0.05`. Engine + `PROJECT_DEFAULTS` follow the table |

---

## 1. Variable Organisation

### 1.1 Input Variables

#### Market Data Variables

| Variable | Description | Unit | Typical Range | Default |
|----------|-------------|------|---------------|---------|
| **GF_0** | Initial CO2e Grid Factor | kg/kWh | 0.00-1.0 | 0.39 |
| **ER** | Current Electricity Rate | $/kWh | 0.05-1.99 | 0.26 |
| **i** | Average inflation rate | fraction | 0.01-0.10 | 0.03 |
| **d** | Discount rate (cost of capital) | fraction | 0.03-0.15 | 0.05 |
| **GD** | Electricity Grid Decarbonisation | fraction | 0.0-1.0 | 0.3 |
| **GDT** | Grid Decarbonisation Timeframe | years | 5-30 | 15 |

#### Control System Variables (Optional)

| Variable | Description | Unit | Typical Range | Default |
|----------|-------------|------|---------------|---------|
| **CSC** | Control System Coefficient | fraction | 0.5-0.9 | 0.75 |
| **CACC** | Control Additional Cost Coefficient | multiplier | 1.0-2.0 | 1.15 |
| **r** | Loan interest rate | fraction | 0.03-0.15 | 0.08 |
| **LT** | Loan term | years | 3-15 | 10 |

> **Note on discount rate vs loan rate:** The discount rate (d) reflects the project's opportunity cost of capital and is used in all present value calculations. The loan interest rate (r) applies only to the financing of control system upgrades. These serve different purposes and will typically have different values. If the user has no basis for setting a discount rate, defaulting to the loan rate is acceptable but should be flagged.

#### Project Requirements

| Variable | Description | Unit | Typical Range | Default |
|----------|-------------|------|---------------|---------|
| **OH** | Operational Hours/Year | hours | 1460-8760 | 4990 |
| **PL** | Anticipated Project Life | years | 5-30 | 15 |

#### Luminaire Specifications (per product)

| Variable | Description | Unit | Typical Range |
|----------|-------------|------|---------------|
| **W** | Wattage per luminaire | W | 5-1000 |
| **FL** | Flux Lumens | lm | 500-100000 |
| **Q** | Base Quantity | units | 1-10000 |
| **LMF** | Luminaire Maintenance Factor | fraction | 0.6-0.95 |
| **LH** | Rated Lifetime (hours) | hours | 25000-100000 |
| **GWP_CG** | GWP, Cradle to Gate | kgCO2e | 5-500 |
| **GWP_EOL** | GWP, End of Life | kgCO2e | 0.1-50 |
| **C_SI** | Supply + Install Cost | $ | 50-5000 |

### 1.2 Derived Variables

| Variable | Description | Formula |
|----------|-------------|---------|
| **EFF** | Luminaire Efficacy (lm/W) | FL / W |
| **Q_adj** | Equivalent System Capacity (luminaire-equivalents) | Q / LMF |
| **L_base** | Base Lifetime (years) | LH / OH |
| **E_base** | Annual Energy (kWh) | (W * Q_adj * OH) / 1000 |

### 1.3 Benchmark Defaults

When the user is comparing a single product against the benchmark rather than entering a second product, the following defaults are used for the benchmark luminaire. These should be clearly labelled in the UI as "Typical LED benchmark" and be user-editable.

| Variable | Benchmark Default | Basis |
|----------|-------------------|-------|
| W | 40 | Typical commercial LED panel |
| FL | 3600 | ~90 lm/W efficacy |
| Q | Same as Product A | Matched quantity |
| LMF | 0.7 | L70 standard |
| LH | 50000 | Conservative LED rating |
| GWP_CG | 25 | Mid-range embodied carbon |
| GWP_EOL | 2.5 | Mid-range end of life |
| C_SI | 250 | Typical supply + install |

---

## 2. Key Concepts

### 2.1 L90 vs L70 Standards

**L90 Standard:** Rated life at which luminaire output drops to 90% of initial. More conservative, shorter rated hours, lower maintenance factor adjustment, less over-lighting drift. Typical LMF = 0.9.

**L70 Standard:** Industry standard at which output drops to 70% of initial. Longer rated hours, larger maintenance factor adjustment, more over-lighting at the start of life. Typical LMF = 0.7.

The LMF standard choice directly affects two calculations: the adjusted quantity (Q/LMF) and the base lifetime (LH/OH, where LH differs between standards).

### 2.2 Maintenance Factor Impact

The Luminaire Maintenance Factor accounts for LED lumen depreciation over time. To maintain minimum design light levels at end of life, the installation must provide additional luminous capacity in inverse proportion to LMF:

```
Q_adj = Q / LMF
```

`Q_adj` is the **equivalent system capacity** — the total installed luminous capacity, expressed as a number of luminaires at rated output, required so that the design illuminance is still met after lumen depreciation. In practice this capacity may be achieved through additional luminaires, higher-output variants of the same product, or revised layouts. The key point for this tool is that **total system wattage and energy scale by 1/LMF regardless of how the designer achieves the over-provision**.

Example: With LMF = 0.9 and Q = 500, the equivalent system capacity is 556 luminaire-equivalents (11% over the base quantity). With LMF = 0.7, the same base quantity scales to 714 luminaire-equivalents (43% over).

### 2.3 Control System Benefits (Optional Module)

Control systems reduce effective operating hours through occupancy sensing (20-30% savings), daylight harvesting (20-40%), and task tuning (10-20%). The combined effect is represented by CSC, where CSC = 0.75 means 25% energy reduction.

Additional benefits include lifetime extension through reduced operating hours and reduced thermal stress on LED drivers.

### 2.4 Methodology Assumptions

The following simplifications are used in this tool. Each is reasonable for comparative purposes (where both products use the same assumptions) but should be understood by the user.

1. **Maintenance dimming is modelled as linear.** The average drive level over the luminaire's life is assumed to be the midpoint between 100% and LMF. In practice, the relationship between reduced current, junction temperature, and lumen depreciation is non-linear. This means the lifetime extension estimate is approximate.

2. **Replacement costs are inflated at the general inflation rate.** LED luminaire prices have historically fallen over time, so inflating replacement costs at the general rate likely overstates future replacement expenditure. Since both products in a comparison use the same assumption, this does not distort relative comparisons, but the absolute total cost figures will be conservative.

3. **Grid decarbonisation is modelled as linear.** Actual grid decarbonisation may follow an S-curve or step-function pattern depending on policy and infrastructure investment.

4. **Energy consumption is constant across the luminaire's life.** This does not account for driver efficiency degradation or increasing power draw as LEDs age.

5. **Cost is modelled as scaling linearly with equivalent system capacity.** The tool multiplies per-luminaire supply and install cost by Q_adj, which assumes cost is proportional to total installed capacity. In practice, achieving the required over-provision through higher-output variants rather than additional luminaires may result in different per-unit costs. Since both products in a comparison use the same assumption, relative cost comparisons remain valid.

---

## 3. Detailed Calculations

### 3.1 Luminaire Efficacy

```javascript
EFF = FL / W;  // lm/W
```

Display alongside wattage and lumen output as an immediate quality metric.

### 3.2 Grid Decarbonisation Schedule

For year y (where 1 <= y <= PL):

```javascript
function calculateGridFactor(year, GF_0, GD, GDT) {
    const GF_floor = GF_0 * (1 - GD);

    if (GDT <= 1) {
        return GF_floor;
    }

    if (year <= GDT) {
        // Linear interpolation: year 1 = GF_0, year GDT = GF_floor
        const fraction = (year - 1) / (GDT - 1);
        return GF_0 - (GF_0 - GF_floor) * fraction;
    }

    return Math.max(GF_floor, 0);
}

// Average Grid Factor over project life
function calculateAverageGridFactor(PL, GF_0, GD, GDT) {
    let sum = 0;
    for (let y = 1; y <= PL; y++) {
        sum += calculateGridFactor(y, GF_0, GD, GDT);
    }
    return sum / PL;
}
```

**Verification (GF_0 = 0.39, GD = 0.3, GDT = 15):**

| Year | Grid Factor |
|------|-------------|
| 1 | 0.3900 (= GF_0, start value) |
| 8 | 0.3315 (midpoint) |
| 15 | 0.2730 (= GF_0 * 0.7, target reached) |
| 16+ | 0.2730 (held at floor) |

> **Shared helper used in Sections 3.3 and 3.5:**
>
> ```javascript
> // Average drive level over luminaire life — midpoint between 100% and LMF.
> // See Section 2.4 re: linearity assumption.
> const dimming_factor = 1 - (1 - LMF) / 2;
> ```
>
> Defined once and referenced from both lifetime extension (3.3) and energy reduction (3.5) so the two paths cannot drift apart.

### 3.3 Lifetime Assessment

**Base Lifetime:**

```javascript
L_base = LH / OH;
```

**Lifetime with Control:**

```javascript
L_control = L_base / CSC;
```

**Lifetime with Control + Maintenance Dimming:**

```javascript
// dimming_factor defined once above — used in both 3.3 and 3.5
const dimming_factor = 1 - (1 - LMF) / 2;
L_control_maint = L_control / dimming_factor;
```

**Validation:**

```javascript
if (L_base < 1) {
    return { error: "Lifetime less than 1 year. Check operational hours or rated lifetime." };
}
if (L_base > PL * 2) {
    return { warning: "Luminaire lifetime exceeds twice the project life. Replacement benefits may be negligible." };
}
```

### 3.4 Replacement Count

```javascript
function calculateReplacements(projectLife, luminaireLife) {
    if (luminaireLife <= 0) return 0;
    if (luminaireLife >= projectLife) return 0;
    return Math.min(Math.ceil(projectLife / luminaireLife) - 1, 10);
}
```

**Verification:**

| Project Life | Luminaire Life | Replacements | Reasoning |
|-------------|----------------|--------------|-----------|
| 15 | 10 | 1 | Replaced once at year 10 |
| 15 | 15 | 0 | Lasts the full project, no replacement |
| 15 | 5 | 2 | Replaced at year 5 and year 10 |
| 15 | 7 | 2 | Replaced at year 7 and year 14 |
| 10 | 10 | 0 | Exact boundary, no replacement needed |
| 30 | 8 | 3 | At years 8, 16, 24 |

### 3.5 Energy Assessment

**Annual Energy Calculations:**

```javascript
// Adjusted quantity accounts for maintenance factor over-provisioning
const Q_adj = Q / LMF;

// Base annual energy (kWh)
const E_base = (W * Q_adj * OH) / 1000;

// With control system (optional)
const E_control = E_base * CSC;

// With control + maintenance dimming (optional)
// dimming_factor defined once above — used in both 3.3 and 3.5
const dimming_factor = 1 - (1 - LMF) / 2;
const E_control_maint = Math.max(0, E_control * dimming_factor);
```

### 3.6 Annual Emissions (Year-by-Year Profile)

```javascript
function calculateEmissionsProfile(annualEnergy, PL, GF_0, GD, GDT) {
    const profile = [];
    let cumulative = 0;

    for (let year = 1; year <= PL; year++) {
        const GF_year = calculateGridFactor(year, GF_0, GD, GDT);
        const annual = GF_year * annualEnergy;
        cumulative += annual;

        profile.push({
            year,
            gridFactor: GF_year,
            annualEmissions: annual,     // kgCO2e
            cumulativeEmissions: cumulative
        });
    }

    return { profile, totalEmissions: cumulative };
}
```

This structure supports both summary totals and year-by-year chart output.

### 3.7 Environmental Assessment (GWP)

```javascript
function calculateTotalGWP(Q_adj, GWP_CG, GWP_EOL, numReplacements, totalOperationalEmissions) {
    // (1 + replacements) installation cycles, each with manufacturing and end-of-life
    const embodiedGWP = (1 + numReplacements) * Q_adj * (GWP_CG + GWP_EOL);
    const operationalGWP = totalOperationalEmissions;

    return {
        embodied: embodiedGWP,
        operational: operationalGWP,
        total: embodiedGWP + operationalGWP,
        embodiedPercent: (embodiedGWP / (embodiedGWP + operationalGWP)) * 100
    };
}
```

### 3.8 Cost Assessment

**Step 1: Initial Capital Cost**

```javascript
const C_initial = C_SI * Q_adj;
```

**Step 2: Present Value of Energy Costs (Year-by-Year Profile)**

```javascript
function calculatePVEnergyCosts(annualEnergy, ER, i, d, PL) {
    const profile = [];
    let pvTotal = 0;

    for (let y = 1; y <= PL; y++) {
        const nominalCost = annualEnergy * ER * Math.pow(1 + i, y - 1);
        const presentValue = nominalCost / Math.pow(1 + d, y);
        pvTotal += presentValue;

        profile.push({
            year: y,
            nominalCost,
            presentValue,
            cumulativePV: pvTotal
        });
    }

    return { profile, totalPV: pvTotal };
}
```

**Step 3: Present Value of Replacements**

Returns both the running total and the per-replacement schedule. The schedule is consumed by the year-by-year cumulative profile in Section 4.3.

```javascript
function calculatePVReplacements(C_initial, luminaireLife, numReplacements, i, d) {
    let pvTotal = 0;
    const schedule = [];

    for (let n = 1; n <= numReplacements; n++) {
        const replacementYear = Math.round(n * luminaireLife);
        // Note: uses general inflation. See Section 2.4 re: LED price trends.
        const nominalCost = C_initial * Math.pow(1 + i, replacementYear);
        const presentValue = nominalCost / Math.pow(1 + d, replacementYear);
        pvTotal += presentValue;
        schedule.push({ n, replacementYear, nominalCost, presentValue });
    }

    return { pvTotal, schedule };
}
```

**Step 4: Total Cost of Ownership**

```javascript
// Base scenario (no controls)
const TC_base = C_initial + PV_energy_base + PV_replace_base;

// With control system (optional)
// PV_loan = present value of the loan annuity discounted at d. See 3.9.
const TC_control = C_initial + PV_loan + PV_energy_control + PV_replace_control;

// With control + maintenance dimming (optional)
const TC_control_maint = C_initial + PV_loan + PV_energy_control_maint + PV_replace_control_maint;
```

All four terms are now in present-value space at the project discount rate `d`. `TLP` is still reported for display (nominal sum of loan payments) but is not summed into TCO.

### 3.9 Control System Financing (Optional)

Only calculated when the user enables the control system analysis.

**Step 1: Additional control cost**

```javascript
const ACC_unit = C_SI * (CACC - 1);
const ACC_total = Q_adj * ACC_unit;
```

**Step 2: Loan payments**

```javascript
function PMT(rate, nper, pv) {
    if (rate === 0) return -pv / nper;
    const pvif = Math.pow(1 + rate, nper);
    return -pv * rate * pvif / (pvif - 1);
}

const ALP = PMT(r, LT, -ACC_total);  // Annual Loan Payment
const TLP = ALP * LT;                 // Total Loan Payments (principal + interest, nominal)
const TIP = TLP - ACC_total;           // Total Interest Paid
```

**Step 3: Present value of the loan annuity**

```javascript
function calculatePVLoan(ALP, LT, d) {
    if (d === 0) return ALP * LT;
    return ALP * (1 - Math.pow(1 + d, -LT)) / d;
}

const PV_loan = calculatePVLoan(ALP, LT, d);
```

Properties:
- When `r = d`, `PV_loan = ACC_total` (financing is value-neutral).
- When `r > d`, `PV_loan > ACC_total` (the interest premium is a real cost).
- When `r < d`, `PV_loan < ACC_total` (financing creates value vs. paying cash).

`PV_loan` is the term summed into `TC_control` and `TC_control_maint` in Step 4 above. `TLP` and `TIP` remain useful as display values (total nominal outflow, total interest paid).

### 3.10 Financial Metrics

**Simple Payback Period (control system):**

```javascript
const annual_savings = (E_base - E_control) * ER;
const simple_payback = annual_savings > 0 ? ACC_total / annual_savings : Infinity;
```

**NPV of choosing Product A over Product B:**

The NPV answers: "What is the present value of choosing Product A over Product B?" — equivalently, `TC(B) − TC(A)` in present-value terms. The PROPOSED-vs-BENCHMARK framing means the verdict component (`VerdictRibbon`) treats positive NPV as "Product A wins."

```javascript
function calculateComparisonNPV(productA, productB, d, PL, ER, i) {
    // Initial cost differential (positive if B costs more upfront — A's advantage)
    const initialDiff = productB.C_initial - productA.C_initial;

    let npv = initialDiff;

    for (let y = 1; y <= PL; y++) {
        // Annual energy cost savings of A over B (positive if A uses less)
        const energySavings = (productB.E_base - productA.E_base) * ER
            * Math.pow(1 + i, y - 1);

        npv += energySavings / Math.pow(1 + d, y);
    }

    // PV of avoided replacements (positive if A replaces less than B)
    npv += productB.PV_replace - productA.PV_replace;

    // When controls are enabled on both products, include the loan-PV differential.
    // Caller passes promoted result objects whose .ctrlResults.PV_loan is defined.
    if (productA.ctrlResults && productB.ctrlResults) {
        npv += productB.ctrlResults.PV_loan - productA.ctrlResults.PV_loan;
    }

    return npv;
    // Positive NPV = Product A is financially better over PL
    // Negative NPV = Product B is financially better over PL
}
```

---

## 4. Comparison Framework

### 4.1 Product A vs Product B (or Benchmark)

The primary comparison mode. Both products share the same project-level inputs (OH, PL, GF_0, ER, i, d, GD, GDT) but have independent luminaire specifications. Product B defaults to the benchmark values from Section 1.3 if the user does not enter a second product.

**Summary Output:**

```javascript
function generateComparison(productA, productB) {
    return {
        efficacy: {
            productA: productA.EFF,
            productB: productB.EFF,
            difference: productA.EFF - productB.EFF,
            differencePercent: ((productA.EFF - productB.EFF) / productB.EFF) * 100
        },
        annualEnergy: {
            productA: productA.E_base,
            productB: productB.E_base,
            annualSavings: productB.E_base - productA.E_base,
            savingsPercent: ((productB.E_base - productA.E_base) / productB.E_base) * 100
        },
        totalGWP: {
            productA: productA.GWP_total,
            productB: productB.GWP_total,
            differenceKg: productB.GWP_total - productA.GWP_total,
            differencePercent: ((productB.GWP_total - productA.GWP_total) / productB.GWP_total) * 100
        },
        totalCost: {
            productA: productA.TC_base,
            productB: productB.TC_base,
            npv: calculateComparisonNPV(productA, productB),
            savings: productB.TC_base - productA.TC_base
        },
        lifetime: {
            productA: productA.L_base,
            productB: productB.L_base,
            replacementsA: productA.N_replace,
            replacementsB: productB.N_replace
        }
    };
}
```

### 4.2 Control System Analysis (Optional Overlay)

When enabled, the control system analysis runs on each product independently, generating the three-scenario breakdown (base, controlled, controlled + dimming) within each product. This can be toggled on or off without affecting the core A vs B comparison.

When controls are enabled, GWP is calculated for all three scenarios using the respective annual energy and replacement counts. The operational component reflects fewer kWh, and the embodied component reflects fewer replacement cycles thanks to the longer effective lifetime under controls and dimming. Engine output: `gwpBase`, `ctrlResults.gwpCtrl`, `ctrlResults.gwpCtrlMaint` — each with the same `embodied`, `operational`, `total`, `embodiedPercent`, `operationalPercent` shape.

### 4.3 Year-by-Year Profiles for Charting

`product.replaceSchedule` is the `schedule` array returned from `calculatePVReplacements` (Section 3.8, Step 3). Iterating it directly avoids the circular rounding logic used in v1 of this section, which could misfire with fractional lifetimes.

```javascript
function generateProfiles(product, PL, GF_0, GD, GDT, ER, i, d) {
    const profiles = {
        years: [],
        cumulativeEmissions: [],
        cumulativeCost: [],
        annualEmissions: [],
        annualCost: []
    };

    let cumEmissions = 0;
    let cumCost = product.C_initial;

    for (let y = 1; y <= PL; y++) {
        const GF_year = calculateGridFactor(y, GF_0, GD, GDT);
        const annualEmissions = GF_year * product.E_base;
        const annualCost = product.E_base * ER * Math.pow(1 + i, y - 1);

        cumEmissions += annualEmissions;
        cumCost += annualCost / Math.pow(1 + d, y);

        // Add replacement cost in the year it occurs
        product.replaceSchedule.forEach(r => {
            if (r.replacementYear === y) {
                cumCost += r.presentValue;
            }
        });

        profiles.years.push(y);
        profiles.annualEmissions.push(annualEmissions);
        profiles.cumulativeEmissions.push(cumEmissions);
        profiles.annualCost.push(annualCost);
        profiles.cumulativeCost.push(cumCost);
    }

    return profiles;
}
```

---

## 5. Validation Rules and Error Handling

### 5.1 Input Validation

```javascript
function validateInputs(inputs) {
    const errors = [];
    const warnings = [];

    // Hard errors (prevent calculation)
    if (inputs.GF_0 < 0 || inputs.GF_0 > 1.2) {
        errors.push("Grid Factor must be between 0 and 1.2 kg/kWh");
    }
    if (inputs.W <= 0) {
        errors.push("Wattage must be greater than 0");
    }
    if (inputs.Q <= 0) {
        errors.push("Quantity must be at least 1");
    }
    if (inputs.LMF <= 0 || inputs.LMF > 1) {
        errors.push("Maintenance Factor must be between 0 (exclusive) and 1");
    }
    if (inputs.OH < 1 || inputs.OH > 8760) {
        errors.push("Operational hours must be between 1 and 8760 hours/year");
    }
    if (inputs.PL < 1 || inputs.PL > 50) {
        errors.push("Project life must be between 1 and 50 years");
    }
    if (inputs.LH <= 0) {
        errors.push("Rated lifetime must be greater than 0 hours");
    }

    // Soft warnings (allow calculation but flag)
    if (inputs.ER < 0.05 || inputs.ER > 1.99) {
        warnings.push("Electricity rate is outside the typical range ($0.05-$1.99/kWh). Check value.");
    }
    if (inputs.LMF < 0.6 || inputs.LMF > 0.95) {
        warnings.push("Maintenance Factor is outside the typical LED range (0.6-0.95). Check value.");
    }
    if (inputs.d < inputs.i) {
        warnings.push("Discount rate is lower than inflation rate. This amplifies future costs in PV terms.");
    }

    return { errors, warnings, valid: errors.length === 0 };
}
```

### 5.2 Calculation Warnings

```javascript
function checkCalculationWarnings(results) {
    const warnings = [];

    if (results.L_base < 1) {
        warnings.push("Luminaire lifetime is less than 1 year at these operational hours.");
    }
    if (results.N_replace >= 3) {
        warnings.push(
            `Luminaires will be replaced ${results.N_replace} times. ` +
            "Consider whether technology refresh assumptions still hold."
        );
    }
    if (results.GDT > results.PL) {
        warnings.push("Grid decarbonisation target extends beyond the project life.");
    }
    if (results.simple_payback > results.LT) {
        warnings.push("Control system payback period exceeds the loan term.");
    }
    if (results.simple_payback > results.PL) {
        warnings.push("Control system payback period exceeds the project life.");
    }

    return warnings;
}
```

---

## 6. Implementation Notes

1. **Year indexing:** Year 1 = first year of operation. There is no year 0.
2. **Rounding:** `Math.ceil(PL/L) - 1` for replacements. Standard rounding (2 decimal places) for display values.
3. **Currency:** All monetary values in AUD by default (configurable).
4. **Caps:** Replacements capped at 10. Grid decarbonisation capped at the specified fraction (GD), never exceeding 100%.
5. **Precision:** 4 decimal places for intermediate calculations, 2 for display.
6. **Control system toggle:** All control-related calculations (CSC, CACC, loan, payback) are skipped when the control module is disabled. The core comparison only requires base scenario calculations.
7. **Chart data:** The year-by-year profiles in Sections 3.6, 3.8, and 4.3 provide the data structure for cumulative cost and emissions charts. Both products should appear on the same chart for direct visual comparison.
8. **Discount rate default:** Defaults to `0.05` (matching the Section 1.1 table and the shipped `PROJECT_DEFAULTS`). The validator warns when `d < i` because that amplifies future costs in PV terms. Setting `d = i` shows costs in real (inflation-adjusted) terms, which can be a useful sensitivity check but is not the default.
