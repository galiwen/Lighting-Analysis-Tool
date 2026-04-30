import { T } from '../design/tokens.js';
import { Modal } from '../components/atoms.jsx';

const Section = ({ heading, children, last }) => (
  <div style={{ marginBottom: last ? 0 : 20, paddingBottom: last ? 0 : 20, borderBottom: last ? 'none' : `1px solid ${T.c100}` }}>
    <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.c800, marginBottom: 10 }}>{heading}</div>
    {children}
  </div>
);

export const InfoModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="About This Tool" width={620}>
    <div style={{ fontFamily: T.font, fontWeight: 300, fontSize: 12, color: T.c800, lineHeight: 1.7 }}>

      <Section heading="What this tool does">
        This tool lets lighting professionals compare the environmental and financial performance
        of luminaire products over a project's full lifecycle. Enter your project context and up to
        two products — the tool produces a complete environmental and financial analysis, including
        year-by-year carbon and cost profiles.
      </Section>

      <Section heading="How to use it">
        <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>01 — Project:</strong> Set operational hours, project life, electricity rate, grid carbon intensity, and decarbonisation assumptions. These are shared across both products.</li>
          <li><strong>02 — Product A:</strong> Enter your specified luminaire — wattage, lumens, quantity, LMF, rated lifetime, embodied carbon, and supply/install cost.</li>
          <li><strong>03 — Product B:</strong> Enter a comparison luminaire, or use the Benchmark button to load a typical product type (Downlight, Linear, Cylinder, Troffer, Post Top).</li>
          <li><strong>Calculate:</strong> All calculations run entirely in your browser. No data is sent to any server.</li>
        </ol>
      </Section>

      <Section heading="The four analysis outputs">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>GWP / Emissions:</strong> Lifecycle carbon — embodied (manufacturing × replacement cycles) plus operational (energy × grid factor, adjusted for decarbonisation year by year). Shown as pie charts and a cumulative 15-year profile.</li>
          <li><strong>L90 vs L70:</strong> Dedicated mode to evaluate a single luminaire at both maintenance standards. The LMF drives adjusted quantity (Q/LMF), lifetime, and replacement frequency — this mode makes those consequences explicit across all four dimensions.</li>
          <li><strong>Controls:</strong> Three-scenario breakdown (base / with controls / with controls + maintenance dimming) showing energy, lifetime, and cost consequences of a control system investment, including loan financing and simple payback.</li>
          <li><strong>Financial:</strong> Total cost of ownership decomposed into initial capital, present value of energy costs, and present value of replacements. NPV answers "what is the value of choosing Product A over B over the project life?"</li>
        </ul>
      </Section>

      <Section heading="Key concepts">
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px' }}>
          {[
            ['LMF', 'Luminaire Maintenance Factor — the fraction of initial lumens retained at rated end of life. L90 = 0.90; L70 = 0.70. The installed quantity is always Q/LMF to maintain minimum light levels at end of life.'],
            ['Q/LMF', 'The equivalent system capacity. A lower LMF requires more installed capacity (whether via more luminaires or higher-output variants) to maintain design light levels at end of life.'],
            ['GWP', 'Global Warming Potential in kgCO₂e — the standard unit for comparing the climate impact of different greenhouse gases.'],
            ['NPV', 'Net Present Value — the present value of future cash flow differences, discounted at the project cost of capital. Positive NPV means Product A is financially preferable over the project life.'],
            ['PV', 'Present Value — a future cost or saving expressed in today\'s money, discounted at the project discount rate.'],
            ['Grid Decarb', 'The assumed reduction in grid carbon intensity over time as renewable energy penetrates the grid. Modelled as linear between the start value and a target floor.'],
          ].map(([k, v]) => [
            <dt key={`k-${k}`} style={{ fontWeight: 500, color: T.c800 }}>{k}</dt>,
            <dd key={`v-${k}`} style={{ color: T.c400, fontWeight: 300 }}>{v}</dd>,
          ])}
        </dl>
      </Section>

      <Section heading="Methodology notes" last>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4, color: T.c400 }}>
          <li>Maintenance dimming is modelled as linear — the average drive level over life is the midpoint between 100% and LMF.</li>
          <li>Replacement costs are inflated at the general inflation rate. LED prices have historically fallen, so this is conservative.</li>
          <li>Grid decarbonisation is modelled as linear. Actual trajectories may follow an S-curve.</li>
          <li>Energy consumption is assumed constant across the luminaire's life (driver degradation is not modelled).</li>
          <li>All monetary values in AUD. Intermediate calculations use 4 decimal places; display values are rounded to 2.</li>
        </ul>
      </Section>

    </div>
  </Modal>
);
