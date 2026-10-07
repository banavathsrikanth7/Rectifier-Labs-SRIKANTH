import React, { useState } from 'react';
import { CircuitParameters, InstantaneousState } from '../types';
import { Maximize2, Minimize2, Zap } from 'lucide-react';

interface CircuitSchematicProps {
  params: CircuitParameters;
  state: InstantaneousState;
  onUpdateParams: (newParams: Partial<CircuitParameters>) => void;
  onToggleIndividualSwitch: (switchKey: 's1' | 's2' | 's3' | 's4' | 's5' | 's6') => void;
  isRunning: boolean;
  theme?: 'dark' | 'light';
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  params,
  state,
  onUpdateParams,
  onToggleIndividualSwitch,
  isRunning,
  theme = 'dark',
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const isDark = theme === 'dark';

  const isThreePhase = params.phase === 'three';
  const isFullBridge = params.topology === 'full-bridge';

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden shadow-xl transition-all duration-300 border ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      } ${isZoomed ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full min-h-[490px]'}`}
    >
      {/* Top Header of Schematic */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded border ${
              isDark
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-cyan-50 border-cyan-200 text-cyan-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Circuit Schematic Diagram
            </h2>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                isDark
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800/80'
                  : 'bg-cyan-50 text-cyan-700 border-cyan-200'
              }`}
            >
              {params.phase === 'single' ? '1-PHASE' : '3-PHASE'}{' '}
              {params.topology === 'full-bridge' ? 'FULL-BRIDGE' : 'HALF-WAVE'} (
              {params.switchTech.toUpperCase()})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Loop Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono shadow-sm ${
              isDark
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ACTIVE CONDUCTION:
            </span>
            <span className="font-bold truncate max-w-[240px]">
              {state.activePathDescription}
            </span>
          </div>

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
            }`}
            title={isZoomed ? 'Exit Full Screen' : 'Full Screen Schematic'}
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{isZoomed ? 'Exit' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Guide & Controls strip */}
      <div
        className={`px-4 py-1.5 border-b text-[11px] flex flex-wrap items-center justify-between gap-2 ${
          isDark
            ? 'bg-[#0a0f1d] border-slate-800/60 text-slate-400'
            : 'bg-slate-100/70 border-slate-200 text-slate-600'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span className={isDark ? 'text-cyan-400' : 'text-cyan-700 font-bold'}>💡 Tip:</span> Click any switch symbol to toggle between{' '}
          <strong className={isDark ? 'text-cyan-300' : 'text-cyan-700'}>Diode (D)</strong> and{' '}
          <strong className={isDark ? 'text-amber-300' : 'text-amber-700'}>Thyristor (T)</strong>.
        </span>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className={`flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Current Flow
          </span>
          <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Reverse / Blocking
          </span>
        </div>
      </div>

      {/* SVG Circuit Canvas Area */}
      <div
        className={`relative flex-1 w-full h-full min-h-[410px] p-2 flex items-center justify-center overflow-hidden transition-colors duration-200 ${
          isDark ? 'bg-[#070b14]' : 'bg-[#f8fafc]'
        }`}
      >
        {/* Tech Blueprint Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isDark ? 0.2 : 0.45,
            backgroundImage: isDark
              ? 'radial-gradient(#0284c7 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)'
              : 'radial-gradient(#94a3b8 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '24px 24px, 120px 120px, 120px 120px',
          }}
        />

        <svg
          viewBox={isThreePhase ? '0 0 960 460' : '0 0 860 440'}
          className="w-full h-full max-h-[500px] select-none"
        >
          <defs>
            {/* Glow Filters */}
            <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Animation Keyframes */}
            <style>
              {`
                @keyframes currentForward {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: -36px; }
                }
                @keyframes currentBackward {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: 36px; }
                }
                .flowing-path-fwd {
                  stroke-dasharray: 6 12;
                  stroke-linecap: round;
                  animation: currentForward 0.9s linear infinite;
                }
                .flowing-path-rev {
                  stroke-dasharray: 6 12;
                  stroke-linecap: round;
                  animation: currentBackward 0.9s linear infinite;
                }
              `}
            </style>
          </defs>

          {isThreePhase ? (
            <ThreePhaseCircuitSvg
              params={params}
              state={state}
              onToggleSwitch={onToggleIndividualSwitch}
              isRunning={isRunning}
              isDark={isDark}
            />
          ) : (
            <SinglePhaseCircuitSvg
              params={params}
              state={state}
              onToggleSwitch={onToggleIndividualSwitch}
              isRunning={isRunning}
              isDark={isDark}
            />
          )}
        </svg>

        {/* Freewheeling Diode Status Banner at bottom */}
        <div
          className={`absolute bottom-3 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono shadow-md backdrop-blur-md ${
            isDark
              ? 'bg-slate-950/90 border-slate-800 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>FREEWHEELING (D_FW):</span>
          <span
            className={`font-bold ${
              state.isFreewheeling
                ? isDark
                  ? 'text-emerald-400 flex items-center gap-1'
                  : 'text-emerald-700 flex items-center gap-1'
                : params.showFreewheelingDiode || params.loadType === 'RL_FWD'
                ? isDark
                  ? 'text-cyan-400'
                  : 'text-cyan-700'
                : 'text-slate-400'
            }`}
          >
            {state.isFreewheeling ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                ACTIVE (CONDUCTING)
              </>
            ) : params.showFreewheelingDiode || params.loadType === 'RL_FWD' ? (
              'REVERSE BIASED'
            ) : (
              'OFF / NONE'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   SINGLE-PHASE CIRCUIT SVG (HALF-WAVE & FULL-BRIDGE)
   ------------------------------------------------------------- */
interface SvgSubProps {
  params: CircuitParameters;
  state: InstantaneousState;
  onToggleSwitch: (switchKey: 's1' | 's2' | 's3' | 's4' | 's5' | 's6') => void;
  isRunning: boolean;
  isDark: boolean;
}

const SinglePhaseCircuitSvg: React.FC<SvgSubProps> = ({
  params,
  state,
  onToggleSwitch,
  isRunning,
  isDark,
}) => {
  const isFull = params.topology === 'full-bridge';
  const hasFWD = params.loadType === 'RL_FWD' || params.showFreewheelingDiode;

  const s1Type = params.individualSwitches?.s1 || (params.switchTech === 'thyristor' ? 'thyristor' : 'diode');
  const s2Type = params.individualSwitches?.s2 || (params.switchTech === 'thyristor' ? 'thyristor' : 'diode');
  const s3Type = params.individualSwitches?.s3 || (params.switchTech === 'thyristor' ? 'thyristor' : 'diode');
  const s4Type = params.individualSwitches?.s4 || (params.switchTech === 'thyristor' ? 'thyristor' : 'diode');

  const s1Active = state.activeSwitches.includes(s1Type === 'thyristor' ? 'T1' : 'D1');
  const s2Active = state.activeSwitches.includes(s2Type === 'thyristor' ? 'T2' : 'D2');
  const s3Active = state.activeSwitches.includes(s3Type === 'thyristor' ? 'T3' : 'D3');
  const s4Active = state.activeSwitches.includes(s4Type === 'thyristor' ? 'T4' : 'D4');
  const fwdActive = state.activeSwitches.includes('D_FW') || state.isFreewheeling;

  const isCurrentFlowing = isRunning && state.iOut > 0.05;
  const isPosHalf = state.vSource >= 0;

  const wireInactive = isDark ? '#334155' : '#64748b';
  const wireActive = isDark ? '#10b981' : '#059669';
  const wireFlow = isDark ? '#34d399' : '#10b981';
  const linePhase = isDark ? '#0284c7' : '#0284c7';
  const textMain = isDark ? '#e2e8f0' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#475569';

  return (
    <g>
      {/* ----------------- AC POWER SOURCE ----------------- */}
      <g transform="translate(75, 230)">
        <circle
          cx="0"
          cy="0"
          r="34"
          className={isDark ? 'fill-slate-950 stroke-cyan-500' : 'fill-white stroke-cyan-600'}
          strokeWidth="2.8"
          filter="url(#glow-cyan)"
        />
        <path
          d="M -18 0 Q -9 -20 0 0 Q 9 20 18 0"
          fill="none"
          stroke={isDark ? '#38bdf8' : '#0284c7'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Terminal polarity marks (+ and -) */}
        <text
          x="0"
          y="-14"
          textAnchor="middle"
          className={`font-mono text-[12px] font-black ${
            isPosHalf ? (isDark ? 'fill-emerald-400' : 'fill-emerald-600') : 'fill-rose-500'
          }`}
        >
          {isPosHalf ? '+' : '−'}
        </text>
        <text
          x="0"
          y="24"
          textAnchor="middle"
          className={`font-mono text-[12px] font-black ${
            !isPosHalf ? (isDark ? 'fill-emerald-400' : 'fill-emerald-600') : 'fill-rose-500'
          }`}
        >
          {!isPosHalf ? '+' : '−'}
        </text>

        <text x="0" y="50" textAnchor="middle" className={`text-[12px] font-bold ${isDark ? 'fill-slate-200' : 'fill-slate-800'}`}>
          AC Mains 1Φ
        </text>
        <text x="0" y="66" textAnchor="middle" className={`font-mono text-[11px] font-semibold ${isDark ? 'fill-cyan-400' : 'fill-cyan-700'}`}>
          vs = {state.vSource.toFixed(1)} V
        </text>
      </g>

      {/* ----------------- CIRCUIT WIRING ----------------- */}
      {/* Top DC Rail (+ Vo) */}
      <path
        d="M 220 80 L 730 80"
        fill="none"
        stroke={isCurrentFlowing && !state.isFreewheeling ? wireActive : wireInactive}
        strokeWidth="3.5"
      />
      {isCurrentFlowing && !state.isFreewheeling && (
        <path
          d="M 220 80 L 730 80"
          fill="none"
          stroke={wireFlow}
          strokeWidth="3.5"
          className="flowing-path-fwd"
        />
      )}

      {/* Bottom DC Rail (- Vo) */}
      <path
        d="M 220 380 L 730 380"
        fill="none"
        stroke={isCurrentFlowing && !state.isFreewheeling ? wireActive : wireInactive}
        strokeWidth="3.5"
      />
      {isCurrentFlowing && !state.isFreewheeling && (
        <path
          d="M 730 380 L 220 380"
          fill="none"
          stroke={wireFlow}
          strokeWidth="3.5"
          className="flowing-path-fwd"
        />
      )}

      {/* Connection from AC Source (+) top to Bridge Leg 1 */}
      <path
        d="M 75 196 L 75 180 L 220 180"
        fill="none"
        stroke={isCurrentFlowing && (s1Active || s4Active) ? wireActive : linePhase}
        strokeWidth="2.5"
      />
      <text x="110" y="172" className={`font-mono text-[11px] font-semibold ${isDark ? 'fill-cyan-300' : 'fill-cyan-800'}`}>
        Phase Line (L)
      </text>

      {/* Animated dots along Phase Line */}
      {isCurrentFlowing && s1Active && (
        <path
          d="M 75 196 L 75 180 L 220 180 L 220 135"
          fill="none"
          stroke={wireFlow}
          strokeWidth="3"
          className="flowing-path-fwd"
        />
      )}
      {isCurrentFlowing && s4Active && (
        <path
          d="M 220 335 L 220 180 L 75 180 L 75 196"
          fill="none"
          stroke={wireFlow}
          strokeWidth="3"
          className="flowing-path-fwd"
        />
      )}

      {/* Connection from AC Source (-) bottom to Bridge Leg 2 or Half-Wave Return */}
      {isFull ? (
        <>
          <path
            d="M 75 264 L 75 280 L 350 280"
            fill="none"
            stroke={isCurrentFlowing && (s3Active || s2Active) ? wireActive : linePhase}
            strokeWidth="2.5"
          />
          <text x="110" y="296" className={`font-mono text-[11px] font-semibold ${isDark ? 'fill-cyan-300' : 'fill-cyan-800'}`}>
            Neutral Line (N)
          </text>

          {isCurrentFlowing && s3Active && (
            <path
              d="M 75 264 L 75 280 L 350 280 L 350 135"
              fill="none"
              stroke={wireFlow}
              strokeWidth="3"
              className="flowing-path-fwd"
            />
          )}
          {isCurrentFlowing && s2Active && (
            <path
              d="M 350 335 L 350 280 L 75 280 L 75 264"
              fill="none"
              stroke={wireFlow}
              strokeWidth="3"
              className="flowing-path-fwd"
            />
          )}
        </>
      ) : (
        <>
          <path
            d="M 730 380 L 75 380 L 75 264"
            fill="none"
            stroke={isCurrentFlowing ? wireActive : linePhase}
            strokeWidth="3"
          />
          <text x="130" y="372" className={`font-mono text-[11px] font-semibold ${isDark ? 'fill-cyan-300' : 'fill-cyan-800'}`}>
            Neutral Return Line (N)
          </text>
          {isCurrentFlowing && (
            <path
              d="M 730 380 L 75 380 L 75 264"
              fill="none"
              stroke={wireFlow}
              strokeWidth="3"
              className="flowing-path-fwd"
            />
          )}
        </>
      )}

      {/* ----------------- SWITCH S1 (Top Left) ----------------- */}
      <path d="M 220 80 L 220 135" fill="none" stroke={s1Active ? wireActive : wireInactive} strokeWidth="2.8" />
      <path d="M 220 180 L 220 135" fill="none" stroke={s1Active ? wireActive : linePhase} strokeWidth="2.8" />
      <SwitchSymbol
        x={220}
        y={135}
        label={`${s1Type === 'thyristor' ? 'T' : 'D'}1`}
        sublabel="Leg 1 (Top)"
        isThyristor={s1Type === 'thyristor'}
        isActive={s1Active}
        isGateActive={state.gatePulse1}
        onClick={() => onToggleSwitch('s1')}
        isDark={isDark}
      />

      {isFull && (
        <>
          {/* Leg 1 Bottom Switch S4 */}
          <path d="M 220 180 L 220 335" fill="none" stroke={s4Active ? wireActive : linePhase} strokeWidth="2.8" />
          <path d="M 220 335 L 220 380" fill="none" stroke={s4Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <SwitchSymbol
            x={220}
            y={335}
            label={`${s4Type === 'thyristor' ? 'T' : 'D'}4`}
            sublabel="Leg 1 (Bot)"
            isThyristor={s4Type === 'thyristor'}
            isActive={s4Active}
            isGateActive={state.gatePulse4}
            onClick={() => onToggleSwitch('s4')}
            isDark={isDark}
          />

          {/* Leg 2 Top Switch S3 */}
          <path d="M 350 80 L 350 135" fill="none" stroke={s3Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <path d="M 350 280 L 350 135" fill="none" stroke={s3Active ? wireActive : linePhase} strokeWidth="2.8" />
          <SwitchSymbol
            x={350}
            y={135}
            label={`${s3Type === 'thyristor' ? 'T' : 'D'}3`}
            sublabel="Leg 2 (Top)"
            isThyristor={s3Type === 'thyristor'}
            isActive={s3Active}
            isGateActive={state.gatePulse3}
            onClick={() => onToggleSwitch('s3')}
            isDark={isDark}
          />

          {/* Leg 2 Bottom Switch S2 */}
          <path d="M 350 280 L 350 335" fill="none" stroke={s2Active ? wireActive : linePhase} strokeWidth="2.8" />
          <path d="M 350 335 L 350 380" fill="none" stroke={s2Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <SwitchSymbol
            x={350}
            y={335}
            label={`${s2Type === 'thyristor' ? 'T' : 'D'}2`}
            sublabel="Leg 2 (Bot)"
            isThyristor={s2Type === 'thyristor'}
            isActive={s2Active}
            isGateActive={state.gatePulse2}
            onClick={() => onToggleSwitch('s2')}
            isDark={isDark}
          />
        </>
      )}

      {/* ----------------- FREEWHEELING DIODE (FWD) BRANCH ----------------- */}
      <g transform="translate(510, 230)">
        {hasFWD ? (
          <>
            <line x1="0" y1="-150" x2="0" y2="-32" stroke={fwdActive ? wireActive : wireInactive} strokeWidth="2.8" />
            <line x1="0" y1="32" x2="0" y2="150" stroke={fwdActive ? wireActive : wireInactive} strokeWidth="2.8" />

            {isCurrentFlowing && fwdActive && (
              <path d="M 0 150 L 0 -150" fill="none" stroke={wireFlow} strokeWidth="3.2" className="flowing-path-fwd" />
            )}

            <rect
              x="-30"
              y="-36"
              width="60"
              height="72"
              rx="12"
              className={
                fwdActive
                  ? isDark
                    ? 'fill-emerald-950/95 stroke-emerald-400'
                    : 'fill-emerald-50 stroke-emerald-600'
                  : isDark
                  ? 'fill-slate-900 stroke-slate-700'
                  : 'fill-white stroke-slate-300'
              }
              strokeWidth="2.2"
              filter={fwdActive ? 'url(#glow-emerald)' : undefined}
            />
            <line
              x1="-16"
              y1="-14"
              x2="16"
              y2="-14"
              stroke={fwdActive ? wireFlow : textMuted}
              strokeWidth="3"
            />
            <polygon
              points="0,-14 -16,18 16,18"
              fill={fwdActive ? wireActive : isDark ? '#1e293b' : '#e2e8f0'}
              stroke={fwdActive ? wireFlow : textMuted}
              strokeWidth="2.2"
            />
            <text x="0" y="38" textAnchor="middle" className={`font-mono text-[10px] font-bold ${isDark ? 'fill-slate-200' : 'fill-slate-800'}`}>
              D_FW
            </text>
            <text
              x="0"
              y="50"
              textAnchor="middle"
              className={`font-mono text-[9px] font-extrabold ${
                fwdActive ? (isDark ? 'fill-emerald-400' : 'fill-emerald-700') : textMuted
              }`}
            >
              {fwdActive ? 'FREEWHEEL' : 'BLOCKING'}
            </text>
          </>
        ) : (
          <g opacity="0.4">
            <line x1="0" y1="-150" x2="0" y2="150" stroke={isDark ? '#475569' : '#94a3b8'} strokeDasharray="4 4" strokeWidth="1.5" />
            <polygon points="0,-12 -14,14 14,14" fill="none" stroke={textMuted} strokeWidth="1.5" />
            <text x="0" y="30" textAnchor="middle" className={`font-mono text-[9px] ${textMuted}`}>
              D_FW (OFF)
            </text>
          </g>
        )}
      </g>

      {/* ----------------- DC LOAD UNIT ----------------- */}
      <g transform="translate(730, 230)">
        <line x1="0" y1="-150" x2="0" y2="-80" stroke={isCurrentFlowing ? wireActive : wireInactive} strokeWidth="3.5" />
        <line x1="0" y1="80" x2="0" y2="150" stroke={isCurrentFlowing ? wireActive : wireInactive} strokeWidth="3.5" />

        {isCurrentFlowing && (
          <path d="M 0 -150 L 0 150" fill="none" stroke={wireFlow} strokeWidth="3.5" className="flowing-path-fwd" />
        )}

        {/* Load Enclosure Box */}
        <rect
          x="-55"
          y="-80"
          width="110"
          height="160"
          rx="14"
          className={isDark ? 'fill-[#0c1322] stroke-cyan-500/80' : 'fill-white stroke-cyan-600'}
          strokeWidth="2.2"
        />

        <text x="0" y="-58" textAnchor="middle" className={`font-bold text-[12px] tracking-wide ${isDark ? 'fill-cyan-300' : 'fill-cyan-800'}`}>
          DC LOAD
        </text>

        {/* Resistor Element R */}
        <g transform="translate(0, -32)">
          <path
            d="M 0 -10 L 10 -5 L -10 0 L 10 5 L -10 10 L 10 15 L 0 20"
            fill="none"
            stroke={isDark ? '#fbbf24' : '#d97706'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text x="18" y="10" className={`font-mono text-[11px] font-bold ${isDark ? 'fill-amber-400' : 'fill-amber-700'}`}>
            R = {params.resistance} Ω
          </text>
        </g>

        {/* Inductor Element L */}
        {(params.loadType === 'RL' || params.loadType === 'RL_FWD' || params.loadType === 'RLE') && (
          <g transform="translate(0, 16)">
            <path
              d="M 0 -12 C 14 -12, 14 -3, 0 -3 C 14 -3, 14 6, 0 6 C 14 6, 14 15, 0 15"
              fill="none"
              stroke={isDark ? '#c084fc' : '#7c3aed'}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <text x="18" y="6" className={`font-mono text-[11px] font-bold ${isDark ? 'fill-purple-300' : 'fill-purple-700'}`}>
              L = {params.inductance} mH
            </text>
          </g>
        )}

        {/* Back EMF Battery E */}
        {params.loadType === 'RLE' && (
          <g transform="translate(0, 48)">
            <line x1="-12" y1="-4" x2="12" y2="-4" stroke="#f43f5e" strokeWidth="3" />
            <line x1="-6" y1="4" x2="6" y2="4" stroke="#f43f5e" strokeWidth="2" />
            <text x="18" y="3" className="fill-rose-500 font-mono text-[11px] font-bold">
              E = {params.backEmf} V
            </text>
          </g>
        )}

        {/* Real-time Load Ammeter Probe */}
        <g transform="translate(0, 95)">
          <rect
            x="-48"
            y="-12"
            width="96"
            height="24"
            rx="6"
            className={isDark ? 'fill-slate-950 stroke-emerald-500' : 'fill-emerald-50 stroke-emerald-600'}
            strokeWidth="1.8"
            filter="url(#glow-emerald)"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            className={`font-mono text-[11px] font-black ${isDark ? 'fill-emerald-300' : 'fill-emerald-800'}`}
          >
            io = +{state.iOut.toFixed(2)} A ▶
          </text>
        </g>
      </g>

      {/* Output Voltage + and - Polarities */}
      <g transform="translate(760, 75)">
        <text
          x="12"
          y="5"
          className={`font-mono text-[12px] font-black ${
            state.vOut >= 0 ? (isDark ? 'fill-emerald-400' : 'fill-emerald-600') : 'fill-rose-500'
          }`}
        >
          + Vo ({state.vOut.toFixed(1)} V)
        </text>
      </g>
      <g transform="translate(760, 385)">
        <text x="12" y="5" className={`font-mono text-[12px] font-bold ${textMuted}`}>
          − Vo (GND)
        </text>
      </g>
    </g>
  );
};

/* -------------------------------------------------------------
   THREE-PHASE CIRCUIT SVG
   ------------------------------------------------------------- */
const ThreePhaseCircuitSvg: React.FC<SvgSubProps> = ({
  params,
  state,
  onToggleSwitch,
  isRunning,
  isDark,
}) => {
  const isFull = params.topology === 'full-bridge';
  const switches = params.individualSwitches || {
    s1: 'thyristor',
    s2: 'thyristor',
    s3: 'thyristor',
    s4: 'thyristor',
    s5: 'thyristor',
    s6: 'thyristor',
  };

  const getP = (type?: 'diode' | 'thyristor') => (type === 'thyristor' ? 'T' : 'D');

  const s1Active = state.activeSwitches.includes(`${getP(switches.s1)}1`);
  const s2Active = state.activeSwitches.includes(`${getP(switches.s2)}2`);
  const s3Active = state.activeSwitches.includes(`${getP(switches.s3)}3`);
  const s4Active = state.activeSwitches.includes(`${getP(switches.s4)}4`);
  const s5Active = state.activeSwitches.includes(`${getP(switches.s5)}5`);
  const s6Active = state.activeSwitches.includes(`${getP(switches.s6)}6`);

  const isCurrentFlowing = isRunning && state.iOut > 0.05;

  const wireInactive = isDark ? '#334155' : '#64748b';
  const wireActive = isDark ? '#10b981' : '#059669';
  const wireFlow = isDark ? '#34d399' : '#10b981';
  const textMuted = isDark ? '#94a3b8' : '#475569';

  return (
    <g>
      {/* 3-Phase Star AC Generator */}
      <g transform="translate(75, 235)">
        <circle
          cx="0"
          cy="0"
          r="34"
          className={isDark ? 'fill-slate-950 stroke-cyan-500' : 'fill-white stroke-cyan-600'}
          strokeWidth="2.8"
          filter="url(#glow-cyan)"
        />
        <path
          d="M 0 0 L 0 -20 M 0 0 L -17 14 M 0 0 L 17 14"
          stroke={isDark ? '#38bdf8' : '#0284c7'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <text x="0" y="48" textAnchor="middle" className={`text-[11px] font-bold ${isDark ? 'fill-slate-200' : 'fill-slate-800'}`}>
          3Φ Star AC
        </text>
        <text x="0" y="64" textAnchor="middle" className={`font-mono text-[10px] ${isDark ? 'fill-cyan-400' : 'fill-cyan-700'}`}>
          {params.vRms}V RMS (415V LL)
        </text>
      </g>

      {/* Phase Lines */}
      {/* Phase A (Red) */}
      <path
        d="M 109 220 L 150 160 L 260 160"
        fill="none"
        stroke={isCurrentFlowing && (s1Active || s4Active) ? '#ef4444' : isDark ? '#991b1b' : '#dc2626'}
        strokeWidth="2.8"
      />
      <text x="165" y="150" className="fill-rose-500 font-mono text-[10px] font-bold">
        Phase A ({state.vSource.toFixed(0)}V)
      </text>
      {isCurrentFlowing && (s1Active || s4Active) && (
        <path
          d="M 109 220 L 150 160 L 260 160"
          fill="none"
          stroke="#f87171"
          strokeWidth="3"
          className={s1Active ? 'flowing-path-fwd' : 'flowing-path-rev'}
        />
      )}

      {/* Phase B (Yellow) */}
      <path
        d="M 109 235 L 370 235"
        fill="none"
        stroke={isCurrentFlowing && (s3Active || s6Active) ? '#eab308' : isDark ? '#854d0e' : '#ca8a04'}
        strokeWidth="2.8"
      />
      <text x="165" y="228" className="fill-amber-600 dark:fill-amber-400 font-mono text-[10px] font-bold">
        Phase B ({(state.vSourceB || 0).toFixed(0)}V)
      </text>
      {isCurrentFlowing && (s3Active || s6Active) && (
        <path
          d="M 109 235 L 370 235"
          fill="none"
          stroke="#fde047"
          strokeWidth="3"
          className={s3Active ? 'flowing-path-fwd' : 'flowing-path-rev'}
        />
      )}

      {/* Phase C (Blue) */}
      <path
        d="M 109 250 L 150 310 L 480 310"
        fill="none"
        stroke={isCurrentFlowing && (s5Active || s2Active) ? '#3b82f6' : isDark ? '#1e3a8a' : '#2563eb'}
        strokeWidth="2.8"
      />
      <text x="165" y="302" className="fill-blue-600 dark:fill-blue-400 font-mono text-[10px] font-bold">
        Phase C ({(state.vSourceC || 0).toFixed(0)}V)
      </text>
      {isCurrentFlowing && (s5Active || s2Active) && (
        <path
          d="M 109 250 L 150 310 L 480 310"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="3"
          className={s5Active ? 'flowing-path-fwd' : 'flowing-path-rev'}
        />
      )}

      {/* Top DC Rail */}
      <path
        d="M 260 80 L 820 80"
        fill="none"
        stroke={isCurrentFlowing ? wireActive : wireInactive}
        strokeWidth="3.5"
      />
      {isCurrentFlowing && (
        <path d="M 260 80 L 820 80" fill="none" stroke={wireFlow} strokeWidth="3.5" className="flowing-path-fwd" />
      )}

      {/* Bottom DC Rail */}
      <path
        d={isFull ? 'M 260 380 L 820 380' : 'M 75 269 L 75 380 L 820 380'}
        fill="none"
        stroke={isCurrentFlowing ? wireActive : wireInactive}
        strokeWidth="3.5"
      />
      {isCurrentFlowing && (
        <path
          d={isFull ? 'M 820 380 L 260 380' : 'M 820 380 L 75 380'}
          fill="none"
          stroke={wireFlow}
          strokeWidth="3.5"
          className="flowing-path-fwd"
        />
      )}

      {/* LEG 1 (Phase A): S1 & S4 */}
      <path d="M 260 80 L 260 135" fill="none" stroke={s1Active ? wireActive : wireInactive} strokeWidth="2.8" />
      <path d="M 260 160 L 260 135" fill="none" stroke={s1Active ? wireActive : '#ef4444'} strokeWidth="2.8" />
      <SwitchSymbol
        x={260}
        y={135}
        label={`${getP(switches.s1)}1`}
        sublabel="Ph A (Top)"
        isThyristor={switches.s1 === 'thyristor'}
        isActive={s1Active}
        isGateActive={state.gatePulse1}
        onClick={() => onToggleSwitch('s1')}
        isDark={isDark}
      />

      {isFull ? (
        <>
          <path d="M 260 160 L 260 335" fill="none" stroke={s4Active ? wireActive : '#ef4444'} strokeWidth="2.8" />
          <path d="M 260 335 L 260 380" fill="none" stroke={s4Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <SwitchSymbol
            x={260}
            y={335}
            label={`${getP(switches.s4)}4`}
            sublabel="Ph A (Bot)"
            isThyristor={switches.s4 === 'thyristor'}
            isActive={s4Active}
            isGateActive={state.gatePulse4}
            onClick={() => onToggleSwitch('s4')}
            isDark={isDark}
          />

          {/* LEG 2 (Phase B): S3 & S6 */}
          <path d="M 370 80 L 370 135" fill="none" stroke={s3Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <path d="M 370 235 L 370 135" fill="none" stroke={s3Active ? wireActive : '#eab308'} strokeWidth="2.8" />
          <SwitchSymbol
            x={370}
            y={135}
            label={`${getP(switches.s3)}3`}
            sublabel="Ph B (Top)"
            isThyristor={switches.s3 === 'thyristor'}
            isActive={s3Active}
            isGateActive={state.gatePulse3}
            onClick={() => onToggleSwitch('s3')}
            isDark={isDark}
          />
          <path d="M 370 235 L 370 335" fill="none" stroke={s6Active ? wireActive : '#eab308'} strokeWidth="2.8" />
          <path d="M 370 335 L 370 380" fill="none" stroke={s6Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <SwitchSymbol
            x={370}
            y={335}
            label={`${getP(switches.s6)}6`}
            sublabel="Ph B (Bot)"
            isThyristor={switches.s6 === 'thyristor'}
            isActive={s6Active}
            isGateActive={state.gatePulse6}
            onClick={() => onToggleSwitch('s6')}
            isDark={isDark}
          />

          {/* LEG 3 (Phase C): S5 & S2 */}
          <path d="M 480 80 L 480 135" fill="none" stroke={s5Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <path d="M 480 310 L 480 135" fill="none" stroke={s5Active ? wireActive : '#3b82f6'} strokeWidth="2.8" />
          <SwitchSymbol
            x={480}
            y={135}
            label={`${getP(switches.s5)}5`}
            sublabel="Ph C (Top)"
            isThyristor={switches.s5 === 'thyristor'}
            isActive={s5Active}
            isGateActive={state.gatePulse5}
            onClick={() => onToggleSwitch('s5')}
            isDark={isDark}
          />
          <path d="M 480 310 L 480 335" fill="none" stroke={s2Active ? wireActive : '#3b82f6'} strokeWidth="2.8" />
          <path d="M 480 335 L 480 380" fill="none" stroke={s2Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <SwitchSymbol
            x={480}
            y={335}
            label={`${getP(switches.s2)}2`}
            sublabel="Ph C (Bot)"
            isThyristor={switches.s2 === 'thyristor'}
            isActive={s2Active}
            isGateActive={state.gatePulse2}
            onClick={() => onToggleSwitch('s2')}
            isDark={isDark}
          />
        </>
      ) : (
        <>
          <path d="M 370 80 L 370 135" fill="none" stroke={s2Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <path d="M 370 235 L 370 135" fill="none" stroke={s2Active ? wireActive : '#eab308'} strokeWidth="2.8" />
          <SwitchSymbol
            x={370}
            y={135}
            label={`${getP(switches.s2)}2`}
            sublabel="Ph B (Top)"
            isThyristor={switches.s2 === 'thyristor'}
            isActive={s2Active}
            isGateActive={state.gatePulse2}
            onClick={() => onToggleSwitch('s2')}
            isDark={isDark}
          />
          <path d="M 480 80 L 480 135" fill="none" stroke={s3Active ? wireActive : wireInactive} strokeWidth="2.8" />
          <path d="M 480 310 L 480 135" fill="none" stroke={s3Active ? wireActive : '#3b82f6'} strokeWidth="2.8" />
          <SwitchSymbol
            x={480}
            y={135}
            label={`${getP(switches.s3)}3`}
            sublabel="Ph C (Top)"
            isThyristor={switches.s3 === 'thyristor'}
            isActive={s3Active}
            isGateActive={state.gatePulse3}
            onClick={() => onToggleSwitch('s3')}
            isDark={isDark}
          />
          <text x="120" y="372" className={`font-mono text-[10px] font-bold ${textMuted}`}>
            Star Neutral Return (N)
          </text>
        </>
      )}

      {/* 3-PHASE LOAD UNIT */}
      <g transform="translate(820, 230)">
        <line x1="0" y1="-150" x2="0" y2="-80" stroke={isCurrentFlowing ? wireActive : wireInactive} strokeWidth="3.5" />
        <line x1="0" y1="80" x2="0" y2="150" stroke={isCurrentFlowing ? wireActive : wireInactive} strokeWidth="3.5" />

        {isCurrentFlowing && (
          <path d="M 0 -150 L 0 150" fill="none" stroke={wireFlow} strokeWidth="3.5" className="flowing-path-fwd" />
        )}

        <rect
          x="-55"
          y="-80"
          width="110"
          height="160"
          rx="14"
          className={isDark ? 'fill-[#0c1322] stroke-cyan-500/80' : 'fill-white stroke-cyan-600'}
          strokeWidth="2.2"
        />

        <text x="0" y="-58" textAnchor="middle" className={`font-bold text-[12px] tracking-wide ${isDark ? 'fill-cyan-300' : 'fill-cyan-800'}`}>
          DC LOAD
        </text>

        <g transform="translate(0, -32)">
          <path
            d="M 0 -10 L 10 -5 L -10 0 L 10 5 L -10 10 L 10 15 L 0 20"
            fill="none"
            stroke={isDark ? '#fbbf24' : '#d97706'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text x="18" y="10" className={`font-mono text-[11px] font-bold ${isDark ? 'fill-amber-400' : 'fill-amber-700'}`}>
            R = {params.resistance} Ω
          </text>
        </g>

        <g transform="translate(0, 16)">
          <path
            d="M 0 -12 C 14 -12, 14 -3, 0 -3 C 14 -3, 14 6, 0 6 C 14 6, 14 15, 0 15"
            fill="none"
            stroke={isDark ? '#c084fc' : '#7c3aed'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text x="18" y="6" className={`font-mono text-[11px] font-bold ${isDark ? 'fill-purple-300' : 'fill-purple-700'}`}>
            L = {params.inductance} mH
          </text>
        </g>

        {/* Real-time Load Ammeter */}
        <g transform="translate(0, 95)">
          <rect
            x="-48"
            y="-12"
            width="96"
            height="24"
            rx="6"
            className={isDark ? 'fill-slate-950 stroke-emerald-500' : 'fill-emerald-50 stroke-emerald-600'}
            strokeWidth="1.8"
            filter="url(#glow-emerald)"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            className={`font-mono text-[11px] font-black ${isDark ? 'fill-emerald-300' : 'fill-emerald-800'}`}
          >
            io = +{state.iOut.toFixed(2)} A ▶
          </text>
        </g>
      </g>

      <text x="850" y="75" className={`font-mono text-[12px] font-bold ${isDark ? 'fill-emerald-400' : 'fill-emerald-600'}`}>
        + Vo ({state.vOut.toFixed(1)} V)
      </text>
      <text x="850" y="385" className={`font-mono text-[12px] font-bold ${textMuted}`}>
        − Vo (GND)
      </text>
    </g>
  );
};

/* -------------------------------------------------------------
   REUSABLE ELECTRICAL SWITCH SYMBOL
   ------------------------------------------------------------- */
interface SwitchSymbolProps {
  x: number;
  y: number;
  label: string;
  sublabel: string;
  isThyristor: boolean;
  isActive: boolean;
  isGateActive?: boolean;
  onClick: () => void;
  isDark: boolean;
}

const SwitchSymbol: React.FC<SwitchSymbolProps> = ({
  x,
  y,
  label,
  sublabel,
  isThyristor,
  isActive,
  isGateActive,
  onClick,
  isDark,
}) => {
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer group" onClick={onClick}>
      {/* Outer Enclosure Box */}
      <rect
        x="-28"
        y="-32"
        width="56"
        height="64"
        rx="12"
        className={`transition-all duration-200 ${
          isActive
            ? isDark
              ? 'fill-emerald-950/95 stroke-emerald-400 shadow-xl'
              : 'fill-emerald-50 stroke-emerald-600 shadow-md'
            : isDark
            ? 'fill-slate-900/90 stroke-slate-700 group-hover:stroke-cyan-500'
            : 'fill-white stroke-slate-300 group-hover:stroke-cyan-600 shadow-xs'
        }`}
        strokeWidth={isActive ? '2.5' : '1.6'}
        filter={isActive ? 'url(#glow-emerald)' : undefined}
      />

      {/* Cathode terminal bar at top */}
      <line
        x1="-15"
        y1="-13"
        x2="15"
        y2="-13"
        stroke={isActive ? (isDark ? '#34d399' : '#059669') : isDark ? '#94a3b8' : '#64748b'}
        strokeWidth="3"
      />

      {/* Anode triangle pointing up towards cathode */}
      <polygon
        points="0,-13 -15,15 15,15"
        fill={isActive ? (isDark ? '#10b981' : '#059669') : isDark ? '#1e293b' : '#e2e8f0'}
        stroke={isActive ? (isDark ? '#34d399' : '#059669') : isDark ? '#94a3b8' : '#64748b'}
        strokeWidth="2.2"
      />

      {/* Thyristor Gate Terminal with Trigger Pulse Flash */}
      {isThyristor && (
        <g>
          <path
            d="M -15 10 L -22 16 L -26 16"
            fill="none"
            stroke={isGateActive ? '#f59e0b' : isDark ? '#64748b' : '#94a3b8'}
            strokeWidth="2.2"
          />
          <text
            x="-25"
            y="11"
            className={`font-mono text-[8px] font-extrabold ${
              isGateActive ? 'fill-amber-500' : isDark ? 'fill-slate-500' : 'fill-slate-400'
            }`}
          >
            G
          </text>
          {isGateActive && (
            <circle cx="-26" cy="16" r="4" fill="#f59e0b" filter="url(#glow-amber)" />
          )}
        </g>
      )}

      {/* Switch Label (e.g. T1, D1) */}
      <text
        x="0"
        y="-19"
        textAnchor="middle"
        className={`font-mono text-[11px] font-black ${
          isActive
            ? isDark
              ? 'fill-emerald-300'
              : 'fill-emerald-700'
            : isDark
            ? 'fill-slate-200'
            : 'fill-slate-800'
        }`}
      >
        {label}
      </text>

      {/* ON / OFF State text */}
      <text
        x="0"
        y="26"
        textAnchor="middle"
        className={`font-mono text-[9px] font-black tracking-wider ${
          isActive
            ? isDark
              ? 'fill-emerald-300'
              : 'fill-emerald-700'
            : isDark
            ? 'fill-slate-500'
            : 'fill-slate-400'
        }`}
      >
        {isActive ? 'ON' : 'OFF'}
      </text>
    </g>
  );
};
