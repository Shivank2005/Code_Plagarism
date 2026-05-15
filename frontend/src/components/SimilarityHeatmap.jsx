import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Download, Layers, Palette, Users2, X } from 'lucide-react';

const SimilarityHeatmap = ({ data, thresholds = { highRisk: 75, suspicious: 40 }, animateCells = true, onPairSelect }) => {
  const [selectedPair, setSelectedPair] = useState(null);

  if (!data) {
    return (
      <div className="glass-card flex min-h-[600px] h-full flex-col items-center justify-center rounded-[2rem] border border-[#30363d] p-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22]">
          <Activity className="text-[#8b949e]" size={28} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-[#e6edf3]">No active dataset</h3>
        <p className="max-w-sm text-sm leading-6 text-[#8b949e]">
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

  return (
    <div className="glass-card rounded-[2rem] border border-[#30363d] p-6 shadow-[0_16px_40px_rgba(1,4,9,0.35)] sm:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] text-[#58a6ff]">
              <Layers size={18} />
            </span>
            <div>
              <h3 className="font-display text-2xl font-bold text-[#e6edf3] sm:text-3xl">Matrix analysis</h3>
              <p className="text-sm text-[#8b949e]">Compact similarity map with a sequential palette like your reference heatmap.</p>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-[#8b949e]">
            Cross-referencing {students.length} submissions. Select a cell to open a detailed pair review, or export the matrix for offline inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="rounded-full border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c9d1d9]">
            {rings.length} collaboration rings
          </div>
          <div className="rounded-full border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c9d1d9]">
            {highRiskCount} high risk
          </div>
          <div className="rounded-full border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-medium text-[#c9d1d9]">
            {suspiciousCount} suspicious
          </div>
          <button
            onClick={exportMatrixCsv}
            className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-4 py-2 text-xs font-semibold text-[#c9d1d9] transition-colors hover:border-[#58a6ff]/50 hover:text-white"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117]">
          <div className="overflow-hidden p-3 sm:p-4">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-20 border-b border-r border-[#30363d] bg-[#161b22] px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b949e]" style={{ width: `${Math.max(120, compactCellSize * 3.6)}px` }}>
                    Files
                  </th>
                  {students.map((student) => (
                    <th
                      key={student}
                      className="sticky top-0 z-10 border-b border-[#30363d] bg-[#161b22] px-1 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8b949e]"
                      style={{ width: `${compactCellSize}px` }}
                      title={student}
                    >
                      <div className="mx-auto flex h-12 items-center justify-center whitespace-nowrap text-[9px] leading-none text-[#c9d1d9] [-webkit-transform:rotate(-45deg)] [transform:rotate(-45deg)]">
                        {student.split('/').pop()?.split('.')[0].substring(0, 8)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={students[rowIndex]}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-[#30363d] bg-[#161b22] px-2 py-2 text-left text-xs font-medium text-[#c9d1d9]" style={{ width: `${Math.max(120, compactCellSize * 3.6)}px` }}>
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
                        <td key={`${rowIndex}-${colIndex}`} className="border-b border-[#30363d] p-0" style={{ width: `${compactCellSize}px` }}>
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

          <div className="border-t border-[#30363d] bg-[#161b22] px-4 py-3 text-xs text-[#8b949e]">
            Select a colored cell to open the pair review modal. Muted cells are self-comparisons or low-signal matches.
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Palette size={14} className="text-[#58a6ff]" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">Scale</h4>
            </div>
            <div className="space-y-4">
              <LegendItem color="bg-[#3b82f6]" label="Low" range={`0-${suspiciousThreshold}%`} />
              <LegendItem color="bg-[#22c55e]" label="Medium" range={`${suspiciousThreshold}-${highRiskThreshold}%`} />
              <LegendItem color="bg-[#a855f7]" label="High" range={`>${highRiskThreshold}%`} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users2 size={14} className="text-[#58a6ff]" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">Ring clusters</h4>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {rings.length === 0 ? (
                <p className="text-sm text-[#8b949e]">No collaborative networks found in this batch.</p>
              ) : (
                rings.map((ring, index) => (
                  <div key={index} className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b949e]">Cluster #{index + 1}</p>
                      <span className="text-[10px] font-medium text-[#8b949e]">{ring.length} files</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(ring).map((student) => (
                        <span
                          key={student}
                          className="max-w-[120px] truncate rounded-full border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-[11px] text-[#c9d1d9]"
                          title={student}
                        >
                          {student.split('.')[0]}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.97, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-[#30363d] bg-[#161b22] p-6 shadow-[0_20px_60px_rgba(1,4,9,0.5)]"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#e6edf3]">Pair review</h3>
                  <p className="text-sm text-[#8b949e]">Inspect the selected comparison before opening the diff view.</p>
                </div>
                <button onClick={() => setSelectedPair(null)} className="text-[#8b949e] transition-colors hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b949e]">Files</p>
                  <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 font-mono text-sm text-[#c9d1d9]">
                    <div className="truncate" title={selectedPair.students[0]}>{selectedPair.students[0]}</div>
                    <div className="my-2 text-center text-[#8b949e]">vs</div>
                    <div className="truncate" title={selectedPair.students[1]}>{selectedPair.students[1]}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b949e]">Similarity score</p>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#30363d]">
                      <div
                        className={`h-full ${selectedPair.score > 75 ? 'bg-[#f85149]' : selectedPair.score > 40 ? 'bg-[#d29922]' : 'bg-[#2ea043]'}`}
                        style={{ width: `${Math.min(selectedPair.score, 100)}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-display text-2xl font-bold text-[#e6edf3]">{selectedPair.score.toFixed(1)}%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPair(null);
                    onPairSelect?.({ student1: selectedPair.students[0], student2: selectedPair.students[1] });
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-4 py-2.5 text-sm font-semibold text-[#e6edf3] transition-colors hover:border-[#58a6ff]/50 hover:bg-[#30363d]"
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
};

const LegendItem = ({ color, label, range }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-sm text-[#c9d1d9]">{label}</span>
    </div>
    <span className="text-[10px] font-mono text-[#8b949e]">{range}</span>
  </div>
);

export default SimilarityHeatmap;