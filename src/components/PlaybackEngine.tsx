import React from 'react';
import { Play, Pause, RotateCcw, StepBack, StepForward, Clock } from 'lucide-react';

interface PlaybackEngineProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  angleDeg: number;
  onAngleChange: (angle: number) => void;
  onStep: (deltaDeg: number) => void;
  onReset: () => void;
  firingAngle?: number;
  theme?: 'dark' | 'light';
}

export const PlaybackEngine: React.FC<PlaybackEngineProps> = ({
  isRunning,
  onTogglePlay,
  speed,
  onSpeedChange,
  angleDeg,
  onAngleChange,
  onStep,
  onReset,
  firingAngle = 45,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const speeds = [
    { value: 0.05, label: '0.05x' },
    { value: 0.1, label: '0.1x' },
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 1.0, label: '1.0x' },
  ];

  return (
    <div
      className={`flex flex-col gap-2.5 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Top row: Transport Controls, Step Controls, Speed Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Play/Pause & Step */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs tracking-wider transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-1 ring-amber-400/50'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 ring-1 ring-emerald-400/50'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN SIMULATOR</span>
              </>
            )}
          </button>

          {/* Fine Step Buttons */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => onStep(-1)}
              className={`px-2 py-1.5 transition-colors text-[11px] font-mono rounded ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                  : 'hover:bg-slate-200 text-slate-600 hover:text-cyan-700'
              }`}
              title="Step Backward 1°"
            >
              -1°
            </button>
            <button
              onClick={() => onStep(-5)}
              className={`p-1.5 transition-colors rounded ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Step Backward 5°"
            >
              <StepBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onStep(5)}
              className={`p-1.5 transition-colors rounded ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Step Forward 5°"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onStep(1)}
              className={`px-2 py-1.5 transition-colors text-[11px] font-mono rounded ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                  : 'hover:bg-slate-200 text-slate-600 hover:text-cyan-700'
              }`}
              title="Step Forward 1°"
            >
              +1°
            </button>
          </div>

          {/* Jump to alpha */}
          <button
            onClick={() => onAngleChange(firingAngle)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${
              isDark
                ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
            }`}
            title={`Jump directly to Firing Angle α = ${firingAngle}°`}
          >
            <span>α = {firingAngle}°</span>
          </button>

          {/* Reset angle */}
          <button
            onClick={onReset}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
            title="Reset to 0°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 text-xs font-mono ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>Speed:</span>
          </div>

          <div
            className={`flex items-center gap-1 p-1 rounded-lg border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {speeds.map((s) => (
              <button
                key={s.value}
                onClick={() => onSpeedChange(s.value)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                  Math.abs(speed - s.value) < 0.02
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Interactive Electrical Angle Scrubber Slider */}
      <div
        className={`flex items-center gap-3 pt-1 border-t ${
          isDark ? 'border-slate-800/60' : 'border-slate-200'
        }`}
      >
        <span
          className={`text-[11px] font-mono shrink-0 font-semibold ${
            isDark ? 'text-cyan-400' : 'text-cyan-700'
          }`}
        >
          Electrical Angle ωt:
        </span>

        <input
          type="range"
          min="0"
          max="360"
          step="0.5"
          value={angleDeg}
          onChange={(e) => onAngleChange(parseFloat(e.target.value))}
          className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'
          }`}
        />

        <div
          className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md border font-mono text-xs ${
            isDark
              ? 'bg-slate-950 border-slate-800'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <span className={isDark ? 'text-cyan-300 font-bold' : 'text-cyan-700 font-bold'}>
            {angleDeg.toFixed(1)}°
          </span>
          <span className="text-slate-400">/</span>
          <span className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px]'}>
            {((angleDeg * Math.PI) / 180).toFixed(2)} rad
          </span>
          <span className="text-slate-400">/</span>
          <span className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px]'}>
            {((angleDeg / 360) * 20).toFixed(2)} ms
          </span>
        </div>
      </div>
    </div>
  );
};
