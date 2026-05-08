import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, AlertTriangle, Users2, Activity, Download, X } from 'lucide-react';

const SimilarityHeatmap = ({ data, thresholds = { highRisk: 75, suspicious: 40 }, animateCells = true, onPairSelect }) => {
  const [selectedPair, setSelectedPair] = useState(null);
  
  if (!data) {
    return (
      <div className="glass-card flex min-h-[600px] h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-cyan-100/30 p-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-100/25 bg-cyan-900/40">
          <Activity className="text-cyan-100/55" size={32} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-white">No Active Dataset</h3>
        <p className="max-w-sm text-cyan-100/65">Upload a collection of code submissions to generate the structural similarity matrix.</p>
      </div>
    );
  }

  const { students, matrix, rings } = data;
  const highRiskThreshold = thresholds.highRisk ?? 75;
  const suspiciousThreshold = thresholds.suspicious ?? 40;

  const exportMatrixCsv = () => {
    const csvRows = [
      ['File'].concat(students),
      ...students.map((student, i) => [student].concat(matrix[i].map(v => v.toFixed(1))))
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagshield-matrix-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h3 className="font-display flex items-center gap-4 text-2xl font-black text-white sm:text-3xl">
            <Layers className="text-cyan-300" /> Matrix Analysis
          </h3>
          <p className="mt-1 text-cyan-100/65">Cross-referencing {students.length} unique submissions</p>
        </div>
        <div className="flex gap-2">
          {rings.length > 0 && (
            <div className="flex animate-pulse items-center gap-2 rounded-xl border border-rose-100/35 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-100">
              <AlertTriangle size={14} /> {rings.length} COLLABORATION RINGS
            </div>
          )}
          <button
            onClick={exportMatrixCsv}
            className="flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-cyan-950/60 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-900/80"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1 overflow-x-auto pb-4">
          <table className="border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-10 w-32 bg-[#041825]/90 p-2 text-left text-[10px] font-black uppercase tracking-tighter text-cyan-100/60 border-b border-r border-cyan-100/20"></th>
                {students.map((student, i) => (
                  <th 
                    key={i} 
                    className="sticky top-0 z-10 bg-[#041825]/90 p-2 min-w-[50px] text-center text-[9px] font-black uppercase tracking-tighter text-cyan-100/60 border-b border-cyan-100/20"
                    title={student}
                  >
                    <div className="transform -rotate-45 whitespace-nowrap origin-center w-24 h-24 flex items-center justify-center">
                      {student.split('.')[0].substring(0, 10)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td className="sticky left-0 z-10 bg-[#041825]/90 whitespace-nowrap border-r border-b border-cyan-100/20 p-2 pr-3 text-left text-xs font-bold text-cyan-100/80">
                    <div className="max-w-[120px] truncate" title={students[i]}>
                      {students[i].substring(0, 15)}
                    </div>
                  </td>
                  {row.map((score, j) => {
                    const isPair = i !== j;
                    const isHighRisk = isPair && score > highRiskThreshold;
                    const isSuspicious = isPair && score >= suspiciousThreshold && score <= highRiskThreshold;
                    
                    return (
                      <td key={j} className="p-0 border-b border-cyan-100/10">
                        <motion.button
                          initial={animateCells ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={animateCells ? { delay: (i + j) * 0.02 } : { duration: 0 }}
                          onClick={() => {
                            if (isPair && (isHighRisk || isSuspicious)) {
                              setSelectedPair({ i, j, score, students: [students[i], students[j]] });
                              onPairSelect?.({ student1: students[i], student2: students[j] });
                            }
                          }}
                          className={`flex h-12 w-12 items-center justify-center text-[11px] font-black transition-all hover:scale-110 ${
                            isPair ? 'cursor-pointer' : 'cursor-default opacity-40'
                          }`}
                          style={{ 
                            backgroundColor: isHighRisk ? 'rgba(244, 63, 94, 0.85)' : 
                                             isSuspicious ? 'rgba(245, 158, 11, 0.75)' : 
                                             score > 15 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(7, 42, 60, 0.35)',
                            color: score > 15 ? 'white' : 'rgba(172, 215, 236, 0.45)',
                            border: (isHighRisk || isSuspicious) ? '1px solid rgba(255,255,255,0.15)' : 'none'
                          }}
                          title={`${students[i]} vs ${students[j]}: ${score.toFixed(1)}%`}
                        >
                          {score > 10 && isPair ? Math.round(score) : ''}
                        </motion.button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-80">
          <div className="rounded-3xl border border-cyan-100/15 bg-cyan-500/5 p-6">
            <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-cyan-100/65">Legend</h4>
            <div className="space-y-4">
              <LegendItem color="bg-rose-500" label="High Risk" range={`>${highRiskThreshold}%`} />
              <LegendItem color="bg-amber-500" label="Suspicious" range={`${suspiciousThreshold}-${highRiskThreshold}%`} />
              <LegendItem color="bg-emerald-500" label="Safe" range={`0-${suspiciousThreshold}%`} />
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-100/15 bg-cyan-900/25 p-6">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-200">
              <Users2 size={14}/> Ring Clusters
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {rings.length === 0 ? (
                <p className="text-xs italic text-cyan-100/55">No collaborative networks found in this batch.</p>
              ) : (
                rings.map((ring, i) => (
                  <div key={i} className="rounded-xl border border-cyan-100/15 bg-[#062538]/70 p-3">
                    <p className="mb-1 text-[10px] font-bold text-cyan-100/65">CLUSTER #{i + 1}</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(ring).map(s => (
                        <span key={s} className="rounded bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-100 truncate max-w-[120px]" title={s}>
                          {s.split('.')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPair(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl max-w-md w-full p-8 border border-cyan-100/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold text-white">Pair Analysis</h3>
                <button onClick={() => setSelectedPair(null)} className="text-cyan-100/60 hover:text-cyan-100">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-100/60 mb-2">Files</p>
                  <p className="text-sm font-mono bg-cyan-950/60 p-3 rounded-lg text-cyan-50 truncate" title={selectedPair.students[0]}>
                    {selectedPair.students[0]}
                  </p>
                  <p className="text-center text-cyan-100/50 my-2">vs</p>
                  <p className="text-sm font-mono bg-cyan-950/60 p-3 rounded-lg text-cyan-50 truncate" title={selectedPair.students[1]}>
                    {selectedPair.students[1]}
                  </p>
                </div>
                
                <div className="rounded-xl border border-cyan-100/15 bg-[#062333]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-100/60 mb-2">Similarity Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-cyan-950/60 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${selectedPair.score > 75 ? 'bg-rose-500' : selectedPair.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(selectedPair.score, 100)}%` }}
                      />
                    </div>
                    <span className="font-display text-2xl font-bold text-white whitespace-nowrap">
                      {selectedPair.score.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPair(null);
                    onPairSelect?.({ student1: selectedPair.students[0], student2: selectedPair.students[1] });
                  }}
                  className="w-full mt-6 rounded-xl border border-cyan-100/20 bg-cyan-950/60 px-4 py-2.5 font-semibold text-cyan-100 transition-colors hover:bg-cyan-900/80"
                >
                  View Detailed Diff →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LegendItem = ({ color, label, range }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 ${color} rounded-full`}></div>
      <span className="text-xs font-semibold text-cyan-100/85">{label}</span>
    </div>
    <span className="text-[10px] font-mono text-cyan-100/55">{range}</span>
  </div>
);

export default SimilarityHeatmap;
