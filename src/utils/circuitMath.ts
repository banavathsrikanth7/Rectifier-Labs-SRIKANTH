import { CircuitParameters, InstantaneousState, PerformanceMetrics, HarmonicComponent } from '../types';

/**
 * Calculates the exact instantaneous state of the circuit at an electrical angle wt.
 * Angle wt is in radians.
 */
export function calculateInstantaneousState(
  angleRad: number,
  params: CircuitParameters
): InstantaneousState {
  // Normalize angle to [0, 2*PI)
  const twoPi = 2 * Math.PI;
  const wt = ((angleRad % twoPi) + twoPi) % twoPi;
  const wtDeg = (wt * 180) / Math.PI;
  const f = params.frequency;
  const timeMs = (wt / (2 * Math.PI * f)) * 1000;

  const Vm = params.vRms * Math.sqrt(2);
  const alphaRad = (params.firingAngle * Math.PI) / 180;
  const R = Math.max(0.1, params.resistance);
  const L = params.inductance / 1000; // Henry
  const omega = 2 * Math.PI * f;
  const Z = Math.sqrt(R * R + omega * L * omega * L);
  const phi = Math.atan2(omega * L, R); // Load impedance angle
  const E = params.backEmf;

  if (params.phase === 'single') {
    return calculateSinglePhaseState(wt, wtDeg, timeMs, Vm, alphaRad, R, L, Z, phi, E, params);
  } else {
    return calculateThreePhaseState(wt, wtDeg, timeMs, Vm, alphaRad, R, L, Z, phi, E, params);
  }
}

/**
 * Single-phase instantaneous calculation
 */
function calculateSinglePhaseState(
  wt: number,
  wtDeg: number,
  timeMs: number,
  Vm: number,
  alpha: number,
  R: number,
  L: number,
  Z: number,
  phi: number,
  E: number,
  params: CircuitParameters
): InstantaneousState {
  const f = params.frequency;
  const omega = 2 * Math.PI * f;
  const vSource = Vm * Math.sin(wt);
  let vOut = 0;
  let iOut = 0;
  let iSource = 0;
  let vSwitch1 = 0;
  const activeSwitches: string[] = [];
  let activePathDescription = 'OFF / Idling';
  let isFreewheeling = false;
  let gatePulse1 = false;
  let gatePulse2 = false;
  let gatePulse3 = false;
  let gatePulse4 = false;

  const pulseToleranceDeg = 4;
  const degDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

  // Check gate trigger markers
  if (params.switchTech === 'thyristor') {
    if (degDiff(wtDeg, params.firingAngle) < pulseToleranceDeg) gatePulse1 = true;
    if (params.topology === 'full-bridge') {
      if (degDiff(wtDeg, params.firingAngle) < pulseToleranceDeg) gatePulse2 = true;
      if (degDiff(wtDeg, (params.firingAngle + 180) % 360) < pulseToleranceDeg) {
        gatePulse3 = true;
        gatePulse4 = true;
      }
    }
  }

  const isRL = params.loadType === 'RL' || params.loadType === 'RL_FWD' || params.loadType === 'RLE';
  const hasFWD = params.loadType === 'RL_FWD' || params.showFreewheelingDiode;

  // Approximate extinction angle beta for RL load
  let beta = Math.PI;
  if (isRL && L > 0.005) {
    const extBeta = Math.PI + Math.min(Math.PI * 0.7, phi * 1.3);
    beta = Math.min(2 * Math.PI - 0.05, Math.max(Math.PI + 0.1, extBeta));
  }

  if (params.topology === 'half-wave') {
    if (params.switchTech === 'diode') {
      // 1-Phase Half-Wave Diode
      if (hasFWD && isRL) {
        if (wt >= 0 && wt < Math.PI) {
          vOut = Math.max(0, vSource);
          iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
          iSource = iOut;
          activeSwitches.push('D1');
          activePathDescription = 'Forward Conduction via Diode D1';
        } else {
          vOut = 0;
          isFreewheeling = true;
          const decay = Math.exp(-((wt - Math.PI) / (omega * L / R)));
          iOut = Math.max(0, ((Vm * 0.7 - E) / Z) * decay);
          iSource = 0;
          activeSwitches.push('D_FW');
          activePathDescription = 'Freewheeling via Diode D_FW';
        }
      } else if (isRL && L > 0.005) {
        if (wt >= 0 && wt < beta) {
          vOut = vSource; // Can go negative before beta!
          iOut = Math.max(0, (Vm / Z) * (Math.sin(wt - phi) + Math.sin(phi) * Math.exp(-wt / Math.tan(phi))) - E / R);
          iSource = iOut;
          activeSwitches.push('D1');
          activePathDescription = wt < Math.PI ? 'Forward Conduction via Diode D1' : 'Inductive Energy Release via D1 (Negative Vo)';
        } else {
          vOut = 0;
          iOut = 0;
          iSource = 0;
        }
      } else {
        // Pure R or RC
        if (wt >= 0 && wt < Math.PI) {
          vOut = Math.max(0, vSource);
          iOut = Math.max(0, (vOut - E) / R);
          iSource = iOut;
          activeSwitches.push('D1');
          activePathDescription = 'Forward Conduction via Diode D1';
        } else {
          vOut = 0;
          iOut = 0;
          iSource = 0;
        }
      }
      vSwitch1 = vSource - vOut;
    } else {
      // 1-Phase Half-Wave Thyristor
      const startAngle = alpha;
      const endAngle = isRL && !hasFWD ? Math.max(startAngle + 0.1, beta) : Math.PI;

      if (wt >= startAngle && wt < endAngle) {
        vOut = vSource;
        iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
        iSource = iOut;
        activeSwitches.push('T1');
        activePathDescription = wt < Math.PI ? 'Controlled Conduction via Thyristor T1' : 'Inductive Current via T1 (Negative Vo)';
      } else if (hasFWD && wt >= Math.PI && wt < Math.PI + alpha) {
        vOut = 0;
        isFreewheeling = true;
        iOut = Math.max(0, 0.5 * (Vm / (isRL ? Z : R)) * Math.exp(-((wt - Math.PI) / 1.5)));
        iSource = 0;
        activeSwitches.push('D_FW');
        activePathDescription = 'Freewheeling through D_FW';
      } else {
        vOut = 0;
        iOut = 0;
        iSource = 0;
      }
      vSwitch1 = vSource - vOut;
    }
  } else {
    // 1-Phase Full-Bridge
    if (params.switchTech === 'diode') {
      // Full-Bridge Diode
      if (wt >= 0 && wt < Math.PI) {
        vOut = vSource;
        activeSwitches.push('D1', 'D2');
        activePathDescription = 'Positive Half: Bridge Pair D1 + D2 Conducting';
        iSource = Math.max(0, (vOut - E) / (isRL ? Z : R));
        iOut = iSource;
      } else {
        vOut = -vSource;
        activeSwitches.push('D3', 'D4');
        activePathDescription = 'Negative Half: Bridge Pair D3 + D4 Conducting';
        iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
        iSource = -iOut;
      }
      vSwitch1 = wt < Math.PI ? 0 : 2 * vSource;
    } else {
      // Full-Bridge Thyristor or Semi-Converter
      const isSemi = params.switchTech === 'semi-converter' || (params.individualSwitches && (params.individualSwitches.s1 !== params.individualSwitches.s2));
      const firing1 = alpha;
      const firing2 = alpha + Math.PI;

      if (isSemi) {
        // 1-Phase Semi-Converter (Half-Controlled Bridge: T1, T3 SCRs + D2, D4 Diodes)
        // Free-wheels naturally via diodes at wt = pi and wt = 2*pi
        if (wt >= firing1 && wt < Math.PI) {
          vOut = vSource;
          activeSwitches.push('T1', 'D2');
          activePathDescription = 'Bridge Pair T1 + D2 (Positive Half)';
          iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
          iSource = iOut;
        } else if (wt >= Math.PI && wt < firing2) {
          vOut = 0;
          isFreewheeling = true;
          activeSwitches.push('D2', 'D4');
          activePathDescription = 'Freewheeling via Diode Pair D2 + D4 (Vo Clamped to 0)';
          iOut = Math.max(0.1, (0.65 * Vm) / (isRL ? Z : R));
          iSource = 0;
        } else if (wt >= firing2 && wt < 2 * Math.PI) {
          vOut = -vSource;
          activeSwitches.push('T3', 'D4');
          activePathDescription = 'Bridge Pair T3 + D4 (Negative Half)';
          iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
          iSource = -iOut;
        } else {
          vOut = 0;
          isFreewheeling = true;
          activeSwitches.push('D2', 'D4');
          activePathDescription = 'Freewheeling via Diode Pair D2 + D4 (Vo Clamped to 0)';
          iOut = Math.max(0.1, (0.65 * Vm) / (isRL ? Z : R));
          iSource = 0;
        }
      } else if (hasFWD) {
        // With Freewheeling Diode, Vo cannot be negative
        if (wt >= firing1 && wt < Math.PI) {
          vOut = vSource;
          activeSwitches.push('T1', 'T2');
          activePathDescription = 'Bridge Pair T1 + T2 Conducting';
          iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
          iSource = iOut;
        } else if (wt >= Math.PI && wt < firing2) {
          vOut = 0;
          isFreewheeling = true;
          activeSwitches.push('D_FW');
          activePathDescription = 'Freewheeling via D_FW (Vo Clamped to 0)';
          iOut = Math.max(0, (0.6 * Vm) / (isRL ? Z : R));
          iSource = 0;
        } else if (wt >= firing2 && wt < 2 * Math.PI) {
          vOut = -vSource;
          activeSwitches.push('T3', 'T4');
          activePathDescription = 'Bridge Pair T3 + T4 Conducting';
          iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
          iSource = -iOut;
        } else {
          vOut = 0;
          isFreewheeling = true;
          activeSwitches.push('D_FW');
          activePathDescription = 'Freewheeling via D_FW';
          iOut = Math.max(0, (0.6 * Vm) / (isRL ? Z : R));
          iSource = 0;
        }
      } else if (isRL && L > 0.005) {
        // Highly inductive load -> Continuous Conduction
        // T1, T2 conduct from alpha to alpha + pi (even into negative vs!)
        if (wt >= firing1 && wt < firing2) {
          vOut = vSource;
          activeSwitches.push('T1', 'T2');
          activePathDescription = wt < Math.PI 
            ? 'Bridge Pair T1 + T2 (Positive Half)' 
            : 'Energy Return: T1 + T2 Conducting into AC Line (-Vo)';
          iOut = Math.max(0.1, (Vm / Z) * Math.cos(alpha - phi) - E / R);
          iSource = iOut;
        } else {
          vOut = -vSource;
          activeSwitches.push('T3', 'T4');
          activePathDescription = wt < 2 * Math.PI 
            ? 'Bridge Pair T3 + T4 (Negative Half)' 
            : 'Energy Return: T3 + T4 Conducting into AC Line (-Vo)';
          iOut = Math.max(0.1, (Vm / Z) * Math.cos(alpha - phi) - E / R);
          iSource = -iOut;
        }
      } else {
        // Resistive or Discontinuous
        if (wt >= firing1 && wt < Math.PI) {
          vOut = vSource;
          activeSwitches.push('T1', 'T2');
          activePathDescription = 'Bridge Pair T1 + T2 (Positive Half)';
          iOut = Math.max(0, (vOut - E) / R);
          iSource = iOut;
        } else if (wt >= firing2 && wt < 2 * Math.PI) {
          vOut = -vSource;
          activeSwitches.push('T3', 'T4');
          activePathDescription = 'Bridge Pair T3 + T4 (Negative Half)';
          iOut = Math.max(0, (vOut - E) / R);
          iSource = -iOut;
        } else {
          vOut = 0;
          iOut = 0;
          iSource = 0;
        }
      }
      vSwitch1 = activeSwitches.includes('T1') ? 0 : vSource;
    }
  }

  // Capacitor smoothing approximation
  if (params.filterCapacitorEnabled && params.capacitance > 10) {
    const C = params.capacitance * 1e-6;
    const rippleAmp = iOut > 0 ? (iOut / (2 * f * C)) : 0;
    vOut = Math.max(vOut, Math.max(0, Vm * 0.94 - rippleAmp * (wt % Math.PI) / Math.PI));
  }

  return {
    angleDeg: wtDeg,
    angleRad: wt,
    timeMs,
    vSource,
    vOut,
    iOut: Math.max(0, iOut),
    iSource,
    vSwitch1,
    gatePulse1,
    gatePulse2,
    gatePulse3,
    gatePulse4,
    gatePulse5: false,
    gatePulse6: false,
    activeSwitches,
    activePathDescription,
    isFreewheeling,
  };
}

/**
 * Three-phase instantaneous calculation
 */
function calculateThreePhaseState(
  wt: number,
  wtDeg: number,
  timeMs: number,
  Vm: number,
  alpha: number,
  R: number,
  L: number,
  Z: number,
  phi: number,
  E: number,
  params: CircuitParameters
): InstantaneousState {
  const vA = Vm * Math.sin(wt);
  const vB = Vm * Math.sin(wt - (2 * Math.PI) / 3);
  const vC = Vm * Math.sin(wt - (4 * Math.PI) / 3);

  const vAB = vA - vB;
  const vBC = vB - vC;
  const vCA = vC - vA;

  let vOut = 0;
  let iOut = 0;
  let iSource = 0;
  let vSwitch1 = 0;
  const activeSwitches: string[] = [];
  let activePathDescription = 'OFF / Commutating';
  let isFreewheeling = false;

  let gatePulse1 = false;
  let gatePulse2 = false;
  let gatePulse3 = false;
  let gatePulse4 = false;
  let gatePulse5 = false;
  let gatePulse6 = false;

  const pulseToleranceDeg = 4;
  const degDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

  const isControlled = params.switchTech === 'thyristor';
  const isRL = params.loadType === 'RL' || params.loadType === 'RL_FWD' || params.loadType === 'RLE';

  if (params.topology === 'half-wave') {
    // 3-Phase Half-Wave (3-pulse)
    // Natural commutation happens at 30 deg (pi/6), 150 deg (5pi/6), 270 deg (9pi/6)
    const comm1 = Math.PI / 6 + (isControlled ? alpha : 0);
    const comm2 = (5 * Math.PI) / 6 + (isControlled ? alpha : 0);
    const comm3 = (9 * Math.PI) / 6 + (isControlled ? alpha : 0);

    // Gate pulses
    if (isControlled) {
      if (degDiff(wtDeg, (comm1 * 180) / Math.PI) < pulseToleranceDeg) gatePulse1 = true;
      if (degDiff(wtDeg, (comm2 * 180) / Math.PI) < pulseToleranceDeg) gatePulse2 = true;
      if (degDiff(wtDeg, (comm3 * 180) / Math.PI) < pulseToleranceDeg) gatePulse3 = true;
    }

    const normWt = (wt + 2 * Math.PI) % (2 * Math.PI);
    const end1 = comm2;
    const end2 = comm3;
    const end3 = comm1 + 2 * Math.PI;

    if (normWt >= comm1 && normWt < end1) {
      vOut = vA;
      activeSwitches.push(isControlled ? 'T1' : 'D1');
      activePathDescription = 'Phase A Conduction via ' + (isControlled ? 'Thyristor T1' : 'Diode D1');
      iSource = Math.max(0, (vOut - E) / (isRL ? Z : R));
      iOut = iSource;
    } else if (normWt >= comm2 && normWt < end2) {
      vOut = vB;
      activeSwitches.push(isControlled ? 'T2' : 'D2');
      activePathDescription = 'Phase B Conduction via ' + (isControlled ? 'Thyristor T2' : 'Diode D2');
      iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
      iSource = 0;
    } else {
      vOut = vC;
      activeSwitches.push(isControlled ? 'T3' : 'D3');
      activePathDescription = 'Phase C Conduction via ' + (isControlled ? 'Thyristor T3' : 'Diode D3');
      iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
      iSource = 0;
    }

    if (params.loadType === 'R' && vOut < 0) {
      vOut = 0;
      iOut = 0;
      activePathDescription = 'Discontinuous: Voltage at Zero';
    }
    vSwitch1 = vA - vOut;
  } else {
    // 3-Phase Full-Bridge (6-pulse Graetz Bridge)
    // 6 intervals per cycle (every 60 degrees / pi/3)
    // Line-to-line envelopes:
    // vAB = vA - vB
    // vAC = vA - vC
    // vBC = vB - vC
    // vBA = vB - vA
    // vCA = vC - vA
    // vCB = vC - vB
    // Standard firing sequence for 6-pulse bridge:
    // Natural commutation angles start at 60 deg + alpha:
    // Interval 1: T1 & T6 (vAB) [30° + alpha to 90° + alpha]
    // Interval 2: T1 & T2 (vAC) [90° + alpha to 150° + alpha]
    // Interval 3: T3 & T2 (vBC) [150° + alpha to 210° + alpha]
    // Interval 4: T3 & T4 (vBA) [210° + alpha to 270° + alpha]
    // Interval 5: T5 & T4 (vCA) [270° + alpha to 330° + alpha]
    // Interval 6: T5 & T6 (vCB) [330° + alpha to 390° + alpha]

    const shift = isControlled ? alpha : 0;
    const baseAngle = ((wt - shift) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const intervalIdx = Math.floor(((baseAngle - Math.PI / 6 + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 3));

    const sType = isControlled ? 'T' : 'D';

    switch (intervalIdx) {
      case 0:
        vOut = vAB;
        activeSwitches.push(`${sType}1`, `${sType}6`);
        activePathDescription = `Pair ${sType}1 & ${sType}6 Conducting (Line vAB)`;
        iSource = Math.max(0, (vOut - E) / (isRL ? Z : R));
        iOut = iSource;
        break;
      case 1:
        vOut = -vCA; // vAC
        activeSwitches.push(`${sType}1`, `${sType}2`);
        activePathDescription = `Pair ${sType}1 & ${sType}2 Conducting (Line vAC)`;
        iSource = Math.max(0, (vOut - E) / (isRL ? Z : R));
        iOut = iSource;
        break;
      case 2:
        vOut = vBC;
        activeSwitches.push(`${sType}3`, `${sType}2`);
        activePathDescription = `Pair ${sType}3 & ${sType}2 Conducting (Line vBC)`;
        iSource = 0;
        iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
        break;
      case 3:
        vOut = -vAB; // vBA
        activeSwitches.push(`${sType}3`, `${sType}4`);
        activePathDescription = `Pair ${sType}3 & ${sType}4 Conducting (Line vBA)`;
        iSource = -Math.max(0, (vOut - E) / (isRL ? Z : R));
        iOut = Math.abs(iSource);
        break;
      case 4:
        vOut = vCA;
        activeSwitches.push(`${sType}5`, `${sType}4`);
        activePathDescription = `Pair ${sType}5 & ${sType}4 Conducting (Line vCA)`;
        iSource = -Math.max(0, (vOut - E) / (isRL ? Z : R));
        iOut = Math.abs(iSource);
        break;
      case 5:
      default:
        vOut = -vBC; // vCB
        activeSwitches.push(`${sType}5`, `${sType}6`);
        activePathDescription = `Pair ${sType}5 & ${sType}6 Conducting (Line vCB)`;
        iSource = 0;
        iOut = Math.max(0, (vOut - E) / (isRL ? Z : R));
        break;
    }

    if (params.loadType === 'R' && vOut < 0) {
      vOut = 0;
      iOut = 0;
      activePathDescription = 'Discontinuous Conduction (Vo Clamped to 0)';
    }

    // SCR gate pulses
    if (isControlled) {
      for (let i = 0; i < 6; i++) {
        const fireAngleDeg = (30 + alpha + i * 60) % 360;
        if (degDiff(wtDeg, fireAngleDeg) < pulseToleranceDeg) {
          if (i === 0) gatePulse1 = true;
          if (i === 1) gatePulse2 = true;
          if (i === 2) gatePulse3 = true;
          if (i === 3) gatePulse4 = true;
          if (i === 4) gatePulse5 = true;
          if (i === 5) gatePulse6 = true;
        }
      }
    }

    vSwitch1 = activeSwitches.includes(`${sType}1`) ? 0 : vA - (vA - vOut);
  }

  return {
    angleDeg: wtDeg,
    angleRad: wt,
    timeMs,
    vSource: vA,
    vSourceB: vB,
    vSourceC: vC,
    vLineAB: vAB,
    vLineBC: vBC,
    vLineCA: vCA,
    vOut,
    iOut: Math.max(0, iOut),
    iSource,
    vSwitch1,
    gatePulse1,
    gatePulse2,
    gatePulse3,
    gatePulse4,
    gatePulse5,
    gatePulse6,
    activeSwitches,
    activePathDescription,
    isFreewheeling,
  };
}

/**
 * Generates an array of samples covering a number of electrical cycles for plotting.
 */
export function generateWaveformSeries(
  params: CircuitParameters,
  cycles: number = 1,
  sampleCount: number = 360
): {
  anglesDeg: number[];
  vSource: number[];
  vSourceB?: number[];
  vSourceC?: number[];
  vOut: number[];
  iOut: number[];
  iSource: number[];
  vSwitch: number[];
  states: InstantaneousState[];
} {
  const totalAngle = cycles * 2 * Math.PI;
  const step = totalAngle / sampleCount;

  const anglesDeg: number[] = [];
  const vSource: number[] = [];
  const vSourceB: number[] = [];
  const vSourceC: number[] = [];
  const vOut: number[] = [];
  const iOut: number[] = [];
  const iSource: number[] = [];
  const vSwitch: number[] = [];
  const states: InstantaneousState[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const angle = i * step;
    const st = calculateInstantaneousState(angle, params);

    anglesDeg.push((angle * 180) / Math.PI);
    vSource.push(st.vSource);
    if (params.phase === 'three') {
      vSourceB.push(st.vSourceB || 0);
      vSourceC.push(st.vSourceC || 0);
    }
    vOut.push(st.vOut);
    iOut.push(st.iOut);
    iSource.push(st.iSource);
    vSwitch.push(st.vSwitch1);
    states.push(st);
  }

  return {
    anglesDeg,
    vSource,
    vSourceB: params.phase === 'three' ? vSourceB : undefined,
    vSourceC: params.phase === 'three' ? vSourceC : undefined,
    vOut,
    iOut,
    iSource,
    vSwitch,
    states,
  };
}

/**
 * Calculates theoretical and simulated performance metrics:
 * Vdc, Vrms, Idc, Irms, Ripple Factor, Form Factor, THD, Efficiency, PIV
 */
export function calculatePerformanceMetrics(
  params: CircuitParameters
): PerformanceMetrics {
  const Vm = params.vRms * Math.sqrt(2);
  const alphaDeg = params.firingAngle;
  const alphaRad = (alphaDeg * Math.PI) / 180;
  const f = params.frequency;
  const R = Math.max(0.1, params.resistance);

  // Theoretical Vdc formulas
  let theoreticalVdc = 0;
  let theoreticalVrms = 0;
  let rippleFreq = f;
  let piv = Vm;

  if (params.phase === 'single') {
    if (params.topology === 'half-wave') {
      rippleFreq = f;
      piv = Vm;
      if (params.switchTech === 'diode') {
        theoreticalVdc = Vm / Math.PI;
        theoreticalVrms = Vm / 2;
      } else {
        // Thyristor half wave
        theoreticalVdc = (Vm / (2 * Math.PI)) * (1 + Math.cos(alphaRad));
        theoreticalVrms = (Vm / 2) * Math.sqrt(Math.max(0, 1 - alphaRad / Math.PI + Math.sin(2 * alphaRad) / (2 * Math.PI)));
      }
    } else {
      // Full bridge
      rippleFreq = 2 * f;
      piv = Vm;
      if (params.switchTech === 'diode') {
        theoreticalVdc = (2 * Vm) / Math.PI;
        theoreticalVrms = Vm / Math.sqrt(2);
      } else {
        // Thyristor full bridge
        if (params.loadType === 'RL' && !params.showFreewheelingDiode && params.inductance > 5) {
          // Continuous conduction
          theoreticalVdc = ((2 * Vm) / Math.PI) * Math.cos(alphaRad);
          theoreticalVrms = Vm / Math.sqrt(2);
        } else {
          theoreticalVdc = (Vm / Math.PI) * (1 + Math.cos(alphaRad));
          theoreticalVrms = Vm * Math.sqrt(Math.max(0, 0.5 - alphaRad / (2 * Math.PI) + Math.sin(2 * alphaRad) / (4 * Math.PI)));
        }
      }
    }
  } else {
    // Three phase
    const VmL = Math.sqrt(3) * Vm;
    if (params.topology === 'half-wave') {
      rippleFreq = 3 * f;
      piv = VmL;
      if (params.switchTech === 'diode') {
        theoreticalVdc = (3 * Math.sqrt(3) * Vm) / (2 * Math.PI);
        theoreticalVrms = Vm * Math.sqrt(3 / (2 * Math.PI) * (Math.PI / 3 + Math.sqrt(3) / 4));
      } else {
        // Controlled 3-pulse
        theoreticalVdc = ((3 * Math.sqrt(3) * Vm) / (2 * Math.PI)) * Math.cos(alphaRad);
        theoreticalVrms = theoreticalVdc * 1.05;
      }
    } else {
      // 6-pulse Graetz bridge
      rippleFreq = 6 * f;
      piv = VmL;
      if (params.switchTech === 'diode') {
        theoreticalVdc = (3 * VmL) / Math.PI; // = 3*sqrt(3)*Vm / pi = 1.35 * V_LL_rms
        theoreticalVrms = theoreticalVdc * 1.0008; // extremely low ripple
      } else {
        theoreticalVdc = ((3 * VmL) / Math.PI) * Math.cos(alphaRad);
        theoreticalVrms = Math.abs(theoreticalVdc) * 1.01;
      }
    }
  }

  // Numerical simulation integration for precise values
  const series = generateWaveformSeries(params, 1, 720);
  const N = series.vOut.length;
  let sumV = 0;
  let sumV2 = 0;
  let sumI = 0;
  let sumI2 = 0;

  for (let i = 0; i < N; i++) {
    const vo = series.vOut[i];
    const io = series.iOut[i];
    sumV += vo;
    sumV2 += vo * vo;
    sumI += io;
    sumI2 += io * io;
  }

  const simVdc = sumV / N;
  const simVrms = Math.sqrt(sumV2 / N);
  const simIdc = sumI / N;
  const simIrms = Math.sqrt(sumI2 / N);

  const pDc = simVdc * simIdc;
  const pAc = simVrms * simIrms;
  const efficiency = pAc > 0.001 ? Math.min(100, Math.max(0, (pDc / pAc) * 100)) : 0;
  const formFactor = Math.abs(simVdc) > 0.1 ? simVrms / Math.abs(simVdc) : 1;
  const rippleFactor = Math.sqrt(Math.max(0, formFactor * formFactor - 1));
  const thdVoltage = rippleFactor * 100;
  const displacementPf = Math.cos(alphaRad);
  const inputPf = Math.abs(displacementPf) / Math.sqrt(1 + (thdVoltage / 100) ** 2);

  return {
    vDc: simVdc,
    vRmsOut: simVrms,
    iDc: simIdc,
    iRmsOut: simIrms,
    pDc,
    pAc,
    efficiency,
    formFactor,
    rippleFactor,
    rippleFrequency: rippleFreq,
    thdVoltage,
    displacementPf,
    inputPf: isNaN(inputPf) ? 0.9 : Math.min(1, Math.max(0, inputPf)),
    piv,
    conductionAngle: 360 / (rippleFreq / f),
  };
}

/**
 * Discrete Fourier Transform (FFT) analysis on the output voltage waveform
 * Returns harmonic orders (DC, 1st, 2nd, 3rd, 4th, 5th, 6th, etc.) with magnitude and percentage
 */
export function computeHarmonics(
  seriesVOut: number[],
  baseFrequency: number
): HarmonicComponent[] {
  const N = seriesVOut.length;
  const harmonics: HarmonicComponent[] = [];
  const maxHarmonics = 12;

  // DC component
  let dcSum = 0;
  for (let i = 0; i < N; i++) {
    dcSum += seriesVOut[i];
  }
  const dcVal = Math.abs(dcSum / N);

  harmonics.push({
    order: 0,
    frequency: 0,
    magnitude: dcVal,
    phaseDeg: 0,
    percentageOfDc: 100,
  });

  for (let k = 1; k <= maxHarmonics; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += seriesVOut[n] * Math.cos(angle);
      imag -= seriesVOut[n] * Math.sin(angle);
    }
    real = (2 / N) * real;
    imag = (2 / N) * imag;
    const mag = Math.sqrt(real * real + imag * imag);
    const phase = (Math.atan2(imag, real) * 180) / Math.PI;

    harmonics.push({
      order: k,
      frequency: k * baseFrequency,
      magnitude: mag,
      phaseDeg: phase,
      percentageOfDc: dcVal > 0.1 ? (mag / dcVal) * 100 : 0,
    });
  }

  return harmonics;
}

/**
 * Computes Fourier decomposition specifically for the AC line source current i_s(t)
 * Returns fundamental and odd harmonics (h=1, 3, 5, 7, 9, 11, 13, 15...)
 */
export function computeCurrentHarmonics(
  seriesIS: number[],
  baseFrequency: number
): HarmonicComponent[] {
  const N = seriesIS.length;
  const harmonics: HarmonicComponent[] = [];
  const oddOrders = [1, 3, 5, 7, 9, 11, 13, 15];

  // Fundamental magnitude
  let fundMag = 0;

  oddOrders.forEach((k) => {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += seriesIS[n] * Math.cos(angle);
      imag -= seriesIS[n] * Math.sin(angle);
    }
    real = (2 / N) * real;
    imag = (2 / N) * imag;
    const mag = Math.sqrt(real * real + imag * imag);
    const phase = (Math.atan2(imag, real) * 180) / Math.PI;

    if (k === 1) fundMag = mag;

    const pct = fundMag > 0.001 ? (mag / fundMag) * 100 : k === 1 ? 100 : 100 / k;

    harmonics.push({
      order: k,
      frequency: k * baseFrequency,
      magnitude: mag,
      phaseDeg: phase,
      percentageOfDc: Math.min(100, pct),
    });
  });

  return harmonics;
}

export interface AnalyticalFormulaInfo {
  title: string;
  formula: string;
  derivationDisplay: string;
  theoreticalVdc: number;
  simulatedVdc: number;
  mode: string;
}

/**
 * Generates the analytical formula display corresponding to the exact current circuit setup,
 * matching the formula banner shown in the IIT Kharagpur virtual lab video!
 */
export function getAnalyticalFormulaDetails(
  params: CircuitParameters,
  metrics: PerformanceMetrics
): AnalyticalFormulaInfo {
  const Vm = params.vRms * Math.sqrt(2);
  const alphaDeg = params.firingAngle;
  const alphaRad = (alphaDeg * Math.PI) / 180;
  const isSemi = params.switchTech === 'semi-converter' || (params.individualSwitches && (params.individualSwitches.s1 !== params.individualSwitches.s2));

  if (params.phase === 'single') {
    if (params.topology === 'full-bridge') {
      if (isSemi || params.showFreewheelingDiode) {
        const val = (Vm / Math.PI) * (1 + Math.cos(alphaRad));
        return {
          title: '1-Phase Semi-Converter (Half-Controlled Bridge / with FWD) - Analytical DC Voltage Equation',
          formula: 'V_dc = (V_m / π) · (1 + cos α) = (√2·V_ac / π) · (1 + cos α)',
          derivationDisplay: `(√2 · ${params.vRms} / π) · (1 + cos ${alphaDeg}°) = ${val.toFixed(1)} V`,
          theoreticalVdc: val,
          simulatedVdc: metrics.vDc,
          mode: params.inductance > 10 ? 'CCM Mode' : 'DCM Mode',
        };
      } else if (params.switchTech === 'diode') {
        const val = (2 * Vm) / Math.PI;
        return {
          title: '1-Phase Full-Wave Diode Bridge (Uncontrolled) - Analytical DC Voltage Equation',
          formula: 'V_dc = (2·V_m / π) = (2√2·V_ac / π)',
          derivationDisplay: `(2 · √2 · ${params.vRms} / π) = ${val.toFixed(1)} V`,
          theoreticalVdc: val,
          simulatedVdc: metrics.vDc,
          mode: 'Continuous',
        };
      } else {
        // Fully controlled bridge
        const isCont = params.loadType === 'RL' && params.inductance > 5;
        const val = isCont ? ((2 * Vm) / Math.PI) * Math.cos(alphaRad) : (Vm / Math.PI) * (1 + Math.cos(alphaRad));
        return {
          title: '1-Phase Fully-Controlled Bridge Converter - Analytical DC Voltage Equation',
          formula: isCont ? 'V_dc = (2·V_m / π) · cos α = (2√2·V_ac / π) · cos α' : 'V_dc = (V_m / π) · (1 + cos α)',
          derivationDisplay: isCont
            ? `(2 · √2 · ${params.vRms} / π) · cos ${alphaDeg}° = ${val.toFixed(1)} V`
            : `(√2 · ${params.vRms} / π) · (1 + cos ${alphaDeg}°) = ${val.toFixed(1)} V`,
          theoreticalVdc: val,
          simulatedVdc: metrics.vDc,
          mode: isCont ? 'CCM (Continuous)' : 'DCM (Discontinuous)',
        };
      }
    } else {
      // Half-Wave single phase
      const val = params.switchTech === 'diode'
        ? Vm / Math.PI
        : (Vm / (2 * Math.PI)) * (1 + Math.cos(alphaRad));
      return {
        title: `1-Phase Half-Wave ${params.switchTech === 'diode' ? 'Diode' : 'Controlled'} Converter - Analytical DC Voltage Equation`,
        formula: params.switchTech === 'diode' ? 'V_dc = V_m / π = (√2·V_ac / π)' : 'V_dc = (V_m / 2π) · (1 + cos α)',
        derivationDisplay: `(${Vm.toFixed(1)} / 2π) · (1 + cos ${alphaDeg}°) = ${val.toFixed(1)} V`,
        theoreticalVdc: val,
        simulatedVdc: metrics.vDc,
        mode: '1-Pulse',
      };
    }
  } else {
    // Three-Phase
    const VmL = Math.sqrt(3) * Vm;
    if (params.topology === 'full-bridge') {
      const val = params.switchTech === 'diode'
        ? (3 * VmL) / Math.PI
        : ((3 * VmL) / Math.PI) * Math.cos(alphaRad);
      return {
        title: `3-Phase 6-Pulse ${params.switchTech === 'diode' ? 'Diode Bridge' : 'Fully-Controlled Converter'} - Analytical DC Voltage Equation`,
        formula: 'V_dc = (3·V_mL / π) · cos α = (3√3·V_m / π) · cos α',
        derivationDisplay: `(3 · √3 · ${Vm.toFixed(1)} / π) · cos ${alphaDeg}° = ${val.toFixed(1)} V`,
        theoreticalVdc: val,
        simulatedVdc: metrics.vDc,
        mode: '6-Pulse Graetz',
      };
    } else {
      // 3-Phase Half-Wave
      const val = ((3 * Math.sqrt(3) * Vm) / (2 * Math.PI)) * Math.cos(alphaRad);
      return {
        title: '3-Phase Half-Wave Controlled Converter - Analytical DC Voltage Equation',
        formula: 'V_dc = (3√3·V_m / 2π) · cos α',
        derivationDisplay: `(3 · √3 · ${Vm.toFixed(1)} / 2π) · cos ${alphaDeg}° = ${val.toFixed(1)} V`,
        theoreticalVdc: val,
        simulatedVdc: metrics.vDc,
        mode: '3-Pulse',
      };
    }
  }
}

