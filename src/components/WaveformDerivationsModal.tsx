import React, { useState } from 'react';
import { CircuitParameters } from '../types';
import { X, BookOpen, Calculator, Check, ArrowRight } from 'lucide-react';

interface WaveformDerivationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: CircuitParameters;
}

export const WaveformDerivationsModal: React.FC<WaveformDerivationsModalProps> = ({
  isOpen,
  onClose,
  params,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'calculator'>('current');
  const [calcVm, setCalcVm] = useState<number>(Math.round(params.vRms * Math.sqrt(2)));
  const [calcAlpha, setCalcAlpha] = useState<number>(params.firingAngle);

  if (!isOpen) return null;

  const Vm = params.vRms * Math.sqrt(2);
  const alphaDeg = params.firingAngle;
  const alphaRad = (alphaDeg * Math.PI) / 180;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Waveform Analysis & Mathematical Derivations
              </h2>
              <p className="text-xs text-slate-400">
                Analytical integration, Fourier series, and performance equations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'current'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active Topology
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Topologies
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === 'calculator'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Interactive Solver
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {activeTab === 'current' && (
            <CurrentTopologyDerivation params={params} Vm={Vm} alphaDeg={alphaDeg} alphaRad={alphaRad} />
          )}

          {activeTab === 'all' && <AllTopologiesDerivation />}

          {activeTab === 'calculator' && (
            <InteractiveSolver
              calcVm={calcVm}
              setCalcVm={setCalcVm}
              calcAlpha={calcAlpha}
              setCalcAlpha={setCalcAlpha}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <span>IIT Kharagpur Power Electronics Experimental Curriculum Reference</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   CURRENT TOPOLOGY DERIVATION
   ------------------------------------------------------------- */
const CurrentTopologyDerivation: React.FC<{
  params: CircuitParameters;
  Vm: number;
  alphaDeg: number;
  alphaRad: number;
}> = ({ params, Vm, alphaDeg, alphaRad }) => {
  const isThree = params.phase === 'three';
  const isBridge = params.topology === 'full-bridge';
  const isThyristor = params.switchTech === 'thyristor';

  return (
    <div className="space-y-6">
      {/* Current Configuration Summary */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400">Configured Circuit:</span>
          <h3 className="text-base font-bold text-amber-400">
            {params.phase.toUpperCase()}-PHASE {params.topology.toUpperCase()}{' '}
            {params.switchTech === 'thyristor' ? 'CONTROLLED CONVERTER (SCR)' : 'UNCONTROLLED DIODE RECTIFIER'}
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500">V_rms: </span>
            <strong className="text-cyan-400">{params.vRms} V</strong>
          </div>
          <div>
            <span className="text-slate-500">V_m: </span>
            <strong className="text-cyan-400">{Vm.toFixed(1)} V</strong>
          </div>
          {isThyristor && (
            <div>
              <span className="text-slate-500">Firing α: </span>
              <strong className="text-amber-400">{alphaDeg}°</strong>
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Derivation */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          1. Average Output DC Voltage (V_dc) Derivation
        </h4>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-3">
          <p className="text-slate-400">
            By definition, the average DC value over time period T (or angle 2π) is given by:
          </p>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
            V_dc = (1 / T) · ∫ v_o(ωt) d(ωt)
          </div>

          {!isThree && !isBridge ? (
            /* 1-Phase Half Wave */
            <>
              <p className="text-slate-400">
                For a single-phase half-wave converter, conduction interval is from {isThyristor ? 'α to π' : '0 to π'}:
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                V_dc = (1 / 2π) · ∫_{'{' + (isThyristor ? 'α' : '0') + '}'}^{'π'} V_m · sin(ωt) d(ωt)
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                = (V_m / 2π) · [ -cos(ωt) ]_{'{' + (isThyristor ? 'α' : '0') + '}'}^{'π'}
                <br />
                = (V_m / 2π) · [ -cos(π) - (-cos({isThyristor ? 'α' : '0'})) ]
                <br />
                = (V_m / 2π) · [ 1 + cos({isThyristor ? 'α' : '0'}) ]
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                V_dc = {isThyristor ? `(V_m / 2π) · (1 + cos α) = (${Vm.toFixed(1)} / 6.283) · (1 + cos ${alphaDeg}°) = ${((Vm / (2 * Math.PI)) * (1 + Math.cos(alphaRad))).toFixed(1)} V` : `V_m / π = ${Vm.toFixed(1)} / 3.1416 = ${(Vm / Math.PI).toFixed(1)} V`}
              </div>
            </>
          ) : !isThree && isBridge ? (
            /* 1-Phase Full Bridge */
            <>
              <p className="text-slate-400">
                For a single-phase full-wave bridge with period π (two pulses per 2π cycle):
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                {isThyristor && params.loadType === 'RL' && !params.showFreewheelingDiode
                  ? 'V_dc = (1 / π) · ∫_{α}^{π + α} V_m · sin(ωt) d(ωt)  (Continuous Conduction)'
                  : 'V_dc = (1 / π) · ∫_{α}^{π} V_m · sin(ωt) d(ωt)  (Resistive / FWD clamped)'}
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {isThyristor && params.loadType === 'RL' && !params.showFreewheelingDiode ? (
                  <>
                    = (V_m / π) · [ -cos(π + α) + cos(α) ]
                    <br />
                    = (V_m / π) · [ cos(α) + cos(α) ] = (2 · V_m / π) · cos(α)
                  </>
                ) : (
                  <>
                    = (V_m / π) · [ -cos(π) + cos(α) ] = (V_m / π) · [ 1 + cos(α) ]
                  </>
                )}
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                {isThyristor && params.loadType === 'RL' && !params.showFreewheelingDiode
                  ? `V_dc = (2 · V_m / π) · cos α = (2 · ${Vm.toFixed(1)} / 3.1416) · cos ${alphaDeg}° = ${(((2 * Vm) / Math.PI) * Math.cos(alphaRad)).toFixed(1)} V`
                  : isThyristor
                  ? `V_dc = (V_m / π) · (1 + cos α) = (${Vm.toFixed(1)} / 3.1416) · (1 + cos ${alphaDeg}°) = ${((Vm / Math.PI) * (1 + Math.cos(alphaRad))).toFixed(1)} V`
                  : `V_dc = 2 · V_m / π = (2 · ${Vm.toFixed(1)}) / 3.1416 = ${((2 * Vm) / Math.PI).toFixed(1)} V`}
              </div>
            </>
          ) : isThree && !isBridge ? (
            /* 3-Phase Half Wave */
            <>
              <p className="text-slate-400">
                For a 3-phase half-wave converter (3 pulses per 2π cycle, period = 2π/3):
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                V_dc = (3 / 2π) · ∫_{'{π/6 + α}'}^{'{5π/6 + α}'} V_m · sin(ωt) d(ωt)
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                V_dc = (3√3 · V_m / 2π) · cos α = (3 · 1.732 · {Vm.toFixed(1)} / 6.283) · cos {alphaDeg}° = {(((3 * Math.sqrt(3) * Vm) / (2 * Math.PI)) * Math.cos(alphaRad)).toFixed(1)} V
              </div>
            </>
          ) : (
            /* 3-Phase 6-Pulse Bridge */
            <>
              <p className="text-slate-400">
                For a 3-phase 6-pulse bridge (period = π/3, peak line-to-line voltage V_mL = √3 · V_m):
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                V_dc = (3 / π) · ∫_{'{π/3 + α}'}^{'{2π/3 + α}'} √3 · V_m · sin(ωt) d(ωt)
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                V_dc = (3 · √3 · V_m / π) · cos α = (3 · 1.732 · {Vm.toFixed(1)} / 3.1416) · cos {alphaDeg}° = {(((3 * Math.sqrt(3) * Vm) / Math.PI) * Math.cos(alphaRad)).toFixed(1)} V
              </div>
            </>
          )}
        </div>

        {/* RMS and Ripple Metrics */}
        <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs pt-2">
          2. RMS Output Voltage & Ripple Factor
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-sans font-semibold text-xs">Form Factor (FF)</span>
            <p className="text-cyan-300">FF = V_rms / V_dc</p>
            <p className="text-slate-500 text-[11px]">
              Measures the deviation of rectified waveform shape from ideal flat DC.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-sans font-semibold text-xs">Ripple Factor (RF)</span>
            <p className="text-cyan-300">RF = √(FF² - 1) = V_ac,rms / V_dc</p>
            <p className="text-slate-500 text-[11px]">
              Ratio of AC ripple component to the desired DC component.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   ALL TOPOLOGIES COMPARISON DERIVATION
   ------------------------------------------------------------- */
const AllTopologiesDerivation: React.FC = () => {
  const tableData = [
    {
      name: '1-Phase Half-Wave Diode',
      vdc: 'V_m / π ≈ 0.318 V_m',
      vrms: 'V_m / 2 = 0.5 V_m',
      rf: '1.21 (121%)',
      eff: '40.6%',
      piv: 'V_m',
      rippleFreq: 'f (50 Hz)',
    },
    {
      name: '1-Phase Full-Bridge Diode',
      vdc: '2 · V_m / π ≈ 0.636 V_m',
      vrms: 'V_m / √2 ≈ 0.707 V_m',
      rf: '0.482 (48.2%)',
      eff: '81.2%',
      piv: 'V_m',
      rippleFreq: '2f (100 Hz)',
    },
    {
      name: '1-Phase Half-Wave Controlled',
      vdc: '(V_m / 2π) · (1 + cos α)',
      vrms: '(V_m / 2) · √(1 - α/π + sin 2α / 2π)',
      rf: 'Varies with α',
      eff: '≤ 40.6%',
      piv: 'V_m',
      rippleFreq: 'f (50 Hz)',
    },
    {
      name: '1-Phase Full-Bridge Controlled (RL continuous)',
      vdc: '(2 · V_m / π) · cos α',
      vrms: 'V_m / √2',
      rf: 'Varies with α',
      eff: '≤ 81.2%',
      piv: 'V_m',
      rippleFreq: '2f (100 Hz)',
    },
    {
      name: '3-Phase Half-Wave Diode (3-Pulse)',
      vdc: '(3√3 · V_m / 2π) ≈ 0.827 V_m',
      vrms: '0.840 · V_m',
      rf: '0.17 (17%)',
      eff: '96.5%',
      piv: '√3 · V_m',
      rippleFreq: '3f (150 Hz)',
    },
    {
      name: '3-Phase 6-Pulse Bridge Diode',
      vdc: '(3 · V_mL / π) ≈ 1.654 V_m',
      vrms: '1.655 · V_m',
      rf: '0.042 (4.2%)',
      eff: '99.8%',
      piv: '√3 · V_m',
      rippleFreq: '6f (300 Hz)',
    },
    {
      name: '3-Phase 6-Pulse Controlled (Graetz)',
      vdc: '(3 · V_mL / π) · cos α',
      vrms: '1.655 · V_m',
      rf: 'Varies with α',
      eff: '≤ 99.8%',
      piv: '√3 · V_m',
      rippleFreq: '6f (300 Hz)',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">
        Master Summary: Comparative Rectifier Performance Matrix
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs text-left font-mono">
          <thead className="bg-slate-950 text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Topology</th>
              <th className="py-2.5 px-3">Average V_dc</th>
              <th className="py-2.5 px-3">RMS V_rms</th>
              <th className="py-2.5 px-3">Ripple Factor</th>
              <th className="py-2.5 px-3">Max Eff (η)</th>
              <th className="py-2.5 px-3">PIV Rating</th>
              <th className="py-2.5 px-3">Ripple Freq</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-slate-200 font-sans">{row.name}</td>
                <td className="py-2.5 px-3 text-cyan-400">{row.vdc}</td>
                <td className="py-2.5 px-3 text-emerald-400">{row.vrms}</td>
                <td className="py-2.5 px-3 text-amber-400">{row.rf}</td>
                <td className="py-2.5 px-3 text-purple-400">{row.eff}</td>
                <td className="py-2.5 px-3 text-rose-400">{row.piv}</td>
                <td className="py-2.5 px-3 text-slate-400">{row.rippleFreq}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   INTERACTIVE DERIVATION SOLVER
   ------------------------------------------------------------- */
const InteractiveSolver: React.FC<{
  calcVm: number;
  setCalcVm: (v: number) => void;
  calcAlpha: number;
  setCalcAlpha: (a: number) => void;
}> = ({ calcVm, setCalcVm, calcAlpha, setCalcAlpha }) => {
  const alphaRad = (calcAlpha * Math.PI) / 180;
  const cosAlpha = Math.cos(alphaRad);

  const res1PhHalf = (calcVm / (2 * Math.PI)) * (1 + cosAlpha);
  const res1PhFullCont = ((2 * calcVm) / Math.PI) * cosAlpha;
  const res1PhFullRes = (calcVm / Math.PI) * (1 + cosAlpha);
  const res3PhHalf = ((3 * Math.sqrt(3) * calcVm) / (2 * Math.PI)) * cosAlpha;
  const res3PhFull = ((3 * Math.sqrt(3) * calcVm) / Math.PI) * cosAlpha;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-amber-400">
          Real-Time Parameter Solver
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Peak Voltage V_m (V):</label>
            <input
              type="number"
              value={calcVm}
              onChange={(e) => setCalcVm(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Firing Angle α (Degrees):</label>
            <input
              type="range"
              min="0"
              max="180"
              value={calcAlpha}
              onChange={(e) => setCalcAlpha(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between font-mono text-xs text-amber-400">
              <span>Current: {calcAlpha}°</span>
              <span>cos({calcAlpha}°) = {cosAlpha.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 font-sans block text-xs">1-Phase Half-Wave Controlled:</span>
          <span className="text-base font-bold text-cyan-400 mt-1 block">
            V_dc = {res1PhHalf.toFixed(2)} V
          </span>
          <span className="text-slate-500 text-[10px] block mt-0.5">
            Formula: (Vm / 2π) · (1 + cos α)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 font-sans block text-xs">1-Phase Full-Bridge (Continuous RL):</span>
          <span className={`text-base font-bold mt-1 block ${res1PhFullCont >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            V_dc = {res1PhFullCont.toFixed(2)} V {res1PhFullCont < 0 && '(Inversion Mode!)'}
          </span>
          <span className="text-slate-500 text-[10px] block mt-0.5">
            Formula: (2Vm / π) · cos α
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 font-sans block text-xs">3-Phase Half-Wave (3-Pulse):</span>
          <span className="text-base font-bold text-amber-400 mt-1 block">
            V_dc = {res3PhHalf.toFixed(2)} V
          </span>
          <span className="text-slate-500 text-[10px] block mt-0.5">
            Formula: (3√3 Vm / 2π) · cos α
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 font-sans block text-xs">3-Phase 6-Pulse Graetz Bridge:</span>
          <span className={`text-base font-bold mt-1 block ${res3PhFull >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            V_dc = {res3PhFull.toFixed(2)} V {res3PhFull < 0 && '(Inversion Mode!)'}
          </span>
          <span className="text-slate-500 text-[10px] block mt-0.5">
            Formula: (3√3 Vm / π) · cos α
          </span>
        </div>
      </div>
    </div>
  );
};
