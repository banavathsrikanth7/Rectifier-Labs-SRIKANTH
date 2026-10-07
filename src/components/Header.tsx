import React, { useState } from 'react';
import { BookOpen, RotateCcw, Sparkles, Moon, Sun, Maximize, Minimize, HelpCircle } from 'lucide-react';
import { LAB_EXPERIMENTS } from '../data/labExperiments';
import { LabExperiment } from '../types';

interface HeaderProps {
  onOpenDerivations: () => void;
  onOpenTheory: () => void;
  onApplyExperiment: (exp: LabExperiment) => void;
  onResetAll: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDerivations,
  onOpenTheory,
  onApplyExperiment,
  onResetAll,
  theme,
  onToggleTheme,
  isFullScreen,
  onToggleFullScreen,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b backdrop-blur-md ${
        isDark
          ? 'bg-slate-950/95 border-slate-800/80 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone with student name prominent directly below */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-black text-base shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400">
              ⚡
            </span>
            <div className="flex items-baseline gap-2.5">
              <h1 className={`text-xl font-extrabold tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Rectifier<span className="text-cyan-500">Lab</span>
              </h1>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold tracking-wide border ${
                  isDark
                    ? 'text-cyan-300 bg-cyan-950/80 border-cyan-800/80'
                    : 'text-cyan-700 bg-cyan-50 border-cyan-200'
                }`}
              >
                Power Electronics Virtual Laboratory
              </span>
            </div>
          </div>

          {/* Student name directly below Rectifier heading as requested */}
          <div className="flex items-center gap-2 mt-1 pl-10.5">
            <span
              className={`text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Banavath Srikanth · 24EE10045
            </span>
            <span className={isDark ? 'text-slate-600 text-xs' : 'text-slate-300 text-xs'}>•</span>
            <span
              className={`text-[11px] font-medium hidden md:inline ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              IIT Kharagpur Virtual Rectifier Experimentation Studio
            </span>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Full Screen Studio */}
          <button
            onClick={onToggleFullScreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isFullScreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-cyan-500" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-cyan-500" />
                <span>Full Screen</span>
              </>
            )}
          </button>

          {/* Golden Waveform Analysis & Derivations Button */}
          <button
            onClick={onOpenDerivations}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 border ${
              isDark
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-amber-500/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Waveform Analysis & Derivations</span>
          </button>

          {/* IIT Kharagpur Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Lab Presets</span>
            </button>

            {showPresetsMenu && (
              <div
                className={`absolute right-0 mt-2 w-80 rounded-xl border shadow-2xl p-2 z-50 flex flex-col gap-1 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  IIT Kharagpur Experiments
                </div>
                {LAB_EXPERIMENTS.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => {
                      onApplyExperiment(exp);
                      setShowPresetsMenu(false);
                    }}
                    className={`text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                      isDark
                        ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-cyan-600 dark:text-cyan-300">{exp.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{exp.subtitle}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theory / Manual Button */}
          <button
            onClick={onOpenTheory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>Lab Manual & Viva</span>
          </button>

          {/* Reset All Parameters */}
          <button
            onClick={onResetAll}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
            }`}
            title="Reset All Parameters to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
