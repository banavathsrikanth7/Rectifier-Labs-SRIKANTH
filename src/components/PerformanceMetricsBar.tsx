import React from 'react';
import { PerformanceMetrics, CircuitParameters } from '../types';
import { getAnalyticalFormulaDetails } from '../utils/circuitMath';
import { Gauge, Zap, TrendingUp, Info } from 'lucide-react';

interface PerformanceMetricsBarProps {
  metrics: PerformanceMetrics;
  params: CircuitParameters;
  theme?: 'dark' | 'light';
  isDarkMode?: boolean;
}

export const PerformanceMetricsBar: React.FC<PerformanceMetricsBarProps> = ({
  metrics,
  params,
  theme = 'dark',
  isDarkMode = true,
}) => {
  const isDark = theme ? theme === 'dark' : isDarkMode;
  const formulaInfo = getAnalyticalFormulaDetails(params, metrics);

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const subLabelColor = isDark ? 'text-slate-500' : 'text-slate-400';
  const bannerBg = isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const pillBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';

  return (
    <div className="flex flex-col gap-3">
      {/* 6 Metric Cards matching the video display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Avg DC Voltage */}
        <div className={`flex flex-col p-3 rounded-xl ${cardBg} border shadow-md transition-colors duration-200`}>
          <span className={`text-[11px] font-medium ${labelColor}`}>Avg DC Voltage</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-lg font-bold font-mono tabular-nums ${
                metrics.vDc >= 0
                  ? isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-700'
                  : 'text-rose-500'
              }`}
            >
              {metrics.vDc.toFixed(1)}
            </span>
            <span className={`text-xs ${labelColor} font-mono`}>V</span>
          </div>
          <span className={`text-[10px] ${subLabelColor} font-mono mt-0.5 truncate`}>
            Theor: {formulaInfo.theoreticalVdc.toFixed(1)} V
          </span>
        </div>

        {/* 2. Avg DC Current */}
        <div className={`flex flex-col p-3 rounded-xl ${cardBg} border shadow-md transition-colors duration-200`}>
          <span className={`text-[11px] font-medium ${labelColor}`}>Avg DC Current</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono tabular-nums ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
              {metrics.iDc.toFixed(2)}
            </span>
            <span className={`text-xs ${labelColor} font-mono`}>A</span>
          </div>
          <span className={`text-[10px] ${subLabelColor} font-mono mt-0.5`}>
            RMS: {metrics.iRmsOut.toFixed(2)} A
          </span>
        </div>

        {/* 3. Output Power */}
        <div className={`flex flex-col p-3 rounded-xl ${cardBg} border shadow-md transition-colors duration-200`}>
          <span className={`text-[11px] font-medium ${labelColor}`}>Output Power</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono tabular-nums ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {metrics.pDc.toFixed(1)}
            </span>
            <span className={`text-xs ${labelColor} font-mono`}>W</span>
          </div>
          <span className={`text-[10px] ${subLabelColor} font-mono mt-0.5`}>
            P_ac: {metrics.pAc.toFixed(1)} W
          </span>
        </div>

        {/* 4. Power Factor */}
        <div className={`flex flex-col p-3 rounded-xl ${cardBg} border shadow-md transition-colors duration-200`}>
          <span className={`text-[11px] font-medium ${labelColor}`}>Power Factor</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono tabular-nums ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              {metrics.inputPf.toFixed(3)}
            </span>
          </div>
          <span className={`text-[10px] ${subLabelColor} font-mono mt-0.5`}>
            DPF: {metrics.displacementPf.toFixed(2)}
          </span>
        </div>

        {/* 5. Ripple Factor */}
        <div className={`flex flex-col p-3 rounded-xl ${cardBg} border shadow-md transition-colors duration-200`}>
          <span className={`text-[11px] font-medium ${labelColor}`}>Ripple Factor</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono tabular-nums ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              {metrics.rippleFactor.toFixed(3)}
            </span>
          </div>
          <span className={`text-[10px] ${subLabelColor} font-mono mt-0.5`}>
            f_r: {metrics.rippleFrequency} Hz
          </span>
        </div>

        {/* 6. Source THD(I) */}
        <div className={`flex flex-col p-3 rounded-xl ${cardBg} border shadow-md transition-colors duration-200`}>
          <span className={`text-[11px] font-medium ${labelColor}`}>Source THD(I)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono tabular-nums ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
              {metrics.thdVoltage.toFixed(1)}
            </span>
            <span className={`text-xs ${labelColor} font-mono`}>%</span>
          </div>
          <span className={`text-[10px] ${subLabelColor} font-mono mt-0.5`}>
            η: {metrics.efficiency.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bottom Analytical DC Voltage Equation Banner matching video */}
      <div className={`flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl ${bannerBg} border shadow-md transition-colors duration-200`}>
        {/* Left: Topology Badge + Formula Title */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${pillBg}`}>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className={`font-mono text-xs font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
              {formulaInfo.title.split(' - ')[0]}
            </span>
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Analytical DC Voltage Equation
            </span>
            <span className={`text-[10px] ${subLabelColor}`}>
              Mathematical formula validated against simulated integral
            </span>
          </div>
        </div>

        {/* Center: Exact Equation */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border font-mono text-sm shadow-inner ${pillBg}`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${labelColor}`}>
            THEORETICAL FORMULA:
          </span>
          <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            {formulaInfo.formula}
          </span>
        </div>

        {/* Right: Calculated Value Tag */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${labelColor}`}>Calculated V_dc:</span>
          <span
            className={`px-3 py-1 rounded-lg border font-mono font-bold text-xs shadow-sm ${
              isDark
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            = {formulaInfo.theoreticalVdc.toFixed(2)} V
          </span>
        </div>
      </div>
    </div>
  );
};
