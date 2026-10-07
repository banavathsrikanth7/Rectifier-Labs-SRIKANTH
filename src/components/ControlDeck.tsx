import React from 'react';
import { CircuitParameters, PhaseType, TopologyType, SwitchTechnology, LoadType } from '../types';
import { Sliders, Zap, Shield, Battery } from 'lucide-react';

interface ControlDeckProps {
  params: CircuitParameters;
  onUpdateParams: (newParams: Partial<CircuitParameters>) => void;
  onSetQuickDevice: (type: 'all-diodes' | 'all-thyristors' | 'semi-conv') => void;
  theme?: 'dark' | 'light';
  isDarkMode?: boolean;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  params,
  onUpdateParams,
  onSetQuickDevice,
  theme = 'dark',
  isDarkMode = true,
}) => {
  const isDark = theme ? theme === 'dark' : isDarkMode;
  const isThyristor = params.switchTech === 'thyristor' || params.switchTech === 'semi-converter';
  const alphaAngles = [0, 15, 30, 45, 60, 90, 120, 150, 180];

  const panelBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const subBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const titleColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const labelColor = isDark ? 'text-slate-400' : 'text-slate-600';
  const sliderTrack = isDark ? 'bg-slate-800' : 'bg-slate-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ----------------- PANEL 1: CONVERTER TOPOLOGY ----------------- */}
      <div className={`flex flex-col gap-3 p-4 ${panelBg} border rounded-xl shadow-md transition-colors duration-200`}>
        <div className="flex items-center gap-2">
          <span className="text-cyan-500">⚡</span>
          <h3 className={`text-xs font-bold ${titleColor} uppercase tracking-wider`}>
            CONVERTER TOPOLOGY
          </h3>
        </div>

        {/* Phase selector */}
        <div className={`flex p-1 ${subBg} rounded-lg border`}>
          <button
            onClick={() => onUpdateParams({ phase: 'single' })}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
              params.phase === 'single'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            Single-Phase (1Φ)
          </button>
          <button
            onClick={() => onUpdateParams({ phase: 'three' })}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
              params.phase === 'three'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            Three-Phase (3Φ)
          </button>
        </div>

        {/* Bridge vs Half-Wave */}
        <div className={`flex p-1 ${subBg} rounded-lg border`}>
          <button
            onClick={() => onUpdateParams({ topology: 'full-bridge' })}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
              params.topology === 'full-bridge'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            Full-Bridge
          </button>
          <button
            onClick={() => onUpdateParams({ topology: 'half-wave' })}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition-colors ${
              params.topology === 'half-wave'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            Half-Wave
          </button>
        </div>

        {/* Quick Device Setups */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-700/40">
          <span className={`text-[11px] font-mono ${labelColor}`}>Quick Setup:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => onSetQuickDevice('all-diodes')}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                params.switchTech === 'diode'
                  ? isDark
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 font-bold'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : `${subBg} ${labelColor} hover:text-emerald-500`
              }`}
            >
              All Diodes
            </button>
            <button
              onClick={() => onSetQuickDevice('all-thyristors')}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                params.switchTech === 'thyristor'
                  ? isDark
                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/60 font-bold'
                    : 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                  : `${subBg} ${labelColor} hover:text-amber-500`
              }`}
            >
              All Thyristors
            </button>
            <button
              onClick={() => onSetQuickDevice('semi-conv')}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                params.switchTech === 'semi-converter'
                  ? isDark
                    ? 'bg-purple-950/70 text-purple-300 border-purple-500/60 font-bold'
                    : 'bg-purple-50 text-purple-800 border-purple-300 font-bold'
                  : `${subBg} ${labelColor} hover:text-purple-500`
              }`}
            >
              Semi-Conv
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- PANEL 2: FIRING ANGLE α & FWD ----------------- */}
      <div className={`flex flex-col gap-3 p-4 ${panelBg} border rounded-xl shadow-md transition-colors duration-200`}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className={`text-xs font-bold ${titleColor} uppercase tracking-wider`}>
            FIRING ANGLE α & FWD
          </h3>
        </div>

        {/* Firing Angle Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className={labelColor}>Firing Angle (α):</span>
            <span
              className={`font-bold px-2 py-0.5 rounded border ${
                isDark
                  ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
                  : 'text-amber-800 bg-amber-50 border-amber-300'
              }`}
            >
              {params.firingAngle}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={params.firingAngle}
            onChange={(e) => onUpdateParams({ firingAngle: parseInt(e.target.value) })}
            className={`h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 ${sliderTrack}`}
          />
        </div>

        {/* Quick Angle Chips */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {alphaAngles.map((a) => (
            <button
              key={a}
              onClick={() => onUpdateParams({ firingAngle: a })}
              className={`py-1 rounded text-[11px] font-mono transition-colors ${
                params.firingAngle === a
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : `${subBg} ${labelColor} border hover:text-amber-600`
              }`}
            >
              {a}°
            </button>
          ))}
        </div>

        {/* Freewheeling Diode (FWD) Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
          <div className="flex flex-col">
            <span className={`text-xs font-medium ${titleColor}`}>Freewheeling Diode (FWD)</span>
            <span className={`text-[10px] ${labelColor}`}>Prevents negative voltage excursions</span>
          </div>
          <button
            onClick={() =>
              onUpdateParams({
                showFreewheelingDiode: !params.showFreewheelingDiode,
                loadType: !params.showFreewheelingDiode ? 'RL_FWD' : 'RL',
              })
            }
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              params.showFreewheelingDiode || params.loadType === 'RL_FWD'
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-xs'
                : `${subBg} ${labelColor} hover:text-emerald-500`
            }`}
          >
            {params.showFreewheelingDiode || params.loadType === 'RL_FWD' ? 'CONNECTED' : 'DISCONNECTED'}
          </button>
        </div>
      </div>

      {/* ----------------- PANEL 3: LOAD PARAMETERS ----------------- */}
      <div className={`flex flex-col gap-3 p-4 ${panelBg} border rounded-xl shadow-md transition-colors duration-200`}>
        <div className="flex items-center gap-2">
          <Battery className="w-4 h-4 text-cyan-500" />
          <h3 className={`text-xs font-bold ${titleColor} uppercase tracking-wider`}>
            LOAD CONFIGURATION
          </h3>
        </div>

        {/* Load Type Selector */}
        <div className={`flex p-1 ${subBg} rounded-lg border`}>
          <button
            onClick={() => onUpdateParams({ loadType: 'R' })}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
              params.loadType === 'R'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            R Load
          </button>
          <button
            onClick={() => onUpdateParams({ loadType: 'RL' })}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
              params.loadType === 'RL' || params.loadType === 'RL_FWD'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            RL Load
          </button>
          <button
            onClick={() => onUpdateParams({ loadType: 'RLE', backEmf: params.backEmf || 24 })}
            className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
              params.loadType === 'RLE'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : `${labelColor} hover:text-cyan-600`
            }`}
          >
            RLE Load
          </button>
        </div>

        {/* Sliders: R, L, Source RMS */}
        <div className="flex flex-col gap-2">
          {/* R Slider */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono">
            <span className={labelColor}>R (Resistance):</span>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={params.resistance}
              onChange={(e) => onUpdateParams({ resistance: parseInt(e.target.value) })}
              className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 ${sliderTrack}`}
            />
            <span className={`font-bold w-12 text-right ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {params.resistance} Ω
            </span>
          </div>

          {/* L Slider */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono">
            <span className={labelColor}>L (Inductance):</span>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={params.inductance}
              onChange={(e) => onUpdateParams({ inductance: parseInt(e.target.value) })}
              className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-purple-500 ${sliderTrack}`}
            />
            <span className={`font-bold w-12 text-right ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              {params.inductance} mH
            </span>
          </div>

          {/* Source RMS */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono">
            <span className={labelColor}>Source RMS:</span>
            <input
              type="range"
              min="20"
              max="415"
              step="5"
              value={params.vRms}
              onChange={(e) => onUpdateParams({ vRms: parseInt(e.target.value) })}
              className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${sliderTrack}`}
            />
            <span className={`font-bold w-12 text-right ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
              {params.vRms}V
            </span>
          </div>

          {/* Back EMF (if RLE) */}
          {params.loadType === 'RLE' && (
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-rose-500 font-semibold">Back-EMF (E):</span>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={params.backEmf}
                onChange={(e) => onUpdateParams({ backEmf: parseInt(e.target.value) })}
                className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 ${sliderTrack}`}
              />
              <span className="text-rose-500 font-bold w-12 text-right">
                {params.backEmf}V
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
