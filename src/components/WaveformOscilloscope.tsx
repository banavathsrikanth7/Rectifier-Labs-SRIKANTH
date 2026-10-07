import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CircuitParameters, InstantaneousState, ViewMode } from '../types';
import {
  generateWaveformSeries,
  calculatePerformanceMetrics,
  computeHarmonics,
  computeCurrentHarmonics,
} from '../utils/circuitMath';
import { Maximize2, Minimize2, Eye, BarChart3, Layers } from 'lucide-react';

interface WaveformOscilloscopeProps {
  params: CircuitParameters;
  state: InstantaneousState;
  cycles: number;
  onCyclesChange: (cycles: number) => void;
  onAngleChange: (angleDeg: number) => void;
  isRunning: boolean;
  theme?: 'dark' | 'light';
}

export const WaveformOscilloscope: React.FC<WaveformOscilloscopeProps> = ({
  params,
  state,
  cycles,
  onCyclesChange,
  onAngleChange,
  isRunning,
  theme = 'dark',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('superimposed');
  const [showGrid, setShowGrid] = useState(true);
  const [showVAvg, setShowVAvg] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fftSignal, setFftSignal] = useState<'current' | 'voltage'>('current');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 420 });

  const isDark = theme === 'dark';
  const metrics = useMemo(() => calculatePerformanceMetrics(params), [params]);

  // High sampling density (720 samples per cycle) for pristine waveform smoothness
  const series = useMemo(
    () => generateWaveformSeries(params, cycles, 720 * cycles),
    [params, cycles]
  );

  const voltageHarmonics = useMemo(
    () => computeHarmonics(series.vOut.slice(0, 720), params.frequency),
    [series, params.frequency]
  );

  const currentHarmonics = useMemo(
    () => computeCurrentHarmonics(series.iSource.slice(0, 720), params.frequency),
    [series, params.frequency]
  );

  // ResizeObserver to always keep canvas crisp
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setCanvasDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Click & Drag on Canvas to scrub simulation angle
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const paddingLeft = 60;
    const paddingRight = 25;
    const graphWidth = rect.width - paddingLeft - paddingRight;
    if (x >= paddingLeft && x <= rect.width - paddingRight) {
      const fraction = (x - paddingLeft) / graphWidth;
      const angle = (fraction * 360 * cycles) % 360;
      onAngleChange(angle);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvasDimensions.width;
    const height = canvasDimensions.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Deep dark or pristine light background
    ctx.fillStyle = isDark ? '#070b14' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (viewMode === 'harmonics') {
      drawHarmonicsView(
        ctx,
        width,
        height,
        fftSignal === 'current' ? currentHarmonics : voltageHarmonics,
        metrics,
        fftSignal,
        isDark
      );
    } else if (viewMode === 'channels') {
      drawChannelsView(
        ctx,
        width,
        height,
        series,
        state,
        metrics,
        cycles,
        showGrid,
        showVAvg,
        params,
        isDark
      );
    } else {
      drawSuperimposedView(
        ctx,
        width,
        height,
        series,
        state,
        metrics,
        cycles,
        showGrid,
        showVAvg,
        params,
        isDark
      );
    }
  }, [
    params,
    state,
    cycles,
    viewMode,
    showGrid,
    showVAvg,
    series,
    voltageHarmonics,
    currentHarmonics,
    fftSignal,
    metrics,
    canvasDimensions,
    isDark,
  ]);

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden shadow-xl transition-all duration-300 border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } ${isFullScreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full min-h-[490px]'}`}
    >
      {/* Scope Toolbar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('superimposed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'superimposed'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Superimposed</span>
          </button>
          <button
            onClick={() => setViewMode('channels')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'channels'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Multi-Channel Scope</span>
          </button>
          <button
            onClick={() => setViewMode('harmonics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'harmonics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 bg-slate-900'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Harmonics (FFT)</span>
          </button>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2">
          {/* Cycle selector */}
          <button
            onClick={() => onCyclesChange(cycles === 1 ? 2 : cycles === 2 ? 3 : 1)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-cyan-300 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-cyan-700 hover:bg-slate-200'
            }`}
          >
            {cycles} Cycle{cycles > 1 ? 's' : ''} ({cycles * 360}°)
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded-md border text-[11px] font-mono transition-colors ${
              showGrid
                ? isDark
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-300 font-bold'
                : isDark
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}
          >
            # Grid
          </button>

          {/* V_avg Toggle */}
          <button
            onClick={() => setShowVAvg(!showVAvg)}
            className={`px-2 py-1 rounded-md border text-[11px] font-mono transition-colors ${
              showVAvg
                ? isDark
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-purple-50 text-purple-800 border-purple-300 font-bold'
                : isDark
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}
          >
            V_dc (Avg)
          </button>

          {/* Full Screen */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-transparent'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{isFullScreen ? 'Exit' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Oscilloscope Canvas Container */}
      <div ref={containerRef} className="relative flex-1 w-full h-full min-h-[390px] overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasInteraction}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleCanvasInteraction(e);
          }}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

      {/* FFT Signal Selection when in Harmonics Mode */}
      {viewMode === 'harmonics' && (
        <div
          className={`flex items-center justify-between px-4 py-2 border-t text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500">Signal:</span>
            <button
              onClick={() => setFftSignal('current')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                fftSignal === 'current'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              AC Source Current i_s(t)
            </button>
            <button
              onClick={() => setFftSignal('voltage')}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                fftSignal === 'voltage'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              DC Output Voltage v_o(t)
            </button>
          </div>

          <div className="text-right font-mono text-[11px]">
            <span className="text-slate-500">Total Harmonic Distortion: </span>
            <strong className={isDark ? 'text-amber-400' : 'text-amber-700'}>
              {metrics.thdVoltage.toFixed(1)}%
            </strong>
          </div>
        </div>
      )}

      {/* Conduction Sequence Bar */}
      {viewMode !== 'harmonics' && (
        <ConductionIntervalsBar params={params} currentAngleDeg={state.angleDeg} isDark={isDark} />
      )}
    </div>
  );
};

/* -------------------------------------------------------------
   CONDUCTION INTERVALS TIMELINE BAR
   ------------------------------------------------------------- */
interface ConductionIntervalsBarProps {
  params: CircuitParameters;
  currentAngleDeg: number;
  isDark: boolean;
}

const ConductionIntervalsBar: React.FC<ConductionIntervalsBarProps> = ({
  params,
  currentAngleDeg,
  isDark,
}) => {
  const isThree = params.phase === 'three';
  const isBridge = params.topology === 'full-bridge';
  const isControlled = params.switchTech === 'thyristor';
  const isSemi =
    params.switchTech === 'semi-converter' ||
    (params.individualSwitches &&
      params.individualSwitches.s1 !== params.individualSwitches.s2);
  const alpha = params.firingAngle;

  const intervals: { start: number; end: number; label: string; color: string }[] = [];

  if (!isThree && !isBridge) {
    if (isControlled) {
      intervals.push({
        start: 0,
        end: alpha,
        label: 'OFF / BLOCKING',
        color: isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200 text-slate-500',
      });
      intervals.push({
        start: alpha,
        end: 180,
        label: 'T1 CONDUCTING',
        color: isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      });
      intervals.push({
        start: 180,
        end: 360,
        label: 'REVERSE / FWD',
        color: isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200 text-slate-500',
      });
    } else {
      intervals.push({
        start: 0,
        end: 180,
        label: 'D1 CONDUCTING',
        color: isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      });
      intervals.push({
        start: 180,
        end: 360,
        label: 'REVERSE / FWD',
        color: isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200 text-slate-500',
      });
    }
  } else if (!isThree && isBridge) {
    if (isSemi) {
      intervals.push({
        start: 0,
        end: alpha,
        label: 'FREEWHEEL (D1 T4)',
        color: isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-200 text-slate-600',
      });
      intervals.push({
        start: alpha,
        end: 180,
        label: 'ACTIVE (D1 T2)',
        color: isDark ? 'bg-purple-950 text-purple-200' : 'bg-purple-100 text-purple-800',
      });
      intervals.push({
        start: 180,
        end: 180 + alpha,
        label: 'FREEWHEEL (T3 D2)',
        color: isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-200 text-slate-600',
      });
      intervals.push({
        start: 180 + alpha,
        end: 360,
        label: 'ACTIVE (T3 T4)',
        color: isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      });
    } else if (isControlled) {
      intervals.push({
        start: 0,
        end: alpha,
        label: 'T3 T4 (EXT)',
        color: isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      });
      intervals.push({
        start: alpha,
        end: 180 + alpha,
        label: 'T1 T2 CONDUCTING',
        color: isDark ? 'bg-purple-950 text-purple-200' : 'bg-purple-100 text-purple-800',
      });
      intervals.push({
        start: 180 + alpha,
        end: 360,
        label: 'T3 T4 CONDUCTING',
        color: isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      });
    } else {
      intervals.push({
        start: 0,
        end: 180,
        label: 'D1 D2 CONDUCTING',
        color: isDark ? 'bg-purple-950 text-purple-200' : 'bg-purple-100 text-purple-800',
      });
      intervals.push({
        start: 180,
        end: 360,
        label: 'D3 D4 CONDUCTING',
        color: isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      });
    }
  } else if (isThree && isBridge) {
    const pairs = ['T1 T6', 'T1 T2', 'T3 T2', 'T3 T4', 'T5 T4', 'T5 T6'];
    for (let i = 0; i < 6; i++) {
      const start = (30 + (isControlled ? alpha : 0) + i * 60) % 360;
      const end = (start + 60) % 360;
      intervals.push({
        start,
        end: end < start ? 360 : end,
        label: pairs[i],
        color:
          i % 2 === 0
            ? isDark
              ? 'bg-purple-950 text-purple-200'
              : 'bg-purple-100 text-purple-800'
            : isDark
            ? 'bg-emerald-950 text-emerald-300'
            : 'bg-emerald-100 text-emerald-800',
      });
    }
  } else {
    intervals.push({
      start: 30,
      end: 150,
      label: 'T1 (Ph A)',
      color: isDark ? 'bg-rose-950 text-rose-300' : 'bg-rose-100 text-rose-800',
    });
    intervals.push({
      start: 150,
      end: 270,
      label: 'T2 (Ph B)',
      color: isDark ? 'bg-amber-950 text-amber-300' : 'bg-amber-100 text-amber-800',
    });
    intervals.push({
      start: 270,
      end: 390,
      label: 'T3 (Ph C)',
      color: isDark ? 'bg-blue-950 text-blue-300' : 'bg-blue-100 text-blue-800',
    });
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 text-[11px] font-mono border-t ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}
    >
      <span className="font-bold shrink-0">ACTIVE DEVICE:</span>
      <div
        className={`relative flex-1 h-7 rounded overflow-hidden flex border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
        }`}
      >
        {intervals.map((inv, idx) => {
          const widthPercent = Math.max(5, ((inv.end - inv.start) / 360) * 100);
          return (
            <div
              key={idx}
              style={{ width: `${widthPercent}%` }}
              className={`h-full flex items-center justify-center border-r font-bold text-[10px] ${
                isDark ? 'border-slate-800/80' : 'border-slate-200'
              } ${inv.color}`}
            >
              {inv.label}
            </div>
          );
        })}

        {/* Live scanning cursor needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4] pointer-events-none"
          style={{ left: `${(currentAngleDeg / 360) * 100}%` }}
        />
      </div>

      <div
        className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded border text-[10px] font-bold ${
          isDark
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-300 text-amber-800'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Gate Pulses</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   CANVAS DRAWING: SUPERIMPOSED VIEW (VOLTAGE & CURRENT)
   ------------------------------------------------------------- */
function drawSuperimposedView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  series: any,
  state: InstantaneousState,
  metrics: any,
  cycles: number,
  showGrid: boolean,
  showVAvg: boolean,
  params: CircuitParameters,
  isDark: boolean
) {
  const padL = 60;
  const padR = 25;
  const padT = 30;
  const padB = 32;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const vHeight = plotH * 0.58;
  const iTop = padT + vHeight + 28;
  const iHeight = plotH - vHeight - 28;

  const peakSource = Math.max(
    ...series.vSource.map(Math.abs),
    ...(series.vSourceB ? series.vSourceB.map(Math.abs) : []),
    ...(series.vSourceC ? series.vSourceC.map(Math.abs) : []),
    ...series.vOut.map(Math.abs)
  );
  const maxV = Math.max(380, Math.ceil((peakSource * 1.15) / 50) * 50);
  const vScale = (vHeight / 2) / maxV;
  const vMidY = padT + vHeight / 2;

  const peakCurrent = Math.max(
    5,
    ...series.iOut,
    ...series.iSource.map(Math.abs)
  );
  const maxI = Math.max(12, Math.ceil((peakCurrent * 1.25) / 5) * 5);
  const iScale = (iHeight / 2) / maxI;
  const iMidY = iTop + iHeight / 2;

  const totalDeg = 360 * cycles;

  // Grid Lines
  if (showGrid) {
    ctx.strokeStyle = isDark ? '#151e2e' : '#e2e8f0';
    ctx.lineWidth = 1;

    // Voltage Grid
    [maxV, Math.round(maxV / 2), 0, -Math.round(maxV / 2), -maxV].forEach((v) => {
      const y = vMidY - v * vScale;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${v}V`, padL - 8, y + 3);
    });

    // Current Grid
    [maxI, 0, -maxI].forEach((i) => {
      const y = iMidY - i * iScale;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${i}A`, padL - 8, y + 3);
    });

    // Degree Ticks along X-axis
    for (let deg = 0; deg <= totalDeg; deg += 90) {
      const x = padL + (deg / totalDeg) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + vHeight);
      ctx.moveTo(x, iTop);
      ctx.lineTo(x, iTop + iHeight);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#64748b' : '#475569';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${deg}°`, x, height - padB + 18);
    }
  }

  // Zero Reference Center Lines
  ctx.strokeStyle = isDark ? '#334155' : '#94a3b8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(padL, vMidY);
  ctx.lineTo(width - padR, vMidY);
  ctx.moveTo(padL, iMidY);
  ctx.lineTo(width - padR, iMidY);
  ctx.stroke();

  // Dashed V_dc (Avg) Reference Line
  if (showVAvg && !isNaN(metrics.vDc)) {
    const yVAvg = vMidY - metrics.vDc * vScale;
    ctx.strokeStyle = isDark ? '#c084fc' : '#9333ea';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, yVAvg);
    ctx.lineTo(width - padR, yVAvg);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isDark ? '#d8b4fe' : '#7e22ce';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`V_dc (Avg) = ${metrics.vDc.toFixed(1)}V`, padL + 12, yVAvg - 5);
  }

  const N = series.anglesDeg.length;

  // 1. Draw AC Input Waveforms
  if (params.phase === 'three' && series.vSourceB && series.vSourceC) {
    // Phase B
    ctx.strokeStyle = isDark ? '#eab308' : '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
      const y = vMidY - series.vSourceB[i] * vScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Phase C
    ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
      const y = vMidY - series.vSourceC[i] * vScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Phase A
    ctx.strokeStyle = isDark ? '#ef4444' : '#dc2626';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
      const y = vMidY - series.vSource[i] * vScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Single Phase Input vs
    ctx.strokeStyle = isDark ? '#06b6d4' : '#0284c7';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
      const y = vMidY - series.vSource[i] * vScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 2. Draw Rectified Output Voltage vo
  ctx.strokeStyle = isDark ? '#fbbf24' : '#d97706';
  ctx.lineWidth = 3.2;
  if (isDark) {
    ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
    ctx.shadowBlur = 6;
  }
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
    const y = vMidY - series.vOut[i] * vScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Current Waveforms (Bottom Section)
  // Source Current is
  ctx.strokeStyle = isDark ? '#c084fc' : '#7c3aed';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
    const y = iMidY - series.iSource[i] * iScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Load Current io
  ctx.strokeStyle = isDark ? '#10b981' : '#059669';
  ctx.lineWidth = 2.8;
  if (isDark) {
    ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    ctx.shadowBlur = 4;
  }
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
    const y = iMidY - series.iOut[i] * iScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 4. Gate Pulse Trigger Markers
  series.states.forEach((st: InstantaneousState, idx: number) => {
    if (st.gatePulse1 && idx % 3 === 0) {
      const x = padL + (st.angleDeg / totalDeg) * plotW;
      ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
      ctx.fillRect(x - 14, iMidY + 12, 28, 11);
    }
    if (st.gatePulse3 && idx % 3 === 0) {
      const x = padL + (st.angleDeg / totalDeg) * plotW;
      ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
      ctx.fillRect(x - 14, iMidY + 12, 28, 11);
    }
  });

  // 5. Vertical Scanning Cursor Line at Current Angle wt
  const cursorDeg = state.angleDeg;
  const cursorX = padL + (cursorDeg / totalDeg) * plotW;
  ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cursorX, padT - 6);
  ctx.lineTo(cursorX, height - padB);
  ctx.stroke();
  ctx.setLineDash([]);

  // Live Glowing Inspection Dots
  const yVo = vMidY - state.vOut * vScale;
  ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
  ctx.beginPath();
  ctx.arc(cursorX, yVo, 6, 0, 2 * Math.PI);
  ctx.fill();

  const yIo = iMidY - state.iOut * iScale;
  ctx.fillStyle = isDark ? '#10b981' : '#059669';
  ctx.beginPath();
  ctx.arc(cursorX, yIo, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Graph Section Header Labels
  ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
  ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VOLTAGE WAVEFORMS (v_s & v_o SUPERIMPOSED)', padL + 12, padT + 14);
  ctx.fillText('CURRENT WAVEFORMS (i_o Load & i_s Line)', padL + 12, iTop + 14);

  // Graph Legends
  if (params.phase === 'three') {
    drawThreePhaseLegend(ctx, width - padR - 260, padT + 14, isDark);
  } else {
    drawSinglePhaseLegend(ctx, width - padR - 210, padT + 14, isDark);
  }

  // Live Oscilloscope HUD Readout Box
  drawOscilloscopeHudBox(ctx, width - padR - 220, padT + 30, state, isDark);
}

function drawOscilloscopeHudBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: InstantaneousState,
  isDark: boolean
) {
  const w = 210;
  const h = 76;

  ctx.fillStyle = isDark ? 'rgba(10, 15, 29, 0.92)' : 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = isDark ? '#1e293b' : '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
  ctx.font = 'bold 10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`PROBE: ωt = ${state.angleDeg.toFixed(1)}°`, x + 10, y + 16);

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText(`vs:`, x + 10, y + 34);
  ctx.fillStyle = isDark ? '#06b6d4' : '#0284c7';
  ctx.fillText(`${state.vSource.toFixed(1)} V`, x + 34, y + 34);

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.fillText(`vo:`, x + 108, y + 34);
  ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
  ctx.fillText(`${state.vOut.toFixed(1)} V`, x + 132, y + 34);

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.fillText(`io:`, x + 10, y + 52);
  ctx.fillStyle = isDark ? '#10b981' : '#059669';
  ctx.fillText(`${state.iOut.toFixed(2)} A`, x + 34, y + 52);

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.fillText(`is:`, x + 108, y + 52);
  ctx.fillStyle = isDark ? '#c084fc' : '#7c3aed';
  ctx.fillText(`${state.iSource.toFixed(2)} A`, x + 132, y + 52);

  ctx.fillStyle = isDark ? '#64748b' : '#64748b';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText(`Loop: ${state.activePathDescription.slice(0, 24)}`, x + 10, y + 68);
}

function drawSinglePhaseLegend(ctx: CanvasRenderingContext2D, x: number, y: number, isDark: boolean) {
  ctx.font = '10px JetBrains Mono, monospace';

  // vs
  ctx.fillStyle = isDark ? '#06b6d4' : '#0284c7';
  ctx.fillRect(x, y - 6, 12, 2);
  ctx.fillText('v_s', x + 16, y);

  // vo
  ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
  ctx.fillRect(x + 55, y - 6, 12, 3);
  ctx.fillText('v_o', x + 71, y);

  // io
  ctx.fillStyle = isDark ? '#10b981' : '#059669';
  ctx.fillRect(x + 110, y - 6, 12, 3);
  ctx.fillText('i_o', x + 126, y);

  // is
  ctx.fillStyle = isDark ? '#c084fc' : '#7c3aed';
  ctx.fillRect(x + 160, y - 6, 12, 2);
  ctx.fillText('i_s', x + 176, y);
}

function drawThreePhaseLegend(ctx: CanvasRenderingContext2D, x: number, y: number, isDark: boolean) {
  ctx.font = '10px JetBrains Mono, monospace';

  // va
  ctx.fillStyle = isDark ? '#ef4444' : '#dc2626';
  ctx.fillRect(x, y - 6, 10, 2);
  ctx.fillText('va', x + 14, y);

  // vb
  ctx.fillStyle = isDark ? '#eab308' : '#ca8a04';
  ctx.fillRect(x + 40, y - 6, 10, 2);
  ctx.fillText('vb', x + 54, y);

  // vc
  ctx.fillStyle = isDark ? '#3b82f6' : '#2563eb';
  ctx.fillRect(x + 80, y - 6, 10, 2);
  ctx.fillText('vc', x + 94, y);

  // vo
  ctx.fillStyle = isDark ? '#fbbf24' : '#d97706';
  ctx.fillRect(x + 120, y - 6, 12, 3);
  ctx.fillText('vo', x + 136, y);

  // io
  ctx.fillStyle = isDark ? '#10b981' : '#059669';
  ctx.fillRect(x + 165, y - 6, 12, 3);
  ctx.fillText('io', x + 181, y);
}

/* -------------------------------------------------------------
   CANVAS DRAWING: MULTI-CHANNEL OSCILLOSCOPE (4 CHANNELS)
   ------------------------------------------------------------- */
function drawChannelsView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  series: any,
  state: InstantaneousState,
  metrics: any,
  cycles: number,
  showGrid: boolean,
  showVAvg: boolean,
  params: CircuitParameters,
  isDark: boolean
) {
  const padL = 60;
  const padR = 25;
  const padT = 25;
  const padB = 30;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const chHeight = plotH / 4;
  const totalDeg = 360 * cycles;
  const N = series.anglesDeg.length;

  const channels = [
    {
      name: 'CH1: AC Source Voltage v_s(t)',
      data: series.vSource,
      color: isDark ? '#06b6d4' : '#0284c7',
      scaleMax: 350,
      unit: 'V',
      instantValue: state.vSource,
    },
    {
      name: 'CH2: Output Voltage v_o(t)',
      data: series.vOut,
      color: isDark ? '#fbbf24' : '#d97706',
      scaleMax: 350,
      unit: 'V',
      instantValue: state.vOut,
    },
    {
      name: 'CH3: DC Load Current i_o(t)',
      data: series.iOut,
      color: isDark ? '#10b981' : '#059669',
      scaleMax: 15,
      unit: 'A',
      instantValue: state.iOut,
    },
    {
      name: 'CH4: AC Line Current i_s(t)',
      data: series.iSource,
      color: isDark ? '#c084fc' : '#7c3aed',
      scaleMax: 15,
      unit: 'A',
      instantValue: state.iSource,
    },
  ];

  channels.forEach((ch, idx) => {
    const chTop = padT + idx * chHeight;
    const chMid = chTop + chHeight / 2;
    const scale = (chHeight / 2 - 10) / ch.scaleMax;

    if (idx % 2 === 1) {
      ctx.fillStyle = isDark ? '#0a0f1d' : '#f8fafc';
      ctx.fillRect(padL, chTop, plotW, chHeight);
    }

    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, chMid);
    ctx.lineTo(width - padR, chMid);
    ctx.stroke();

    ctx.fillStyle = ch.color;
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${ch.name}`, padL + 10, chTop + 14);

    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`= ${ch.instantValue.toFixed(1)} ${ch.unit}`, width - padR - 10, chTop + 14);

    ctx.strokeStyle = ch.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (series.anglesDeg[i] / totalDeg) * plotW;
      const y = chMid - ch.data[i] * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const cursorX = padL + (state.angleDeg / totalDeg) * plotW;
    const cursorY = chMid - ch.instantValue * scale;
    ctx.fillStyle = ch.color;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 4.5, 0, 2 * Math.PI);
    ctx.fill();
  });

  const cursorX = padL + (state.angleDeg / totalDeg) * plotW;
  ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cursorX, padT);
  ctx.lineTo(cursorX, height - padB);
  ctx.stroke();
  ctx.setLineDash([]);
}

/* -------------------------------------------------------------
   CANVAS DRAWING: FFT HARMONICS VIEW
   ------------------------------------------------------------- */
function drawHarmonicsView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  harmonics: any[],
  metrics: any,
  signal: 'current' | 'voltage',
  isDark: boolean
) {
  const padL = 60;
  const padR = 40;
  const padT = 50;
  const padB = 40;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
  ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    `FOURIER HARMONIC SPECTRUM - ${
      signal === 'current' ? 'SOURCE CURRENT i_s(t)' : 'OUTPUT VOLTAGE v_o(t)'
    }`,
    padL,
    padT - 16
  );

  const numBars = Math.min(12, harmonics.length);
  const barWidth = Math.min(42, (plotW / numBars) * 0.65);
  const gap = plotW / numBars;

  [100, 75, 50, 25, 0].forEach((pct) => {
    const y = padT + plotH - (pct / 100) * plotH;
    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - padR, y);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#64748b' : '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${pct}%`, padL - 8, y + 3);
  });

  harmonics.slice(0, numBars).forEach((h, idx) => {
    const x = padL + idx * gap + gap * 0.15;
    const barH = (Math.min(100, h.percentageOfDc) / 100) * plotH;
    const y = padT + plotH - barH;

    const grad = ctx.createLinearGradient(x, y, x, padT + plotH);
    if (h.order === 1) {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, isDark ? '#083344' : '#bae6fd');
    } else {
      grad.addColorStop(0, isDark ? '#fbbf24' : '#d97706');
      grad.addColorStop(1, isDark ? '#451a03' : '#fed7aa');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barH);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${h.percentageOfDc.toFixed(1)}%`, x + barWidth / 2, y - 6);

    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(`h=${h.order}`, x + barWidth / 2, padT + plotH + 16);
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(`${h.frequency}Hz`, x + barWidth / 2, padT + plotH + 28);
  });
}
