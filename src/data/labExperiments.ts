import { LabExperiment, VivaQuestion } from '../types';

export const LAB_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp-1',
    title: 'Exp 1: Single-Phase Half-Wave Diode Rectifier',
    subtitle: 'Study of R & R-L load characteristics and conduction angle',
    phase: 'single',
    topology: 'half-wave',
    switchTech: 'diode',
    defaultLoad: 'R',
    defaultAlpha: 0,
    aim: 'To observe and analyze the input voltage, output voltage, and output current waveforms of a single-phase half-wave uncontrolled rectifier with resistive (R) and resistive-inductive (RL) loads, and determine average DC voltage, ripple factor, and rectification efficiency.',
    apparatus: [
      'Single-phase AC Supply (230 V, 50 Hz)',
      'Step-down Isolation Transformer (230V / 30V)',
      'Power Diode (IN5408 or equivalent 10A, 1000V)',
      'Rheostat / Load Resistor (10 Ω - 100 Ω, 5A)',
      'Variable Inductor (20 mH - 100 mH)',
      'Digital Storage Oscilloscope (DSO)',
      'True RMS Multimeter & DC Voltmeter',
    ],
    theorySummary:
      'In a single-phase half-wave diode rectifier, the diode is forward biased during the positive half-cycle (0 to π) and conducts current through the load. During the negative half-cycle (π to 2π), the diode becomes reverse-biased and blocks current. For an R-L load without a freewheeling diode, the energy stored in the inductor maintains current flow past π until the extinction angle β, causing the output voltage to swing negative and reducing the net average DC voltage.',
    procedureSteps: [
      'Select Single-Phase Half-Wave Diode topology from the control panel.',
      'Set the AC supply voltage to 230 V RMS (or step-down equivalent) and frequency to 50 Hz.',
      'Start with a purely Resistive Load (R = 50 Ω). Verify that the conduction interval is exactly 180° (0 to π).',
      'Click "Record Reading" in the Observation Table to log V_dc, V_rms, and ripple factor.',
      'Switch the load to R-L (add L = 45 mH). Observe that the output voltage goes negative between π and β (extinction angle).',
      'Note the reduction in average DC voltage due to the negative voltage area.',
      'Toggle the Freewheeling Diode (FWD) into the circuit. Verify that the output voltage is clamped to 0 V during the negative cycle while load current freewheels.',
    ],
    keyFormulas: [
      {
        label: 'Average Output Voltage (R Load)',
        formula: 'V_dc = V_m / π ≈ 0.318 V_m',
        note: 'Where V_m = √2 · V_rms is the peak input voltage.',
      },
      {
        label: 'RMS Output Voltage (R Load)',
        formula: 'V_rms = V_m / 2 = 0.5 V_m',
        note: 'Form factor FF = V_rms / V_dc = π / 2 ≈ 1.57',
      },
      {
        label: 'Ripple Factor',
        formula: 'RF = √(FF² - 1) = √(1.57² - 1) ≈ 1.21 (121%)',
        note: 'Demonstrates large ripple content requiring significant filtering.',
      },
    ],
    expectedConclusions: [
      'Half-wave diode rectifier has a low rectification efficiency of 40.6% for resistive load.',
      'The Peak Inverse Voltage (PIV) across the diode equals V_m.',
      'Inductive load extends the conduction angle beyond 180° up to extinction angle β.',
      'A freewheeling diode eliminates negative output voltage spikes and improves power factor.',
    ],
  },
  {
    id: 'exp-2',
    title: 'Exp 2: Single-Phase Full-Wave Bridge Diode Rectifier',
    subtitle: 'Full-cycle conversion, Graetz bridge dynamics, and C-filter effect',
    phase: 'single',
    topology: 'full-bridge',
    switchTech: 'diode',
    defaultLoad: 'R',
    defaultAlpha: 0,
    aim: 'To construct and analyze a single-phase full-wave bridge diode rectifier with R, RL, and capacitive filter circuits, and evaluate ripple factor and efficiency.',
    apparatus: [
      'Single-phase AC Supply (230 V, 50 Hz)',
      '4x Power Diodes (Bridge module 25A, 600V)',
      'Decade Resistance Box / Load Rheostat (20 Ω - 100 Ω)',
      'Smoothing Filter Capacitors (100 µF, 470 µF, 1000 µF)',
      'Dual-Trace Digital Oscilloscope',
      'AC & DC Digital Clamp Meters',
    ],
    theorySummary:
      'The full-wave bridge rectifier utilizes four diodes in a bridge arrangement. Diodes D1 and D2 conduct during the positive half-cycle, while D3 and D4 conduct during the negative half-cycle. This inverts the negative half-cycle so that current flows through the load in the same direction throughout the entire 360° period. The ripple frequency is 2f (100 Hz), making filtering significantly easier than half-wave.',
    procedureSteps: [
      'Select Single-Phase Full-Bridge Diode configuration.',
      'Observe the animated current loops: D1-D2 on positive half-cycle and D3-D4 on negative half-cycle.',
      'Examine the Superimposed waveform showing vs and vo. Confirm vo = |vs|.',
      'Record readings for pure R load and check that V_dc = 2Vm/π ≈ 0.636 Vm.',
      'Enable the Filter Capacitor C = 470 µF. Notice the peak-holding behavior with low ripple voltage.',
      'Observe the FFT Harmonics tab to inspect the 2nd harmonic (100 Hz) dominance.',
    ],
    keyFormulas: [
      {
        label: 'Average Output Voltage',
        formula: 'V_dc = 2 · V_m / π ≈ 0.636 V_m',
        note: 'Twice that of a half-wave rectifier.',
      },
      {
        label: 'RMS Output Voltage',
        formula: 'V_rms = V_m / √2 ≈ 0.707 V_m',
        note: 'Form factor FF = V_rms / V_dc = π / (2√2) ≈ 1.11',
      },
      {
        label: 'Ripple Factor',
        formula: 'RF = √(1.11² - 1) ≈ 0.482 (48.2%)',
        note: 'Significant reduction compared to 121% in half-wave.',
      },
      {
        label: 'Rectification Efficiency',
        formula: 'η = (8 / π²) · 100% ≈ 81.2%',
        note: 'Double the maximum theoretical efficiency of half-wave.',
      },
    ],
    expectedConclusions: [
      'Full-wave rectification achieves 81.2% maximum theoretical conversion efficiency.',
      'Fundamental ripple frequency is 100 Hz (twice the supply frequency).',
      'PIV rating of each diode is V_m (compared to 2Vm for center-tapped transformer design).',
    ],
  },
  {
    id: 'exp-3',
    title: 'Exp 3: Single-Phase Half-Wave Controlled Converter (SCR)',
    subtitle: 'Firing angle control (α) and phase-controlled rectification',
    phase: 'single',
    topology: 'half-wave',
    switchTech: 'thyristor',
    defaultLoad: 'R',
    defaultAlpha: 45,
    aim: 'To study the operation of a single-phase half-wave phase-controlled thyristor (SCR) rectifier, vary the firing angle α from 0° to 180°, and plot the transfer curve of V_dc versus α.',
    apparatus: [
      'Thyristor (SCR TYN612 or 25RIA120)',
      'Gate Firing Circuit with Synchronized Pulse Generator',
      'Isolation Transformer & AC Source (230 V, 50 Hz)',
      'Rheostat Load (20 Ω, 10A)',
      'Oscilloscope with High-Voltage Differential Probes',
    ],
    theorySummary:
      'A thyristor remains in forward blocking mode until an appropriate positive gate current pulse is applied while forward biased. By delaying the gate pulse by an angle α (firing angle), conduction is delayed, allowing continuous stepless control of the average DC output voltage from maximum (at α = 0°) to zero (at α = 180°).',
    procedureSteps: [
      'Select Single-Phase Half-Wave Thyristor from the circuit dropdown.',
      'Start with firing angle α = 0° and record baseline DC voltage.',
      'Increment α in steps: 30°, 45°, 60°, 90°, 120°, 150°. Observe the gate trigger pulse alignment on the oscilloscope.',
      'Log each measurement into the Observation Table using "Record Reading".',
      'Go to the Lab Manual / Observation Table tab and view the generated V_dc vs α graph.',
      'Compare simulated curve against the theoretical cosine function V_dc = (Vm/2π)(1 + cos α).',
    ],
    keyFormulas: [
      {
        label: 'Average Output Voltage (R Load)',
        formula: 'V_dc = (V_m / 2π) · (1 + cos α)',
        note: 'At α = 0°, V_dc = V_m/π. At α = 90°, V_dc = V_m/2π. At α = 180°, V_dc = 0.',
      },
      {
        label: 'RMS Output Voltage',
        formula: 'V_rms = (V_m / 2) · √[ 1 - α/π + (sin 2α) / (2π) ]',
        note: 'Where α is in radians.',
      },
    ],
    expectedConclusions: [
      'DC output voltage is inversely related to firing angle α according to (1 + cos α).',
      'Harmonic content increases significantly at high delay angles α.',
      'Input displacement power factor degrades proportionally to cos(α/2).',
    ],
  },
  {
    id: 'exp-4',
    title: 'Exp 4: Single-Phase Fully Controlled Bridge Converter',
    subtitle: 'Continuous & Discontinuous conduction, Inversion mode (α > 90°)',
    phase: 'single',
    topology: 'full-bridge',
    switchTech: 'thyristor',
    defaultLoad: 'RL',
    defaultAlpha: 60,
    aim: 'To investigate the 1-phase fully controlled bridge converter with RL and R-L-E loads, observe continuous conduction waveforms, and demonstrate line-commutated inverter operation when α > 90° with a DC source.',
    apparatus: [
      '4x Power Thyristors (Bridge Configuration)',
      'Microcontroller-based 4-channel synchronized gate drive',
      'Variable AC Source (230 V, 50 Hz)',
      'High-Inductance Smoothing Reactor (100 mH - 300 mH)',
      'DC Motor / DC Voltage Source for Back-EMF (E = 48V)',
      'Multi-channel DSO',
    ],
    theorySummary:
      'The single-phase fully-controlled bridge converter uses 4 thyristors. T1 and T2 are fired at α, while T3 and T4 are fired at π + α. Under continuous conduction with high inductance L, current never drops to zero. As a result, T1 and T2 continue to conduct even after vs goes negative, until T3 and T4 are fired at π + α. When α > 90°, average V_dc becomes negative, allowing power flow from the DC load back into the AC supply (line-commutated inverter mode).',
    procedureSteps: [
      'Select 1-Phase Fully Controlled Bridge Converter.',
      'Set load to R-L (R = 25 Ω, L = 80 mH) to establish continuous conduction.',
      'Set firing angle α = 30°: observe positive average output voltage V_dc.',
      'Sweep α to 60° and 90°: observe that at α = 90°, average V_dc reaches 0 V.',
      'Increase α past 90° (e.g. α = 120°, 135°): note that V_dc becomes negative.',
      'Set Back-EMF E = 50 V with proper polarity: observe inverter mode power flow (P_dc < 0).',
    ],
    keyFormulas: [
      {
        label: 'Average Output Voltage (Continuous RL)',
        formula: 'V_dc = (2 · V_m / π) · cos α',
        note: 'For 0 ≤ α < 90°: Rectifier mode. For 90° < α < 180°: Inverter mode.',
      },
      {
        label: 'RMS Output Voltage',
        formula: 'V_rms = V_m / √2 = V_rms,in',
        note: 'Magnitude of output voltage waveform equals rectified sine wave.',
      },
      {
        label: 'Input Displacement Factor',
        formula: 'DF = cos α',
        note: 'Input current fundamental lags supply voltage by angle α.',
      },
    ],
    expectedConclusions: [
      'With high load inductance, V_dc varies purely with cos(α).',
      'At α = 90°, the net average output voltage is exactly zero.',
      'For α > 90°, the converter can return power to the AC mains if an active DC source is present.',
    ],
  },
  {
    id: 'exp-5',
    title: 'Exp 5: Three-Phase Half-Wave Rectifier (3-Pulse)',
    subtitle: 'Phase commutation, 3-pulse ripple, and neutral current analysis',
    phase: 'three',
    topology: 'half-wave',
    switchTech: 'diode',
    defaultLoad: 'R',
    defaultAlpha: 0,
    aim: 'To analyze a 3-phase half-wave (3-pulse) rectifier circuit fed from a 3-phase star-connected AC supply, observe phase commutation at 30° natural points, and determine ripple frequency.',
    apparatus: [
      '3-Phase AC Source (415 V Line-to-Line / 240 V Phase-to-Neutral, 50 Hz)',
      '3x Power Diodes (or 3x Thyristors for controlled variant)',
      'Star Connected Neutral Terminal',
      '3-Phase Rheostat Load',
      '4-Channel Digital Storage Oscilloscope',
    ],
    theorySummary:
      'In a 3-phase half-wave rectifier, three diodes/thyristors have their cathodes connected together to the positive DC load terminal, and each anode is connected to one phase (A, B, C) of a star supply. The diode with the highest instantaneous anode voltage conducts. Natural commutation occurs at the intersections of the phase voltages (at wt = 30°, 150°, 270°). The output voltage contains 3 pulses per supply cycle (150 Hz ripple for 50 Hz source).',
    procedureSteps: [
      'Select Three-Phase Half-Wave Diode configuration.',
      'Inspect the 3 sinusoidal phase voltages va, vb, vc displayed in different colors.',
      'Observe that conduction shifts seamlessly from Phase A to Phase B to Phase C at 30°, 150°, and 270°.',
      'Record average V_dc and compare against theoretical 3√3 Vm / (2π) ≈ 0.827 Vm.',
      'Switch technology to Thyristor and vary α to observe the 3-pulse phase delay.',
    ],
    keyFormulas: [
      {
        label: 'Average Output Voltage (Diode / α = 0°)',
        formula: 'V_dc = (3 · √3 · V_m) / (2π) ≈ 0.827 V_m ≈ 1.17 V_phase,rms',
        note: 'Where V_m is the peak phase-to-neutral voltage.',
      },
      {
        label: 'Ripple Frequency',
        formula: 'f_ripple = 3 · f = 150 Hz (at 50 Hz supply)',
        note: 'Three output voltage pulses per input supply cycle.',
      },
    ],
    expectedConclusions: [
      '3-phase rectification yields higher average DC voltage and much smaller ripple than single-phase.',
      'DC component flows through the neutral wire, which may cause transformer core saturation.',
    ],
  },
  {
    id: 'exp-6',
    title: 'Exp 6: Three-Phase Six-Pulse Fully-Controlled Bridge Converter',
    subtitle: 'Industrial Graetz bridge, 300 Hz low ripple, and motor drive converter',
    phase: 'three',
    topology: 'full-bridge',
    switchTech: 'thyristor',
    defaultLoad: 'RL',
    defaultAlpha: 30,
    aim: 'To construct and simulate an industrial standard 3-phase 6-pulse fully-controlled Graetz bridge converter, observe line-to-line conduction pairs, and examine harmonic spectra.',
    apparatus: [
      '3-Phase AC Supply (415 V L-L, 50 Hz)',
      '6x Power Thyristors (Graetz Bridge Assembly)',
      '6-Pulse Firing Circuit with 60° pulse spacing',
      'Industrial DC Load / Heavy Inductive Reactor',
      'Power Quality Analyzer & Spectrum Analyzer',
    ],
    theorySummary:
      'The 3-phase full bridge converter consists of two groups: top thyristors (T1, T3, T5) connected to the positive rail, and bottom thyristors (T4, T6, T2) connected to the negative rail. At any moment, one thyristor from the top group (with most positive phase) and one from the bottom group (with most negative phase) conduct simultaneously. The output is composed of portions of the 6 line-to-line voltages (vAB, vAC, vBC, vBA, vCA, vCB). Ripple frequency is 6f (300 Hz), requiring minimal filtering.',
    procedureSteps: [
      'Select Three-Phase Full-Bridge Thyristor configuration.',
      'Observe the 6 firing pulses triggering pairs every 60°: T1-T6, T1-T2, T3-T2, T3-T4, T5-T4, T5-T6.',
      'Set α = 0° and observe the low 4.2% ripple factor.',
      'Increase α to 30°, 60°, 90°. Notice that at α = 60°, V_dc is exactly half of the maximum.',
      'Open the Harmonics FFT tab to verify that the dominant harmonics are 6th (300 Hz) and 12th (600 Hz).',
      'Test inverting operation by setting α = 120° with an active back-EMF.',
    ],
    keyFormulas: [
      {
        label: 'Average Output Voltage',
        formula: 'V_dc = (3 · V_mL / π) · cos α = (3 · √3 · V_m / π) · cos α ≈ 1.35 · V_LL,rms · cos α',
        note: 'Where V_mL = √3 · V_m is the peak line-to-line voltage.',
      },
      {
        label: 'Ripple Factor (Diode / α = 0°)',
        formula: 'RF ≈ 0.042 (4.2%)',
        note: 'Extremely smooth DC output even without external filter capacitor.',
      },
      {
        label: 'Ripple Frequency',
        formula: 'f_ripple = 6 · f = 300 Hz',
        note: 'Six pulses per supply cycle.',
      },
    ],
    expectedConclusions: [
      '6-pulse bridge converter is the primary topology for high-power DC drives and HVDC transmission.',
      'Ripple voltage is under 5%, and supply current contains no triplen (3rd, 9th) harmonics.',
      'Full four-quadrant or two-quadrant control capability with high transformer utilization.',
    ],
  },
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    question: 'Why does the average DC output voltage of a single-phase half-wave rectifier with R-L load decrease compared to an R load?',
    options: [
      'Because the diode experiences breakdown at high current',
      'Because the inductor stores energy and keeps the switch conducting into the negative half-cycle',
      'Because the supply voltage drops due to transformer impedance',
      'Because load resistance increases at higher temperatures',
    ],
    correctIndex: 1,
    explanation:
      'The inductive energy stored in L (0.5 L i²) forces current to continue flowing even after the AC source crosses zero into negative voltage, pulling the output voltage negative until current reaches zero at extinction angle β. This negative voltage area subtracts from the average DC output.',
    topic: 'Inductive Loads & Commutation',
  },
  {
    id: 2,
    question: 'What is the primary function of a Freewheeling Diode (FWD) connected across an inductive load?',
    options: [
      'To increase the peak inverse voltage rating of the main switches',
      'To clamp negative output voltage spikes to zero and provide a path for stored inductive energy',
      'To step up the AC input voltage',
      'To convert single-phase into three-phase supply',
    ],
    correctIndex: 1,
    explanation:
      'When the source voltage attempts to go negative, the freewheeling diode becomes forward-biased, clamping the load voltage to ~0 V and allowing the load current to recirculate (freewheel) through the diode. This prevents negative voltage swings and improves circuit efficiency and power factor.',
    topic: 'Freewheeling Diode',
  },
  {
    id: 3,
    question: 'What is the ripple frequency in a 3-phase 6-pulse fully controlled bridge rectifier connected to a 50 Hz AC grid?',
    options: ['50 Hz', '100 Hz', '150 Hz', '300 Hz'],
    correctIndex: 3,
    explanation:
      'In a 6-pulse bridge converter, there are 6 conduction intervals per supply cycle (one every 60°). Therefore, the fundamental ripple frequency is 6 × f = 6 × 50 Hz = 300 Hz.',
    topic: 'Three-Phase Bridge Rectifiers',
  },
  {
    id: 4,
    question: 'For a single-phase fully controlled bridge rectifier with continuous conduction, at what firing angle α does the average DC output voltage equal zero?',
    options: ['α = 0°', 'α = 45°', 'α = 90°', 'α = 180°'],
    correctIndex: 2,
    explanation:
      'Under continuous conduction, V_dc = (2 Vm / π) cos α. Since cos(90°) = 0, the average DC output voltage is exactly zero at α = 90°. For α > 90°, V_dc becomes negative, entering inverter mode.',
    topic: 'Controlled Rectifiers',
  },
  {
    id: 5,
    question: 'What is the Peak Inverse Voltage (PIV) across each diode in a single-phase full-wave bridge rectifier?',
    options: ['0.5 V_m', 'V_m', '2 V_m', '√2 V_m'],
    correctIndex: 1,
    explanation:
      'In a bridge rectifier, each non-conducting diode is subject to a maximum reverse voltage of V_m (the peak supply voltage). In contrast, a center-tapped transformer rectifier subjects each diode to 2 V_m.',
    topic: 'Diode Ratings & PIV',
  },
  {
    id: 6,
    question: 'What conditions are required for a phase-controlled converter to operate in the line-commutated inverter mode?',
    options: [
      'Firing angle α > 90°, continuous conduction, and an active DC voltage source in the load with proper polarity',
      'Firing angle α = 0° with purely resistive load',
      'Using diodes instead of thyristors with high capacitance',
      'Disconnecting the AC grid while maintaining DC current',
    ],
    correctIndex: 0,
    explanation:
      'To operate as a line-commutated inverter: (1) Firing angle must be greater than 90° so that V_dc is negative, (2) Current must remain continuous (flow in the forward direction since SCRs are unidirectional), and (3) An active DC energy source (back-EMF or battery) must supply power against the negative converter terminal voltage.',
    topic: 'Inverter Mode',
  },
  {
    id: 7,
    question: 'What is the theoretical rectification efficiency of a single-phase full-wave rectifier with a resistive load?',
    options: ['40.6%', '50.0%', '81.2%', '100%'],
    correctIndex: 2,
    explanation:
      'For a single-phase full-wave rectifier with resistive load: P_dc = V_dc · I_dc = (2Vm/π)² / R = 4Vm² / (π² R). P_ac = V_rms · I_rms = (Vm/√2)² / R = Vm² / (2R). Efficiency η = P_dc / P_ac = 8 / π² ≈ 0.812 (81.2%). For half-wave it is 40.6%.',
    topic: 'Rectifier Performance Metrics',
  },
  {
    id: 8,
    question: 'From where is the firing angle α measured in a 3-phase controlled rectifier?',
    options: [
      'From the zero-crossing of the phase voltage va(t) = 0',
      'From the natural commutation intersection points of the phase voltages (wt = 30° for phase A)',
      'From the peak of the line-to-line voltage',
      'From wt = 90° arbitrarily',
    ],
    correctIndex: 1,
    explanation:
      'In polyphase converters, the firing angle α is defined as the delay angle measured from the natural commutation point—the instant at which an uncontrolled diode would naturally start conducting (e.g. 30° after phase voltage zero-crossing for 3-pulse, where phase va crosses vc).',
    topic: 'Firing Angle Reference',
  },
  {
    id: 9,
    question: 'Why is the Transformer Utilization Factor (TUF) of a half-wave rectifier lower than a full-wave bridge rectifier?',
    options: [
      'Because the transformer core carries DC magnetization current in half-wave, and AC current only flows during half of each cycle',
      'Because half-wave rectifiers require thicker insulation',
      'Because full-wave bridges do not use transformers',
      'Because diodes have higher resistance in half-wave circuits',
    ],
    correctIndex: 0,
    explanation:
      'In a half-wave rectifier, current flows through the transformer secondary winding in only one direction for half the cycle. This creates a net DC magnetizing bias in the core, causing saturation, and the VA rating required for the transformer is much larger (TUF ≈ 0.286) compared to full-wave bridge (TUF ≈ 0.812).',
    topic: 'Transformer Utilization',
  },
  {
    id: 10,
    question: 'What effect does adding a shunt capacitor filter across the load have on the diode conduction angle?',
    options: [
      'It increases the diode conduction angle to 360°',
      'It reduces the diode conduction interval to narrow pulses near the voltage peak, increasing peak diode current',
      'It has no effect on diode conduction timing',
      'It causes diodes to conduct only during the negative half-cycle',
    ],
    correctIndex: 1,
    explanation:
      'With a capacitor filter, the capacitor charges to V_m and maintains a high voltage while discharging slowly through R. The diodes only conduct when the input AC voltage exceeds the capacitor voltage, which occurs only near the crest of the sinusoid. Consequently, the diode conduction angle becomes very narrow, resulting in large repetitive peak currents.',
    topic: 'Capacitive Filters',
  },
];
