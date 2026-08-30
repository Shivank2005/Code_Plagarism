import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Download, Layers, Palette, Users2, X, Maximize2, Minimize2 } from 'lucide-react';

const SimilarityHeatmap = ({ data, thresholds = { highRisk: 75, suspicious: 40 }, animateCells = true, onPairSelect }) => {
  const [selectedPair, setSelectedPair] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!data) {
    return (
      <div className="glass-card flex min-h-[600px] h-full flex-col items-center justify-center rounded-[2rem] border border-[var(--border-default)] p-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <Activity className="text-[var(--text-tertiary)]" size={28} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-[var(--text-primary)]">No active dataset</h3>
        <p className="max-w-sm text-sm leading-6 text-[var(--text-tertiary)]">
          Upload a collection of code submissions to generate a similarity matrix and inspect relationships.
        </p>
      </div>
    );
  }

  const { students, matrix, rings } = data;
  const highRiskThreshold = thresholds.highRisk ?? 75;
  const suspiciousThreshold = thresholds.suspicious ?? 40;
  const compactCellSize = students.length <= 6 ? 42 : students.length <= 8 ? 36 : students.length <= 10 ? 30 : 26;

  const exportMatrixCsv = () => {
    const csvRows = [
      ['File'].concat(students),
      ...students.map((student, index) => [student].concat(matrix[index].map((value) => value.toFixed(1)))),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagshield-matrix-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const highRiskCount = Math.round(matrix.flat().filter((score) => score > highRiskThreshold && score < 100).length / 2);
  const suspiciousCount = Math.round(
    matrix.flat().filter((score) => score >= suspiciousThreshold && score <= highRiskThreshold).length / 2,
  );

  const content = (
    <div className={`glass-card rounded-[2rem] border border-[var(--border-default)] p-6 shadow-[0_16px_40px_rgba(1,4,9,0.35)] sm:p-8 lg:p-10 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[99999] overflow-y-auto bg-[var(--bg-primary)] shadow-2xl' : 'relative h-full w-full'}`}>
      {isFullscreen && (
        <button 
          onClick={() => setIsFullscreen(false)}
          className="fixed top-8 right-8 z-[100000] rounded-full bg-[var(--bg-secondary)] p-3 text-white border border-[var(--border-default)] shadow-2xl hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-colors"
        >
          <Minimize2 size={24} />
        </button>
      )}

      {!isFullscreen && (
<div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--accent)]">
              <Layers size={18} />
            </span>
            <div>
              <div className="flex items-center gap-4">
              <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">Matrix analysis</h3>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="rounded-full bg-[var(--bg-secondary)] p-2 text-[var(--text-tertiary)] border border-[var(--border-default)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-colors"
                title="Toggle Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
              <p className="text-sm text-[var(--text-tertiary)]">Compact similarity map with a sequential palette like your reference heatmap.</p>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-[var(--text-tertiary)]">
            Cross-referencing {students.length} submissions. Select a cell to open a detailed pair review, or export the matrix for offline inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
            {rings.length} collaboration rings
          </div>
          <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
            {highRiskCount} high risk
          </div>
          <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
            {suspiciousCount} suspicious
          </div>
          <button
            onClick={exportMatrixCsv}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/50 hover:text-white"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      )}
      <div className={`grid gap-6 ${isFullscreen ? "h-full" : "2xl:grid-cols-[minmax(0,1fr)_280px]"}`}>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)]">
          <div className="overflow-x-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent">
            <table className="w-full min-w-max table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-20 border-b border-r border-[var(--border-default)] bg-[var(--bg-secondary)] px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]" style={{ width: `${Math.max(120, compactCellSize * 3.6)}px` }}>
                    Files
                  </th>
                  {students.map((student) => (
                    <th
                      key={student}
                      className="sticky top-0 z-10 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-1 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]"
                      style={{ width: `${compactCellSize}px` }}
                      title={student}
                    >
                      <div className="mx-auto flex h-12 items-center justify-center whitespace-nowrap text-[9px] leading-none text-[var(--text-secondary)] [-webkit-transform:rotate(-45deg)] [transform:rotate(-45deg)]">
                        {student.split('/').pop()?.split('.')[0].substring(0, 8)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={students[rowIndex]}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-[var(--border-default)] bg-[var(--bg-secondary)] px-2 py-2 text-left text-xs font-medium text-[var(--text-secondary)]" style={{ width: `${Math.max(120, compactCellSize * 3.6)}px` }}>
                      <div className="max-w-[7rem] truncate sm:max-w-[10rem]" title={students[rowIndex]}>
                        {students[rowIndex]}
                      </div>
                    </td>

                    {row.map((score, colIndex) => {
                      const isPair = rowIndex !== colIndex;
                      const isHighRisk = isPair && score > highRiskThreshold;
                      const isSuspicious = isPair && score >= suspiciousThreshold && score <= highRiskThreshold;

                      const normalizedScore = Math.max(0, Math.min(score, 100)) / 100;
                      const cellTone = isPair
                        ? `hsl(${214 - normalizedScore * 78} ${78 + normalizedScore * 6}% ${24 + normalizedScore * 22}%)`
                        : 'hsl(219 76% 36%)';

                      return (
                        <td key={`${rowIndex}-${colIndex}`} className="border-b border-[var(--border-default)] p-0" style={{ width: `${compactCellSize}px` }}>
                          <motion.button
                            initial={animateCells ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={animateCells ? { delay: (rowIndex + colIndex) * 0.012 } : { duration: 0 }}
                            onClick={() => {
                              if (isPair && (isHighRisk || isSuspicious)) {
                                setSelectedPair({ rowIndex, colIndex, score, students: [students[rowIndex], students[colIndex]] });
                                onPairSelect?.({ student1: students[rowIndex], student2: students[colIndex] });
                              }
                            }}
                            className={`flex items-center justify-center text-[11px] font-semibold transition-all duration-200 ${
                              isPair ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'
                            }`}
                            style={{
                              width: `${compactCellSize}px`,
                              height: `${compactCellSize}px`,
                              backgroundColor: cellTone,
                              color: '#f8fafc',
                              borderRight: '1px solid rgba(48, 54, 61, 0.7)',
                            }}
                            title={`${students[rowIndex]} vs ${students[colIndex]}: ${score.toFixed(1)}%`}
                          >
                            {isPair && score > 10 ? Math.round(score) : ''}
                          </motion.button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3 text-xs text-[var(--text-tertiary)]">
            Select a colored cell to open the pair review modal. Muted cells are self-comparisons or low-signal matches.
          </div>
        </div>

        {!isFullscreen && (
        <div className="space-y-5">
          {/* SCALE PANEL */}
          <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] p-5 shadow-lg transition-all hover:border-[var(--accent)]/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            <div className="relative z-10 mb-5 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                <Palette size={13} className="text-[var(--accent)]" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Risk Scale</h4>
            </div>
            
            {/* Gradient Bar */}
            <div className="relative z-10 mb-5 h-2 w-full rounded-full bg-gradient-to-r from-[hsl(214,78%,24%)] via-[hsl(175,81%,35%)] to-[hsl(136,84%,46%)] shadow-[0_0_10px_rgba(34,197,94,0.2)]"></div>

            <div className="relative z-10 space-y-3">
              <LegendItem color="bg-[hsl(214,78%,45%)] shadow-[0_0_8px_hsla(214,78%,45%,0.4)]" label="Low Risk" range={`0-${suspiciousThreshold}%`} />
              <LegendItem color="bg-[hsl(175,81%,40%)] shadow-[0_0_8px_hsla(175,81%,40%,0.4)]" label="Suspicious" range={`${suspiciousThreshold}-${highRiskThreshold}%`} />
              <LegendItem color="bg-[hsl(136,84%,46%)] shadow-[0_0_8px_hsla(136,84%,46%,0.4)]" label="High Risk" range={`>${highRiskThreshold}%`} />
            </div>
          </div>

          {/* CLUSTERS PANEL */}
          <div className="group relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] p-5 shadow-lg transition-all hover:border-[var(--accent)]/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            
            <div className="relative z-10 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                  <Users2 size={13} className="text-[var(--accent)]" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Ring Clusters</h4>
              </div>
              {rings.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success)]/20 text-[10px] font-bold text-[var(--success)]">
                  {rings.length}
                </span>
              )}
            </div>

            <div className="relative z-10 max-h-80 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border-default)]">
              {rings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] py-6 text-center">
                  <span className="text-xl opacity-50">🛡️</span>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">No collaborative networks<br/>found in this batch.</p>
                </div>
              ) : (
                rings.map((ring, index) => {
                  const isHighDensity = ring.density >= 0.8;
                  const isMediumDensity = ring.density >= 0.5 && ring.density < 0.8;
                  const glowColor = isHighDensity ? 'bg-[var(--danger)]' : isMediumDensity ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]';
                  const textColor = isHighDensity ? 'text-[var(--danger)]' : isMediumDensity ? 'text-[var(--warning)]' : 'text-[var(--accent)]';
                  
                  return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index} 
                    className="relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]/50 p-3 transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--bg-secondary)]"
                  >
                    {/* Subtle glow based on classification */}
                    <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full ${glowColor} opacity-10 blur-xl`}></div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${textColor}`}>{ring.classification}</p>
                        <span className="shrink-0 whitespace-nowrap rounded-md bg-[var(--border-default)]/50 px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">{ring.members.length} files</span>
                      </div>
                      
                      {/* Cluster Stats */}
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] border-y border-[var(--border-default)]/30 py-1.5 mb-1.5">
                        <div title="Average similarity across all valid edges">
                          <span className="font-semibold text-[var(--text-secondary)]">{Math.round(ring.averageSimilarity)}%</span> Avg
                        </div>
                        <div title="Highest similarity connection in the cluster">
                          <span className="font-semibold text-[var(--text-secondary)]">{Math.round(ring.maxSimilarity)}%</span> Peak
                        </div>
                        <div title={`Density: ${ring.connections} out of ${ring.possibleConnections} possible connections`}>
                          <span className="font-semibold text-[var(--text-secondary)]">{Math.round(ring.density * 100)}%</span> Density
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {ring.members.map((student) => (
                        <div
                          key={student}
                          className="flex max-w-[120px] items-center gap-1.5 truncate rounded-md border border-[var(--border-default)]/50 bg-[var(--bg-primary)] px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-tertiary)]"
                          title={student}
                        >
                          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${glowColor}`}></div>
                          <span className="truncate">{student.split('.')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )})
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPair(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.97, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-[0_20px_60px_rgba(1,4,9,0.5)]"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">Pair review</h3>
                  <p className="text-sm text-[var(--text-tertiary)]">Inspect the selected comparison before opening the diff view.</p>
                </div>
                <button onClick={() => setSelectedPair(null)} className="text-[var(--text-tertiary)] transition-colors hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Files</p>
                  <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3 font-mono text-sm text-[var(--text-secondary)]">
                    <div className="truncate" title={selectedPair.students[0]}>{selectedPair.students[0]}</div>
                    <div className="my-2 text-center text-[var(--text-tertiary)]">vs</div>
                    <div className="truncate" title={selectedPair.students[1]}>{selectedPair.students[1]}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Similarity score</p>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border-default)]">
                      <div
                        className={`h-full ${selectedPair.score > 75 ? 'bg-[var(--success)]' : selectedPair.score > 40 ? 'bg-[#0d9488]' : 'bg-[#3b82f6]'}`}
                        style={{ width: `${Math.min(selectedPair.score, 100)}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-display text-2xl font-bold text-[var(--text-primary)]">{selectedPair.score.toFixed(1)}%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPair(null);
                    onPairSelect?.({ student1: selectedPair.students[0], student2: selectedPair.students[1] });
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border-default)] bg-[#21262d] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--border-default)]"
                >
                  Open detailed diff
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return isFullscreen ? createPortal(content, document.body) : content;
};

const LegendItem = ({ color, label, range }) => (
  <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--bg-primary)]/50 px-3 py-2">
    <div className="flex items-center gap-3">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</span>
    </div>
    <span className="text-[11px] font-mono font-medium text-[var(--text-tertiary)]">{range}</span>
  </div>
);

export default SimilarityHeatmap;