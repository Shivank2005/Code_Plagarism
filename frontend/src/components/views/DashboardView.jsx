import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Download, Layers3, Loader2, Sparkles } from 'lucide-react';
import UploadZone from '../UploadZone';
import SimilarityHeatmap from '../SimilarityHeatmap';

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

  const insights = useMemo(() => {
    if (!results || !results.students?.length) {
      return [
        'Upload a submission set to generate a matrix, risk table, and cluster summary.',
        'The analysis pipeline will automatically compute risk buckets and matrix similarity scores.',
      ];
    }

    const highest = filteredRows[0];
    return [
      `${results.students.length} files are currently in scope for analysis.`,
      highest ? `Top signal: ${highest.fileA.split('/').pop()} vs ${highest.fileB.split('/').pop()} at ${highest.score.toFixed(1)}%.` : 'No pair signals are available yet.',
      `${highRiskPairs} high-risk and ${suspiciousPairs} suspicious relationships detected by the current thresholds.`,
    ];
  }, [filteredRows, highRiskPairs, results, suspiciousPairs]);

  const selectedMetric = summaryTiles || [];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#94a3b8]">Comparison blueprint</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">MOSS logic, JPlag flow, Copyleaks styling, GitHub matrix, Snyk clarity.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                A clean plagiarism workspace should first ingest submissions, then score them consistently, and finally surface the highest-risk pairs in a readable review flow.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#cbd5e1]">
              <Layers3 size={14} className="text-[#3b82f6]" />
              One system, three stages
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { label: 'Ingest', value: 'Upload folder, ZIP, or files', tone: 'text-[#93c5fd]' },
              { label: 'Compare', value: 'Matrix, clusters, and score bands', tone: 'text-[#fcd34d]' },
              { label: 'Review', value: 'Diffs, export, and pair inspection', tone: 'text-[#6ee7b7]' },
            ].map((step) => (
              <div key={step.label} className="rounded-xl border border-[#1f2937] bg-[#0f172a] p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">{step.label}</p>
                <p className={`mt-2 text-sm font-medium ${step.tone}`}>{step.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#94a3b8]">Design DNA</p>
          <div className="mt-3 space-y-2 text-sm text-[#cbd5e1]">
            <div className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2">GitHub: matrix readability</div>
            <div className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2">Snyk: security-grade hierarchy</div>
            <div className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2">Copyleaks: polished SaaS panels</div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {selectedMetric.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">{tile.label}</p>
            <p className="mt-3 text-2xl font-semibold text-[#e5e7eb]">{tile.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_260px] 2xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm xl:sticky xl:top-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">Upload</p>
                <h3 className="mt-1 text-lg font-semibold text-[#e5e7eb]">Submission set</h3>
              </div>
              <span className="rounded-full border border-[#1f2937] bg-[#0f172a] px-3 py-1 text-xs text-[#cbd5e1]">{batchFiles.length} files</span>
            </div>
            <UploadZone onUploadSuccess={handleUploadSuccess} />

            <div className="mt-4 space-y-2">
              {batchFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#cbd5e1]">
                  <span className="truncate" title={file.id}>{file.id}</span>
                  <span className="rounded-full border border-[#1f2937] bg-[#111827] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#94a3b8]">code</span>
                </div>
              ))}
            </div>

            {isAnalyzing && (
              <div className="mt-4 rounded-xl border border-[#1f2937] bg-[#0f172a] p-3 text-sm text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-[#3b82f6]" size={16} />
                  Analysis running
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm xl:sticky xl:top-[33rem]">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">Clusters</p>
            <div className="mt-3 space-y-2 text-sm text-[#cbd5e1]">
              {(results?.rings || []).slice(0, 4).map((ring, index) => (
                <div key={index} className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-[#94a3b8]">Cluster #{index + 1}</span>
                    <span className="text-xs text-[#94a3b8]">{ring.length} files</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(ring).slice(0, 3).map((item) => (
                      <span key={item} className="rounded-full border border-[#1f2937] bg-[#111827] px-2 py-1 text-[11px] text-[#e5e7eb]">
                        {item.split('/').pop()?.split('.')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">Similarity matrix</p>
                <h3 className="mt-1 text-xl font-semibold text-white">GitHub-style heatmap with Snyk-like signal framing</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-full border border-[#1f2937] bg-[#0f172a] px-3 py-1 text-xs text-[#cbd5e1]">
                  {results?.students?.length || 0} submissions
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#0f172a] px-3 py-1 text-xs font-medium text-[#cbd5e1] transition-colors hover:border-[#3b82f6]/50 hover:text-white">
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            <SimilarityHeatmap
              data={results}
              thresholds={{ highRisk: riskThreshold, suspicious: suspiciousThreshold }}
              animateCells={preferences.animateHeatmap}
              onPairSelect={handlePairSelection}
            />
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">Match results</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Comparison queue</h3>
              </div>
              <div className="w-full max-w-xs">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search files or risk level"
                  className="w-full rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-sm text-[#e5e7eb] outline-none placeholder:text-[#64748b] focus:border-[#3b82f6]/60"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#1f2937]">
              <div className="max-h-[420px] overflow-auto">
                <table className="min-w-full divide-y divide-[#1f2937] text-left text-sm">
                  <thead className="sticky top-0 bg-[#0f172a]">
                    <tr className="text-xs uppercase tracking-[0.12em] text-[#94a3b8]">
                      <th className="px-4 py-3 font-medium">File A</th>
                      <th className="px-4 py-3 font-medium">File B</th>
                      <th className="px-4 py-3 font-medium">Similarity</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937] bg-[#111827]">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-[#94a3b8]">
                          No matching pairs found.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.slice(0, 12).map((row) => (
                        <tr key={row.key} className="text-[#e5e7eb]">
                          <td className="max-w-0 px-4 py-3">
                            <div className="truncate" title={row.fileA}>{row.fileA}</div>
                          </td>
                          <td className="max-w-0 px-4 py-3">
                            <div className="truncate" title={row.fileB}>{row.fileB}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">{row.score.toFixed(1)}%</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              row.riskLevel === 'High Risk'
                                ? 'bg-[#ef4444]/15 text-[#fca5a5]'
                                : row.riskLevel === 'Suspicious'
                                  ? 'bg-[#f59e0b]/15 text-[#fcd34d]'
                                  : 'bg-[#10b981]/15 text-[#6ee7b7]'
                            }`}>
                              {row.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handlePairSelection({ student1: row.fileA, student2: row.fileB })}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#1f2937] bg-[#0f172a] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-colors hover:border-[#3b82f6]/50 hover:text-white"
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
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">AI insights</p>
            <div className="mt-3 space-y-3 text-sm text-[#cbd5e1]">
              {insights.map((line, index) => (
                <div key={index} className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 leading-6 text-[#cbd5e1]">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">Risk distribution</p>
            <div className="mt-4 space-y-3">
              <DistributionBar label="High risk" value={riskDistribution.high} total={filteredRows.length} color="bg-[#ef4444]" />
              <DistributionBar label="Suspicious" value={riskDistribution.suspicious} total={filteredRows.length} color="bg-[#f59e0b]" />
              <DistributionBar label="Safe" value={riskDistribution.safe} total={filteredRows.length} color="bg-[#10b981]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">Exports</p>
            <div className="mt-3 flex flex-col gap-2">
              <button className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-left text-sm text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50">CSV report</button>
              <button className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-left text-sm text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50">PDF summary</button>
              <button className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-3 py-2 text-left text-sm text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50">Share link</button>
            </div>
          </div>
        </aside>
      </section>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#1f2937] bg-[#111827] px-4 py-3 text-sm text-[#cbd5e1] shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#3b82f6]" size={16} />
              Processing submissions and updating the analysis dashboard.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DistributionBar = ({ label, value, total, color }) => {
  const width = total > 0 ? `${Math.max(8, (value / total) * 100)}%` : '8%';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-[#cbd5e1]">
        <span>{label}</span>
        <span className="text-[#94a3b8]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#0f172a]">
        <div className={`h-2 rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
};

export default DashboardView;