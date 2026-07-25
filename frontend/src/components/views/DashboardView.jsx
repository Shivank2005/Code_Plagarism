import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Download, Loader2 } from 'lucide-react';
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

  const [linkCopied, setLinkCopied] = useState(false);

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
    generatePdfReport(filteredRows, riskThreshold, suspiciousThreshold);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const riskBadgeClass = (level) => {
    if (level === 'High Risk') return 'badge badge-danger';
    if (level === 'Suspicious') return 'badge badge-warning';
    return 'badge badge-success';
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Stats Row ── */}
      <motion.section {...fadeUp} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {selectedMetric.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="card p-5"
          >
            <p className="section-label">{tile.label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{tile.value}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Upload Zone ── */}
      <motion.section {...fadeUp} transition={{ delay: 0.1, duration: 0.3 }}>
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="section-label">Upload Submissions</p>
            <span className="badge badge-neutral">{batchFiles.length} files</span>
          </div>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </div>
      </motion.section>

      {/* ── File List ── */}
      {batchFiles.length > 0 && (
        <motion.section {...fadeUp} transition={{ delay: 0.15, duration: 0.3 }}>
          <div className="space-y-2">
            {batchFiles.slice(0, 8).map((file) => (
              <div key={file.id} className="card-flat flex items-center justify-between px-4 py-2.5">
                <span className="truncate text-sm" style={{ color: 'var(--text-secondary)' }} title={file.id}>
                  {file.id}
                </span>
                <span className="badge badge-neutral">code</span>
              </div>
            ))}
            {batchFiles.length > 8 && (
              <p className="text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                +{batchFiles.length - 8} more files
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* ── Analyzing Spinner ── */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="card-flat flex items-center gap-3 px-5 py-4"
          >
            <Loader2 className="animate-spin" size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Processing submissions and updating the analysis dashboard…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Heatmap Section ── */}
      <motion.section {...fadeUp} transition={{ delay: 0.2, duration: 0.3 }}>
        <div className="card p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="section-label">Similarity Matrix</p>
            <div className="flex items-center gap-3">
              <span className="badge badge-neutral">{results?.students?.length || 0} submissions</span>
              <button onClick={handleExportCsv} className="btn-secondary">
                <Download size={14} />
                Export CSV
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
      </motion.section>

      {/* ── Results Table ── */}
      <motion.section {...fadeUp} transition={{ delay: 0.25, duration: 0.3 }}>
        <div className="card p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="section-label">Match Results</p>
            <div className="w-full sm:max-w-xs">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search files or risk level…"
                className="input-field"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-default)' }}>
            <div className="max-h-[420px] overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0" style={{ background: 'var(--bg-primary)' }}>
                  <tr>
                    <th className="section-label px-4 py-3 font-medium">File A</th>
                    <th className="section-label px-4 py-3 font-medium">File B</th>
                    <th className="section-label px-4 py-3 font-medium">Similarity</th>
                    <th className="section-label px-4 py-3 font-medium">Risk</th>
                    <th className="section-label px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        No matching pairs found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.slice(0, 12).map((row) => (
                      <tr key={row.key} className="transition-colors hover:bg-[var(--bg-elevated)]">
                        <td className="max-w-0 px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          <div className="truncate" title={row.fileA}>{row.fileA}</div>
                        </td>
                        <td className="max-w-0 px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          <div className="truncate" title={row.fileB}>{row.fileB}</div>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {row.score.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3">
                          <span className={riskBadgeClass(row.riskLevel)}>{row.riskLevel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handlePairSelection({ student1: row.fileA, student2: row.fileB })}
                            className="btn-secondary text-xs"
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

      {/* ── Risk Distribution ── */}
      <motion.section {...fadeUp} transition={{ delay: 0.3, duration: 0.3 }}>
        <div className="card p-6">
          <p className="section-label mb-5">Risk Distribution</p>
          <div className="space-y-4">
            <DistributionBar label="High risk" value={riskDistribution.high} total={filteredRows.length} color="bg-red-500" />
            <DistributionBar label="Suspicious" value={riskDistribution.suspicious} total={filteredRows.length} color="bg-amber-500" />
            <DistributionBar label="Safe" value={riskDistribution.safe} total={filteredRows.length} color="bg-emerald-500" />
          </div>
        </div>
      </motion.section>
    </div>
  );
};

const DistributionBar = ({ label, value, total, color }) => {
  const width = total > 0 ? `${Math.max(8, (value / total) * 100)}%` : '8%';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: 'var(--text-tertiary)' }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-500`}
          style={{ width }}
        />
      </div>
    </div>
  );
};

export default DashboardView;