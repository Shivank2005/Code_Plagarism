import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Download, Loader2, Search, UploadCloud, Activity, LayoutGrid, FileSearch } from 'lucide-react';
import UploadZone from '../UploadZone';
import SimilarityHeatmap from '../SimilarityHeatmap';
import { generatePdfReport } from '../../utils/pdfGenerator';

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const DashboardView = ({
  batchFiles,
  isAnalyzing,
  results,
  handleUploadSuccess,
  highRiskPairs,
  suspiciousPairs,
  riskThreshold,
  suspiciousThreshold,
  preferences,
  handlePairSelection,
  searchTerm,
  setSearchTerm,
  summaryTiles,
}) => {
  const matchRows = useMemo(() => {
    if (!results || !Array.isArray(results.students) || !Array.isArray(results.matrix)) {
      return [];
    }

    const rows = [];
    for (let i = 0; i < results.students.length; i += 1) {
      for (let j = i + 1; j < results.students.length; j += 1) {
        const score = results.matrix[i][j] ?? 0;
        if (score <= 0) {
          continue;
        }

        const riskLevel = score > riskThreshold ? 'High Risk' : score >= suspiciousThreshold ? 'Suspicious' : 'Safe';
        rows.push({
          fileA: results.students[i],
          fileB: results.students[j],
          score,
          riskLevel,
          key: `${results.students[i]}-${results.students[j]}`,
        });
      }
    }
    return rows.sort((a, b) => b.score - a.score);
  }, [results, riskThreshold, suspiciousThreshold]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return matchRows;
    }

    const query = searchTerm.toLowerCase();
    return matchRows.filter((row) => {
      return (
        row.fileA.toLowerCase().includes(query) ||
        row.fileB.toLowerCase().includes(query) ||
        row.riskLevel.toLowerCase().includes(query)
      );
    });
  }, [matchRows, searchTerm]);

  const riskDistribution = useMemo(() => {
    const high = filteredRows.filter((row) => row.score > riskThreshold).length;
    const suspicious = filteredRows.filter((row) => row.score >= suspiciousThreshold && row.score <= riskThreshold).length;
    const safe = Math.max(0, filteredRows.length - high - suspicious);
    return { high, suspicious, safe };
  }, [filteredRows, riskThreshold, suspiciousThreshold]);

  const selectedMetric = summaryTiles || [];

  const handleExportCsv = () => {
    if (filteredRows.length === 0) return;
    const csvRows = ['File A,File B,Similarity Score (%),Risk Level'];
    filteredRows.forEach(row => {
      csvRows.push(`${row.fileA},${row.fileB},${row.score.toFixed(1)},${row.riskLevel}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagshield-matrix-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const riskBadgeClass = (level) => {
    if (level === 'High Risk') return 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/20';
    if (level === 'Suspicious') return 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20';
    return 'bg-[#238636]/10 text-[#7ee787] border-[#238636]/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 w-full px-4 sm:px-8 pb-24 pt-8">
      {/* Header */}
      <div className="pb-8 border-b border-[#30363d]/40 relative">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-[#58a6ff]/10 blur-[80px] pointer-events-none"></div>
        <h2 className="font-display text-4xl font-black text-[#e6edf3] mb-4 tracking-tight">
          Workspace Overview
        </h2>
        <p className="text-[#8b949e] max-w-2xl leading-relaxed text-base">
          Analyze submissions, inspect similarity heatmaps, and review flagged matches across your dataset.
        </p>
      </div>

      {/* Summary Stats Row */}
      <motion.section {...fadeUp} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {selectedMetric.map((tile, i) => {
           let bgGlow = 'bg-[#58a6ff]';
           if (tile.label.toLowerCase().includes('high risk')) bgGlow = 'bg-[#f85149]';
           if (tile.label.toLowerCase().includes('suspicious')) bgGlow = 'bg-[#d29922]';
           if (tile.label.toLowerCase().includes('rings')) bgGlow = 'bg-[#a371f7]';
           
           return (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-[#161b22]/40 rounded-[2rem] p-6 border border-[#30363d]/30 relative overflow-hidden group hover:border-[#58a6ff]/30 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full ${bgGlow}/20 blur-[30px] group-hover:blur-[40px] transition-all`}></div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-3 relative z-10">{tile.label}</p>
              <p className="text-4xl font-black text-white tracking-tight relative z-10">{tile.value}</p>
            </motion.div>
          );
        })}
      </motion.section>

      {/* Upload Zone */}
      <motion.section {...fadeUp} transition={{ delay: 0.1, duration: 0.3 }}>
        <div className="bg-[#161b22]/40 rounded-[2rem] p-6 sm:p-8 border border-[#30363d]/30 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-[#7ee787]/5 blur-[60px] pointer-events-none"></div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-2">
              <UploadCloud size={18} className="text-[#7ee787]" /> Upload Submissions
            </h3>
            <span className="rounded-full bg-[#238636]/10 px-4 py-1.5 text-xs font-bold text-[#7ee787] border border-[#238636]/20 shadow-sm">
              {batchFiles.length} files staged
            </span>
          </div>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </div>
      </motion.section>

      {/* Analyzing Spinner */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-4 px-6 py-5 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-[1.5rem] shadow-[0_0_15px_rgba(88,166,255,0.1)]"
          >
            <Loader2 className="animate-spin text-[#58a6ff]" size={20} />
            <span className="text-sm font-bold text-[#58a6ff]">
              Processing submissions and updating the analysis dashboard...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results Sections */}
      {results && results.students && results.students.length > 0 && (
        <>
          {/* Heatmap Section */}
          <motion.section {...fadeUp} transition={{ delay: 0.2, duration: 0.3 }}>
            <div className="bg-[#161b22]/40 rounded-[2rem] p-6 sm:p-8 border border-[#30363d]/30 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#a371f7]/5 blur-[80px] pointer-events-none"></div>
              
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-2">
                  <LayoutGrid size={18} className="text-[#a371f7]" /> Similarity Matrix
                </h3>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-[#30363d]/50 px-3 py-1.5 text-xs font-bold text-[#8b949e]">
                    {results.students.length} submissions
                  </span>
                  <button 
                    onClick={handleExportCsv} 
                    className="flex items-center gap-2 rounded-xl bg-[#0d1117] hover:bg-[#30363d] text-[#c9d1d9] px-4 py-2 text-sm font-bold transition-all border border-[#30363d]"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <SimilarityHeatmap
                  data={results}
                  thresholds={{ highRisk: riskThreshold, suspicious: suspiciousThreshold }}
                  animateCells={preferences.animateHeatmap}
                  onPairSelect={handlePairSelection}
                />
              </div>
            </div>
          </motion.section>

          {/* Results Table */}
          <motion.section {...fadeUp} transition={{ delay: 0.25, duration: 0.3 }}>
            <div className="bg-[#161b22]/40 rounded-[2rem] p-6 sm:p-8 border border-[#30363d]/30 relative">
              
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-2">
                  <FileSearch size={18} className="text-[#58a6ff]" /> Match Results
                </h3>
                <div className="w-full sm:max-w-xs relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search files or risk level..."
                    className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] pl-10 pr-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] transition-all focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-[#30363d]/50 bg-[#0d1117]/50">
                <div className="max-h-[420px] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#30363d]">
                  <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="sticky top-0 z-10 bg-[#161b22] shadow-[0_1px_0_rgba(48,54,61,0.5)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8b949e]">File A</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8b949e]">File B</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8b949e]">Similarity</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8b949e]">Risk</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#8b949e]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]/40">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#8b949e] italic">
                            No matching pairs found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.slice(0, 12).map((row) => (
                          <tr key={row.key} className="transition-colors hover:bg-[#161b22]/80 group">
                            <td className="px-6 py-4 text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors max-w-0">
                              <div className="truncate font-mono text-xs" title={row.fileA}>{row.fileA}</div>
                            </td>
                            <td className="px-6 py-4 text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors max-w-0">
                              <div className="truncate font-mono text-xs" title={row.fileB}>{row.fileB}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#e6edf3]">
                              {row.score.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${riskBadgeClass(row.riskLevel)}`}>
                                {row.riskLevel}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handlePairSelection({ student1: row.fileA, student2: row.fileB })}
                                className="flex items-center gap-1 text-xs font-bold text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
                              >
                                Review <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Risk Distribution */}
          <motion.section {...fadeUp} transition={{ delay: 0.3, duration: 0.3 }}>
            <div className="bg-[#161b22]/40 rounded-[2rem] p-6 sm:p-8 border border-[#30363d]/30">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#c9d1d9] flex items-center gap-2 mb-6">
                <Activity size={18} className="text-[#d29922]" /> Risk Distribution
              </h3>
              <div className="space-y-6">
                <DistributionBar label="High Risk" value={riskDistribution.high} total={filteredRows.length} color="bg-[#f85149]" shadow="shadow-[0_0_12px_rgba(248,81,73,0.6)]" />
                <DistributionBar label="Suspicious" value={riskDistribution.suspicious} total={filteredRows.length} color="bg-[#d29922]" shadow="shadow-[0_0_12px_rgba(210,153,34,0.6)]" />
                <DistributionBar label="Safe" value={riskDistribution.safe} total={filteredRows.length} color="bg-[#238636]" shadow="shadow-[0_0_12px_rgba(35,134,54,0.6)]" />
              </div>
            </div>
          </motion.section>
        </>
      )}
    </div>
  );
};

const DistributionBar = ({ label, value, total, color, shadow }) => {
  const width = total > 0 ? `${Math.max(8, (value / total) * 100)}%` : '8%';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#8b949e] uppercase tracking-wider text-xs">{label}</span>
        <span className="font-bold text-[#e6edf3]">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#0d1117] border border-[#30363d]/50 overflow-hidden shadow-inner relative">
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${color} ${shadow} transition-all duration-1000 ease-out`}
          style={{ width }}
        />
      </div>
    </div>
  );
};

export default DashboardView;