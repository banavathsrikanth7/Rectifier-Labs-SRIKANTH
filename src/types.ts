export type PhaseType = 'single' | 'three';
export type TopologyType = 'half-wave' | 'full-bridge';
export type SwitchTechnology = 'diode' | 'thyristor' | 'semi-converter';
export type LoadType = 'R' | 'RL' | 'RL_FWD' | 'RLE' | 'RC';
export type ViewMode = 'superimposed' | 'channels' | 'harmonics' | 'phasor';

export interface CircuitParameters {
  phase: PhaseType;
  topology: TopologyType;
  switchTech: SwitchTechnology;
  individualSwitches: {
    s1: 'diode' | 'thyristor';
    s2: 'diode' | 'thyristor';
    s3: 'diode' | 'thyristor';
    s4: 'diode' | 'thyristor';
    s5?: 'diode' | 'thyristor';
    s6?: 'diode' | 'thyristor';
  };
  loadType: LoadType;
  vRms: number; // Volts RMS per phase (e.g. 230V)
  frequency: number; // Hz (e.g. 50Hz)
  firingAngle: number; // Degrees alpha (0 to 180)
  resistance: number; // Ohms R (1 to 200)
  inductance: number; // mH (0 to 500)
  backEmf: number; // Volts E (0 to 150)
  capacitance: number; // uF (0 to 1000)
  showFreewheelingDiode: boolean;
  filterCapacitorEnabled: boolean;
}

export interface InstantaneousState {
  angleDeg: number; // wt in degrees [0, 360)
  angleRad: number; // wt in radians
  timeMs: number; // time in ms
  vSource: number; // vs(wt) for single phase, or va(wt) for 3-phase
  vSourceB?: number; // vb(wt)
  vSourceC?: number; // vc(wt)
  vLineAB?: number; // vab(wt)
  vLineBC?: number; // vbc(wt)
  vLineCA?: number; // vca(wt)
  vOut: number; // vo(wt)
  iOut: number; // io(wt)
  iSource: number; // is(wt)
  vSwitch1: number; // voltage across D1/T1
  gatePulse1: boolean; // SCR 1 gate pulse active
  gatePulse2: boolean;
  gatePulse3: boolean;
  gatePulse4: boolean;
  gatePulse5: boolean;
  gatePulse6: boolean;
  activeSwitches: string[]; // e.g. ['D1', 'D2'] or ['T1', 'T6']
  activePathDescription: string;
  isFreewheeling: boolean;
}

export interface HarmonicComponent {
  order: number;
  frequency: number;
  magnitude: number;
  phaseDeg: number;
  percentageOfDc: number;
}

export interface PerformanceMetrics {
  vDc: number; // Average DC voltage
  vRmsOut: number; // RMS Output Voltage
  iDc: number; // Average DC current
  iRmsOut: number; // RMS Output current
  pDc: number; // DC output power
  pAc: number; // Total RMS power
  efficiency: number; // Rectification efficiency (%)
  formFactor: number; // FF = Vrms / Vdc
  rippleFactor: number; // RF = sqrt(FF^2 - 1)
  rippleFrequency: number; // Hz (e.g. 50, 100, 150, 300)
  thdVoltage: number; // THD (%)
  displacementPf: number; // cos(phi)
  inputPf: number; // Input Power Factor
  piv: number; // Peak Inverse Voltage across switch
  conductionAngle: number; // gamma in degrees
}

export interface ObservationRecord {
  id: string;
  timestamp: string;
  circuitName: string;
  alpha: number;
  loadDesc: string;
  vSourceRms: number;
  vDcTheoretical: number;
  vDcSimulated: number;
  vRmsSimulated: number;
  iDcSimulated: number;
  rippleFactor: number;
  thdPercent: number;
  efficiencyPercent: number;
}

export interface LabExperiment {
  id: string;
  title: string;
  subtitle: string;
  phase: PhaseType;
  topology: TopologyType;
  switchTech: SwitchTechnology;
  defaultLoad: LoadType;
  defaultAlpha: number;
  aim: string;
  apparatus: string[];
  theorySummary: string;
  procedureSteps: string[];
  keyFormulas: { label: string; formula: string; note: string }[];
  expectedConclusions: string[];
}

export interface VivaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}
