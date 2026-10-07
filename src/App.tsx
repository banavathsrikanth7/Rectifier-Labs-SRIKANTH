import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CircuitParameters, InstantaneousState, ObservationRecord, LabExperiment } from './types';
import { calculateInstantaneousState, calculatePerformanceMetrics } from './utils/circuitMath';
import { Header } from './components/Header';
import { CircuitSchematic } from './components/CircuitSchematic';
import { WaveformOscilloscope } from './components/WaveformOscilloscope';
import { PlaybackEngine } from './components/PlaybackEngine';
import { ControlDeck } from './components/ControlDeck';
import { PerformanceMetricsBar } from './components/PerformanceMetricsBar';
import { WaveformDerivationsModal } from './components/WaveformDerivationsModal';
import { VirtualLabManual } from './components/VirtualLabManual';

const INITIAL_PARAMS: CircuitParameters = {
  phase: 'single',
  topology: 'full-bridge',
  switchTech: 'semi-converter',
  individualSwitches: {
    s1: 'diode',
    s2: 'thyristor',
    s3: 'thyristor',
    s4: 'thyristor',
    s5: 'thyristor',
    s6: 'thyristor',
  },
  loadType: 'RL',
  vRms: 230,
  frequency: 50,
  firingAngle: 45,
  resistance: 20,
  inductance: 45,
  backEmf: 0,
  capacitance: 0,
  showFreewheelingDiode: false,
  filterCapacitorEnabled: false,
};

export default function App() {
  const [params, setParams] = useState<CircuitParameters>(INITIAL_PARAMS);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [angleDeg, setAngleDeg] = useState<number>(45.0);
  const [speed, setSpeed] = useState<number>(0.25);
  const [cycles, setCycles] = useState<number>(1);
  const [isDerivationsOpen, setIsDerivationsOpen] = useState<boolean>(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [observations, setObservations] = useState<ObservationRecord[]>([]);

  const isDark = theme === 'dark';

  // Calculate live instantaneous state at current angle wt
  const angleRad = (angleDeg * Math.PI) / 180;
  const state: InstantaneousState = useMemo(
    () => calculateInstantaneousState(angleRad, params),
    [angleRad, params]
  );

  // Performance metrics
  const metrics = useMemo(() => calculatePerformanceMetrics(params), [params]);

  // Animation frame loop for continuous smooth angle advancement
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const animate = (time: number) => {
      if (lastTimeRef.current !== null && isRunning) {
        const dt = (time - lastTimeRef.current) / 1000;
        const baseSpeedDegPerSec = 45;
        const deltaAngle = baseSpeedDegPerSec * speed * dt;
        setAngleDeg((prev) => (prev + deltaAngle) % 360);
      }
      lastTimeRef.current = time;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, speed]);

  // Update circuit parameters
  const handleUpdateParams = useCallback((newParams: Partial<CircuitParameters>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Toggle individual switch between diode and thyristor
  const handleToggleIndividualSwitch = useCallback((switchKey: 's1' | 's2' | 's3' | 's4' | 's5' | 's6') => {
    setParams((prev) => {
      const current = prev.individualSwitches[switchKey] || 'thyristor';
      const next = current === 'diode' ? 'thyristor' : 'diode';
      const updatedSwitches = {
        ...prev.individualSwitches,
        [switchKey]: next,
      };

      const allD = Object.values(updatedSwitches).every((v) => v === 'diode');
      const allT = Object.values(updatedSwitches).every((v) => v === 'thyristor');
      const tech = allD ? 'diode' : allT ? 'thyristor' : 'semi-converter';

      return {
        ...prev,
        switchTech: tech,
        individualSwitches: updatedSwitches,
      };
    });
  }, []);

  // Quick Device Setups
  const handleSetQuickDevice = useCallback((type: 'all-diodes' | 'all-thyristors' | 'semi-conv') => {
    if (type === 'all-diodes') {
      setParams((prev) => ({
        ...prev,
        switchTech: 'diode',
        individualSwitches: {
          s1: 'diode',
          s2: 'diode',
          s3: 'diode',
          s4: 'diode',
          s5: 'diode',
          s6: 'diode',
        },
      }));
    } else if (type === 'all-thyristors') {
      setParams((prev) => ({
        ...prev,
        switchTech: 'thyristor',
        individualSwitches: {
          s1: 'thyristor',
          s2: 'thyristor',
          s3: 'thyristor',
          s4: 'thyristor',
          s5: 'thyristor',
          s6: 'thyristor',
        },
      }));
    } else {
      setParams((prev) => ({
        ...prev,
        switchTech: 'semi-converter',
        individualSwitches: {
          s1: 'diode',
          s2: 'thyristor',
          s3: 'thyristor',
          s4: 'diode',
          s5: 'thyristor',
          s6: 'diode',
        },
      }));
    }
  }, []);

  // Step angle manually
  const handleStepAngle = useCallback((delta: number) => {
    setIsRunning(false);
    setAngleDeg((prev) => ((prev + delta) % 360 + 360) % 360);
  }, []);

  // Reset angle
  const handleResetAngle = useCallback(() => {
    setAngleDeg(0);
  }, []);

  // Full Screen toggle
  const handleToggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  }, []);

  // Reset all to default
  const handleResetAll = useCallback(() => {
    setParams(INITIAL_PARAMS);
    setAngleDeg(45.0);
    setIsRunning(true);
    setSpeed(0.25);
  }, []);

  // Load experiment preset
  const handleApplyExperiment = useCallback((exp: LabExperiment) => {
    setParams({
      phase: exp.phase,
      topology: exp.topology,
      switchTech: exp.switchTech,
      individualSwitches: {
        s1: exp.switchTech === 'diode' ? 'diode' : 'thyristor',
        s2: exp.switchTech === 'diode' ? 'diode' : 'thyristor',
        s3: exp.switchTech === 'diode' ? 'diode' : 'thyristor',
        s4: exp.switchTech === 'diode' ? 'diode' : 'thyristor',
        s5: exp.switchTech === 'diode' ? 'diode' : 'thyristor',
        s6: exp.switchTech === 'diode' ? 'diode' : 'thyristor',
      },
      loadType: exp.defaultLoad,
      vRms: exp.phase === 'three' ? 240 : 230,
      frequency: 50,
      firingAngle: exp.defaultAlpha,
      resistance: 20,
      inductance: exp.defaultLoad === 'RL' || exp.defaultLoad === 'RL_FWD' ? 45 : 0,
      backEmf: 0,
      capacitance: 0,
      showFreewheelingDiode: exp.defaultLoad === 'RL_FWD',
      filterCapacitorEnabled: false,
    });
    setAngleDeg(0);
  }, []);

  // Add observation record
  const handleAddObservation = useCallback(() => {
    const Vm = params.vRms * Math.sqrt(2);
    let theorVdc = (Vm / Math.PI) * (1 + Math.cos((params.firingAngle * Math.PI) / 180));

    const newRecord: ObservationRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      circuitName: `${params.phase.toUpperCase()}-PH ${params.topology.toUpperCase()} (${params.switchTech.toUpperCase()})`,
      alpha: params.firingAngle,
      loadDesc: `${params.loadType} (R=${params.resistance}Ω, L=${params.inductance}mH)`,
      vSourceRms: params.vRms,
      vDcTheoretical: theorVdc,
      vDcSimulated: metrics.vDc,
      vRmsSimulated: metrics.vRmsOut,
      iDcSimulated: metrics.iDc,
      rippleFactor: metrics.rippleFactor,
      thdPercent: metrics.thdVoltage,
      efficiencyPercent: metrics.efficiency,
    };

    setObservations((prev) => [newRecord, ...prev]);
  }, [params, metrics]);

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-[#040711] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
      } flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-200`}
    >
      {/* Top Header matching video layout with student name & theme toggle */}
      <Header
        onOpenDerivations={() => setIsDerivationsOpen(true)}
        onOpenTheory={() => setIsTheoryOpen(true)}
        onApplyExperiment={handleApplyExperiment}
        onResetAll={handleResetAll}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        isFullScreen={isFullScreen}
        onToggleFullScreen={handleToggleFullScreen}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Row 1: Circuit Schematic Diagram (Left) + Waveform Oscilloscope (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column: Circuit Schematic Diagram (5 cols) */}
          <div className="lg:col-span-5 h-full min-h-[490px]">
            <CircuitSchematic
              params={params}
              state={state}
              onUpdateParams={handleUpdateParams}
              onToggleIndividualSwitch={handleToggleIndividualSwitch}
              isRunning={isRunning}
              theme={theme}
            />
          </div>

          {/* Right Column: Waveform Oscilloscope (7 cols) */}
          <div className="lg:col-span-7 h-full min-h-[490px]">
            <WaveformOscilloscope
              params={params}
              state={state}
              cycles={cycles}
              onCyclesChange={setCycles}
              onAngleChange={setAngleDeg}
              isRunning={isRunning}
              theme={theme}
            />
          </div>
        </div>

        {/* Row 2: Playback Simulation Controls with Slower Speeds & Angle Scrubber */}
        <PlaybackEngine
          isRunning={isRunning}
          onTogglePlay={() => setIsRunning(!isRunning)}
          speed={speed}
          onSpeedChange={setSpeed}
          angleDeg={angleDeg}
          onAngleChange={setAngleDeg}
          onStep={handleStepAngle}
          onReset={handleResetAngle}
          firingAngle={params.firingAngle}
          theme={theme}
        />

        {/* Row 3: Parameter Deck: Topologies, Firing Angle Slider, Load Configurations */}
        <ControlDeck
          params={params}
          onUpdateParams={handleUpdateParams}
          onSetQuickDevice={handleSetQuickDevice}
          theme={theme}
        />

        {/* Row 4: Performance Metrics Bar + Bottom Analytical DC Equation Strip */}
        <PerformanceMetricsBar metrics={metrics} params={params} theme={theme} />

        {/* Collapsible Lab Manual & Observation Table Section */}
        <div className="mt-2">
          <VirtualLabManual
            currentParams={params}
            currentMetrics={metrics}
            onApplyExperiment={handleApplyExperiment}
            observations={observations}
            onAddObservation={handleAddObservation}
            onClearObservations={() => setObservations([])}
            theme={theme}
          />
        </div>
      </main>

      {/* Waveform Analysis & Derivations Modal */}
      <WaveformDerivationsModal
        isOpen={isDerivationsOpen}
        onClose={() => setIsDerivationsOpen(false)}
        params={params}
      />

      {/* Theory & IIT Kharagpur Reference Modal */}
      {isTheoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div
            className={`relative w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <h3 className="text-base font-bold">
                Power Electronics Virtual Laboratory Theory & Principles
              </h3>
              <button
                onClick={() => setIsTheoryOpen(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed">
              <div
                className={`p-3 rounded-lg border ${
                  isDark
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                    : 'bg-cyan-50 border-cyan-300 text-cyan-900'
                }`}
              >
                <strong>Course:</strong> Power Electronics Laboratory (EE39001) · IIT Kharagpur<br />
                <strong>Developer:</strong> Banavath Srikanth (Roll No: 24EE10045)
              </div>
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">1. Principle of Natural Commutation & Line Commutation</h4>
              <p>
                In phase-controlled rectifiers, thyristors are naturally commutated off by the reversal of the AC supply voltage waveform. Under resistive loading, conduction ceases when instantaneous input voltage crosses zero. Under inductive loading (R-L), the back-EMF of the inductor maintains conduction until stored inductive energy drops to zero at the extinction angle β.
              </p>
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">2. Single-Phase Semi-Converter (Half-Controlled Bridge)</h4>
              <p>
                A semi-converter uses two controlled thyristors and two uncontrolled power diodes. During the interval when supply voltage becomes negative, the lower diodes provide an inherent freewheeling path, clamping the load voltage to zero and preventing negative voltage swings without requiring an external freewheeling diode.
              </p>
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">3. Three-Phase 6-Pulse Graetz Converter</h4>
              <p>
                Composed of 6 switches commutated in sequence every 60° (2π/6). It achieves an average DC voltage of V_dc = (3√3·Vm / π)·cos α ≈ 1.35·V_LL,rms·cos α with fundamental ripple frequency of 6f = 300 Hz at 50 Hz line frequency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer with credit */}
      <footer
        className={`mt-auto border-t py-3 text-center text-xs transition-colors duration-200 ${
          isDark ? 'border-slate-900 bg-slate-950/90 text-slate-500' : 'border-slate-200 bg-white/90 text-slate-600'
        }`}
      >
        <div className="max-w-[1720px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono">
            RectifierLab · Developed by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Banavath Srikanth</strong> (24EE10045)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            IIT Kharagpur Power Electronics Virtual Laboratory Interactive Simulator
          </span>
        </div>
      </footer>
    </div>
  );
}
