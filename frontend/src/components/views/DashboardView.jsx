import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Client } from '@stomp/stompjs';
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
  batchId,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAnalyzing && batchId) {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082';
      const wsUrl = API_BASE.replace(/^http/, 'ws') + '/ws-plagshield';
      const stompClient = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
        onConnect: () => {
          stompClient.subscribe(`/topic/progress/${batchId}`, (message) => {
            if (message.body) {
              const data = JSON.parse(message.body);
              setProgress(data.progress);
            }
          });
        },
      });
      stompClient.activate();
      return () => {
        stompClient.deactivate();
      };
    } else {
      setProgress(0);
    }
  }, [isAnalyzing, batchId]);

  const matchRows = useMemo(() => {
    if (!results || !Array.isArray(results.students) || !Array.isArray(results.matrix)) {
      return [];
    }

    const detailedMap = {};
    if (results.detailedResults) {
      results.detailedResults.forEach(r => {
         detailedMap[`${r.submissionA}-${r.submissionB}`] = r;
         detailedMap[`${r.submissionB}-${r.submissionA}`] = r;
      });
    }

    const rows = [];
    for (let i = 0; i < results.students.length; i += 1) {
      for (let j = i + 1; j < results.students.length; j += 1) {
        const score = results.matrix[i][j] ?? 0;
        if (score <= 0) {
          continue;
        }
        const detail = detailedMap[`${results.students[i]}-${results.students[j]}`] || {};
        const riskLevel = score > riskThreshold ? 'High Risk' : score >= suspiciousThreshold ? 'Suspicious' : 'Safe';
        rows.push({
          fileA: results.students[i],
          fileB: results.students[j],
          score,
          riskLevel,
          isAnomaly: detail.anomaly || detail.isAnomaly || false,
          featureImportance: detail.featureImportance || null,
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

  const handleExportPdf = () => {
    if (filteredRows.length === 0) return;
    generatePdfReport(filteredRows, riskThreshold, suspiciousThreshold, batchId, results?.rings || []);
  };

  const riskBadgeClass = (level) => {
    if (level === 'High Risk') return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20';
    if (level === 'Suspicious') return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
    return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 w-full px-4 sm:px-8 pb-24 pt-8">
      {/* Header */}
      <div className="pb-8 border-b border-[#E2E8F0]/40 relative">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-[#2563EB]/10 blur-[80px] pointer-events-none"></div>
        <h2 className="font-display text-4xl font-black text-[#0F172A] mb-4 tracking-tight">
          Workspace Overview
        </h2>
        <p className="text-[#64748B] max-w-2xl leading-relaxed text-base">
          Analyze submissions, inspect similarity heatmaps, and review flagged matches across your dataset.
        </p>
      </div>

      
      {/* Upload Zone */}
      <motion.section {...fadeUp} transition={{ delay: 0.1, duration: 0.3 }}>
        <div className="bg-[#F8FAFC]/40 rounded-[2rem] p-6 sm:p-8 border border-[#E2E8F0]/30 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-[#16A34A]/5 blur-[60px] pointer-events-none"></div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center gap-2">
              <UploadCloud size={18} className="text-[#16A34A]" /> Upload Submissions
            </h3>
            <span className="rounded-full bg-[#16A34A]/10 px-4 py-1.5 text-xs font-bold text-[#16A34A] border border-[#16A34A]/20 shadow-sm">
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
            className="flex flex-col gap-3 px-6 py-5 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-[1.5rem] shadow-[0_0_15px_rgba(37,99,235,0.1)]"
          >
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin text-[#2563EB]" size={20} />
              <span className="text-sm font-bold text-[#2563EB]">
                Processing submissions... {progress}%
              </span>
            </div>
            <div className="w-full bg-[#E2E8F0] rounded-full h-2.5">
              <div className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results Sections */}
      {results && results.students && results.students.length > 0 && (
        <>
{/* Summary Stats Row */}
      <motion.section {...fadeUp} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {selectedMetric.map((tile, i) => {
           let bgGlow = 'bg-[#2563EB]';
           if (tile.label.toLowerCase().includes('high risk')) bgGlow = 'bg-[#DC2626]';
           if (tile.label.toLowerCase().includes('suspicious')) bgGlow = 'bg-[#F59E0B]';
           if (tile.label.toLowerCase().includes('rings')) bgGlow = 'bg-[#2563EB]';
           
           return (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="bg-[#F8FAFC]/40 rounded-[2rem] p-6 border border-[#E2E8F0]/30 relative overflow-hidden group hover:border-[#2563EB]/30 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full ${bgGlow}/20 blur-[30px] group-hover:blur-[40px] transition-all`}></div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3 relative z-10">{tile.label}</p>
              <p className="text-4xl font-black text-[#0F172A] tracking-tight relative z-10">
              {tile.value}
            </p>
            </motion.div>
          );
        })}
      </motion.section>

          {/* Heatmap Section */}
          <motion.section {...fadeUp} transition={{ delay: 0.2, duration: 0.3 }}>
            <div className="bg-[#F8FAFC]/40 rounded-[2rem] p-6 sm:p-8 border border-[#E2E8F0]/30 relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#2563EB]/5 blur-[80px] pointer-events-none"></div>
              
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center gap-2">
                  <LayoutGrid size={18} className="text-[#2563EB]" /> Similarity Matrix
                </h3>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-[#E2E8F0]/50 px-3 py-1.5 text-xs font-bold text-[#64748B]">
                    {results.students.length} submissions
                  </span>
                  <button 
                    onClick={handleExportCsv} 
                    className="flex items-center gap-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E2E8F0] text-[#334155] px-4 py-2 text-sm font-bold transition-all border border-[#E2E8F0]"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button 
                    onClick={handleExportPdf} 
                    className="flex items-center gap-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] px-4 py-2 text-sm font-bold transition-all border border-[#BFDBFE] shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                  >
                    <Download size={14} /> Export PDF Report
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
            <div className="bg-[#F8FAFC]/40 rounded-[2rem] p-6 sm:p-8 border border-[#E2E8F0]/30 relative">
              
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center gap-2">
                  <FileSearch size={18} className="text-[#2563EB]" /> Match Results
                </h3>
                <div className="w-full sm:max-w-xs relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search files or risk level..."
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-[#E2E8F0]/50 bg-[#FFFFFF]/50">
                <div className="max-h-[420px] overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#E2E8F0]">
                  <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="sticky top-0 z-0 bg-[#F8FAFC] shadow-[0_1px_0_rgba(15,23,42,0.08)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">File A</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">File B</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">Similarity</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">Risk</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#64748B]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]/40">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#64748B] italic">
                            No matching pairs found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.slice(0, 12).map((row) => (
                          <tr key={row.key} className="transition-colors hover:bg-[#F8FAFC]/80 group">
                            <td className="px-6 py-4 text-[#64748B] group-hover:text-[#334155] transition-colors min-w-[150px] max-w-[250px]">
                              <div className="truncate font-mono text-xs" title={row.fileA}>{row.fileA}</div>
                            </td>
                            <td className="px-6 py-4 text-[#64748B] group-hover:text-[#334155] transition-colors min-w-[150px] max-w-[250px]">
                              <div className="truncate font-mono text-xs" title={row.fileB}>{row.fileB}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#0F172A]">
                              {row.score.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${riskBadgeClass(row.riskLevel)}`}>
                                  {row.riskLevel}
                                </span>
                                {row.isAnomaly && (
                                  <div className="inline-block rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                                    &#9888; ISOLATION ANOMALY
                                  </div>
                                )}
                                {row.featureImportance && Object.keys(row.featureImportance).length > 0 && (
                                  <div className="text-[10px] text-[#94A3B8] whitespace-normal min-w-[120px]">
                                    Top factor: {Object.entries(row.featureImportance).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0]}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handlePairSelection({ student1: row.fileA, student2: row.fileB })}
                                className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
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
            <div className="bg-[#F8FAFC]/40 rounded-[2rem] p-6 sm:p-8 border border-[#E2E8F0]/30">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center gap-2 mb-6">
                <Activity size={18} className="text-[#F59E0B]" /> Risk Distribution
              </h3>
              <div className="space-y-6">
                <DistributionBar label="High Risk" value={riskDistribution.high} total={filteredRows.length} color="bg-[#DC2626]" shadow="shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
                <DistributionBar label="Suspicious" value={riskDistribution.suspicious} total={filteredRows.length} color="bg-[#F59E0B]" shadow="shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                <DistributionBar label="Safe" value={riskDistribution.safe} total={filteredRows.length} color="bg-[#16A34A]" shadow="shadow-[0_0_12px_rgba(22,163,74,0.6)]" />
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
        <span className="font-semibold text-[#64748B] uppercase tracking-wider text-xs">{label}</span>
        <span className="font-bold text-[#0F172A]">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#FFFFFF] border border-[#E2E8F0]/50 overflow-hidden shadow-inner relative">
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${color} ${shadow} transition-all duration-1000 ease-out`}
          style={{ width }}
        />
      </div>
    </div>
  );
};

export default DashboardView;