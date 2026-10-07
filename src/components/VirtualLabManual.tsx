import React, { useState } from 'react';
import { LabExperiment, ObservationRecord, CircuitParameters, PerformanceMetrics } from '../types';
import { LAB_EXPERIMENTS, VIVA_QUESTIONS } from '../data/labExperiments';
import {
  FlaskConical,
  Table,
  HelpCircle,
  Play,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VirtualLabManualProps {
  currentParams: CircuitParameters;
  currentMetrics: PerformanceMetrics;
  onApplyExperiment: (exp: LabExperiment) => void;
  observations: ObservationRecord[];
  onAddObservation: () => void;
  onClearObservations: () => void;
  theme?: 'dark' | 'light';
}

export const VirtualLabManual: React.FC<VirtualLabManualProps> = ({
  currentParams,
  currentMetrics,
  onApplyExperiment,
  observations,
  onAddObservation,
  onClearObservations,
  theme = 'dark',
}) => {
  const [activeSection, setActiveSection] = useState<'manual' | 'table' | 'quiz'>('manual');
  const [selectedExpId, setSelectedExpId] = useState<string>(LAB_EXPERIMENTS[0].id);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  const isDark = theme === 'dark';
  const selectedExp = LAB_EXPERIMENTS.find((e) => e.id === selectedExpId) || LAB_EXPERIMENTS[0];

  // Export observations to CSV
  const exportCsv = () => {
    if (observations.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'Circuit',
      'Alpha (deg)',
      'Load',
      'V_rms_in (V)',
      'V_dc_Theor (V)',
      'V_dc_Sim (V)',
      'V_rms_out (V)',
      'I_dc (A)',
      'Ripple_Factor',
      'THD (%)',
      'Efficiency (%)',
    ];
    const rows = observations.map((r) => [
      r.id,
      r.timestamp,
      `"${r.circuitName}"`,
      r.alpha,
      `"${r.loadDesc}"`,
      r.vSourceRms,
      r.vDcTheoretical.toFixed(2),
      r.vDcSimulated.toFixed(2),
      r.vRmsSimulated.toFixed(2),
      r.iDcSimulated.toFixed(2),
      r.rippleFactor.toFixed(3),
      r.thdPercent.toFixed(1),
      r.efficiencyPercent.toFixed(1),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rectifier_lab_observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit quiz
  const handleQuizSubmit = () => {
    setSubmittedQuiz(true);
    let correctCount = 0;
    VIVA_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) correctCount++;
    });
    if (correctCount >= 7) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const headerBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const subCardBg = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const innerBox = isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700';
  const textTitle = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`${cardBg} border rounded-xl overflow-hidden shadow-xl transition-colors duration-200`}>
      {/* Navigation tabs */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b ${headerBg}`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <FlaskConical className="w-4 h-4" />
          </div>
          <span className={`text-sm font-bold ${textTitle}`}>
            Virtual Laboratory Experimental Suite
          </span>
          <span className={`text-xs ${textMuted}`}>· IIT Kharagpur Reference</span>
        </div>

        <div className={`flex items-center gap-1.5 p-1 rounded-lg border text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveSection('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeSection === 'manual'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : `${textMuted} hover:text-cyan-600`
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab Procedures</span>
          </button>
          <button
            onClick={() => setActiveSection('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeSection === 'table'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : `${textMuted} hover:text-cyan-600`
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Observation Table ({observations.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeSection === 'quiz'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : `${textMuted} hover:text-cyan-600`
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Viva Voce Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {/* TAB 1: LAB PROCEDURES */}
        {activeSection === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Experiment Selection List */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <span className={`text-xs font-semibold ${textMuted} uppercase tracking-wider`}>
                Select Laboratory Experiment
              </span>
              <div className="flex flex-col gap-1.5">
                {LAB_EXPERIMENTS.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExpId(exp.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedExpId === exp.id
                        ? isDark
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-slate-100 shadow-md'
                          : 'bg-cyan-50 border-cyan-300 text-cyan-900 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`text-xs font-bold ${selectedExpId === exp.id ? (isDark ? 'text-cyan-300' : 'text-cyan-800') : textTitle}`}>
                      {exp.title}
                    </div>
                    <div className={`text-[11px] ${textMuted} mt-0.5 line-clamp-1`}>{exp.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Selected Experiment Dossier */}
            <div className={`lg:col-span-8 flex flex-col gap-5 p-5 rounded-2xl border ${subCardBg}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-700/40 pb-4">
                <div>
                  <h3 className={`text-base font-bold ${textTitle}`}>{selectedExp.title}</h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">{selectedExp.subtitle}</p>
                </div>
                <button
                  onClick={() => onApplyExperiment(selectedExp)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load Preset into Simulator</span>
                </button>
              </div>

              {/* Aim */}
              <div>
                <h4 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-1.5`}>
                  1. Objective / Aim
                </h4>
                <p className={`text-xs leading-relaxed p-3 rounded-lg border ${innerBox}`}>
                  {selectedExp.aim}
                </p>
              </div>

              {/* Apparatus */}
              <div>
                <h4 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-1.5`}>
                  2. Apparatus & Components Required
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                  {selectedExp.apparatus.map((app, idx) => (
                    <li key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${innerBox}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Procedure */}
              <div>
                <h4 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-1.5`}>
                  3. Experimental Procedure
                </h4>
                <ol className="space-y-1.5 text-xs">
                  {selectedExp.procedureSteps.map((step, idx) => (
                    <li key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${innerBox}`}>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Formulas */}
              <div>
                <h4 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-1.5`}>
                  4. Governing Theoretical Formulas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedExp.keyFormulas.map((f, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border font-mono text-xs ${innerBox}`}>
                      <span className={`font-sans font-semibold text-[11px] block ${textTitle}`}>{f.label}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold block my-1">{f.formula}</span>
                      <span className={`text-[10px] ${textMuted} font-sans block`}>{f.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OBSERVATION TABLE & DATA LOGGER */}
        {activeSection === 'table' && (
          <div className="flex flex-col gap-5">
            {/* Action Bar */}
            <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border ${subCardBg}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={onAddObservation}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Log Live Measurement</span>
                </button>
                <span className={`text-xs ${textMuted}`}>
                  Records instantaneous simulator state into observation matrix
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportCsv}
                  disabled={observations.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={onClearObservations}
                  disabled={observations.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 font-semibold text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`font-mono text-[11px] uppercase ${isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'} border-b border-slate-700/40`}>
                  <tr>
                    <th className="py-2.5 px-3">Record ID</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Circuit Config</th>
                    <th className="py-2.5 px-3">α (deg)</th>
                    <th className="py-2.5 px-3">V_in (RMS)</th>
                    <th className="py-2.5 px-3">V_dc Theor</th>
                    <th className="py-2.5 px-3">V_dc Sim</th>
                    <th className="py-2.5 px-3">V_rms Sim</th>
                    <th className="py-2.5 px-3">I_dc Sim</th>
                    <th className="py-2.5 px-3">Ripple Factor</th>
                    <th className="py-2.5 px-3">THD (%)</th>
                    <th className="py-2.5 px-3">Efficiency</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                  {observations.length === 0 ? (
                    <tr>
                      <td colSpan={12} className={`text-center py-8 ${textMuted}`}>
                        No observation records logged yet. Click <strong>"Log Live Measurement"</strong> above to capture measurements.
                      </td>
                    </tr>
                  ) : (
                    observations.map((rec) => (
                      <tr key={rec.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{rec.id}</td>
                        <td className="py-2 px-3 text-slate-400">{rec.timestamp}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{rec.circuitName}</td>
                        <td className="py-2 px-3 text-amber-600 dark:text-amber-400 font-bold">{rec.alpha}°</td>
                        <td className="py-2 px-3">{rec.vSourceRms} V</td>
                        <td className="py-2 px-3 text-slate-400">{rec.vDcTheoretical.toFixed(1)} V</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{rec.vDcSimulated.toFixed(1)} V</td>
                        <td className="py-2 px-3">{rec.vRmsSimulated.toFixed(1)} V</td>
                        <td className="py-2 px-3 text-cyan-600 dark:text-cyan-400">{rec.iDcSimulated.toFixed(2)} A</td>
                        <td className="py-2 px-3 text-rose-600 dark:text-rose-400">{rec.rippleFactor.toFixed(3)}</td>
                        <td className="py-2 px-3">{rec.thdPercent.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">{rec.efficiencyPercent.toFixed(1)}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VIVA VOCE QUIZ */}
        {activeSection === 'quiz' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${subCardBg}`}>
              <div>
                <h3 className={`text-sm font-bold ${textTitle}`}>Power Electronics Comprehensive Viva Voce Examination</h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  10 Questions covering single-phase & three-phase line commutation, thyristor control, and harmonic standards.
                </p>
              </div>
              {submittedQuiz && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                  <span>Score: {Object.entries(userAnswers).filter(([qid, aid]) => aid === VIVA_QUESTIONS.find((q) => q.id === parseInt(qid))?.correctIndex).length} / {VIVA_QUESTIONS.length}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {VIVA_QUESTIONS.map((q) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCorrect = userAnswers[q.id] === q.correctIndex;

                return (
                  <div key={q.id} className={`p-4 rounded-xl border ${innerBox}`}>
                    <div className="flex items-start gap-2.5 mb-3">
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-xs">{q.id}.</span>
                      <p className={`text-xs font-semibold ${textTitle}`}>{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers[q.id] === optIdx;
                        let btnStyle = isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

                        if (submittedQuiz) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-600 dark:text-emerald-300 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-500/15 border-rose-500/60 text-rose-600 dark:text-rose-300';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-cyan-500/20 border-cyan-500/60 text-cyan-700 dark:text-cyan-300 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={submittedQuiz}
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                            {submittedQuiz && isSelected && !isCorrect && (
                              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className={`mt-3 p-2.5 rounded-lg border text-[11px] ${isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <strong className="text-cyan-600 dark:text-cyan-400 font-semibold block mb-0.5">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pb-6">
              {!submittedQuiz ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  Submit Viva Answers
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setSubmittedQuiz(false);
                  }}
                  className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
