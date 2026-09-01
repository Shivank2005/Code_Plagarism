import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, TrendingDown } from 'lucide-react';

const SuspiciousPairsList = ({ data, thresholds = { highRisk: 75, suspicious: 40 }, onPairClick }) => {
  if (!data || !data.students || !data.matrix) {
    return null;
  }

  const { students, matrix } = data;
  const highRiskThreshold = thresholds.highRisk ?? 75;
  const suspiciousThreshold = thresholds.suspicious ?? 40;

  // Extract all pairs with their scores and metadata from detailedResults
  const pairs = [];
  const detailedMap = {};
  if (data.detailedResults) {
    data.detailedResults.forEach(r => {
       detailedMap[`${r.submissionA}-${r.submissionB}`] = r;
       detailedMap[`${r.submissionB}-${r.submissionA}`] = r;
    });
  }

  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const score = matrix[i][j];
      if (score >= suspiciousThreshold && score < 100) {
        const detail = detailedMap[`${students[i]}-${students[j]}`] || {};
        pairs.push({
          student1: students[i],
          student2: students[j],
          score,
          isHighRisk: score > highRiskThreshold,
          isSuspicious: score >= suspiciousThreshold && score <= highRiskThreshold,
          isAnomaly: detail.anomaly || detail.isAnomaly || false,
          featureImportance: detail.featureImportance || null
        });
      }
    }
  }

  // Sort by score descending
  pairs.sort((a, b) => b.score - a.score);

  const highRiskPairs = pairs.filter(p => p.isHighRisk);
  const suspiciousPairs = pairs.filter(p => p.isSuspicious);

  if (pairs.length === 0) {
    return (
      <div className="glass-card rounded-2xl border-[var(--success)]/25 bg-[var(--success)]/5 p-6">
        <div className="mb-2 flex items-center gap-3">
          <TrendingDown className="text-[var(--success)]" size={20} />
          <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">All Clear</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">No suspicious pairs detected in this batch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {highRiskPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border-[var(--danger)]/25 bg-[var(--danger)]/5 p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="text-[var(--danger)]" size={20} />
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">High Risk Pairs</h3>
            <span className="ml-auto rounded-full border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-3 py-1 text-xs font-semibold text-[var(--danger)]">
              {highRiskPairs.length}
            </span>
          </div>
          <div className="space-y-3">
            {highRiskPairs.map((pair, idx) => (
              <motion.button
                key={`high-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onPairClick?.(pair)}
                className="group flex w-full items-center gap-4 rounded-xl border border-[var(--danger)]/15 bg-[var(--bg-primary)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[var(--danger)]/40 hover:bg-[var(--danger)]/5"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Submission Pair</p>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--text-primary)]" title={pair.student1}>
                      {pair.student1.substring(0, 24)}
                    </span>
                    <span className="flex-shrink-0 text-[var(--text-tertiary)]">vs</span>
                    <span className="truncate text-sm font-semibold text-[var(--text-primary)]" title={pair.student2}>
                      {pair.student2.substring(0, 24)}
                    </span>
                  </div>
                  {pair.isAnomaly && (
                    <div className="mt-2 inline-block rounded-md border border-purple-300 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                      ⚠️ ISOLATION ANOMALY
                    </div>
                  )}
                  {pair.featureImportance && Object.keys(pair.featureImportance).length > 0 && (
                     <div className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                       Top factor: {Object.entries(pair.featureImportance).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0]}
                     </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black text-[var(--danger)]">{pair.score.toFixed(1)}%</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">Match</p>
                </div>
                <ChevronRight className="text-[var(--text-tertiary)] group-hover:text-[var(--danger)] flex-shrink-0" size={18} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {suspiciousPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl border-[var(--warning)]/25 bg-[var(--warning)]/5 p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="text-[var(--warning)]" size={20} />
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">Suspicious Pairs</h3>
            <span className="ml-auto rounded-full border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-3 py-1 text-xs font-semibold text-[var(--warning)]">
              {suspiciousPairs.length}
            </span>
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {suspiciousPairs.map((pair, idx) => (
              <motion.button
                key={`suspicious-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.03 }}
                onClick={() => onPairClick?.(pair)}
                className="group flex w-full items-center gap-4 rounded-xl border border-[var(--warning)]/15 bg-[var(--bg-primary)] px-4 py-4 text-left shadow-sm transition-all duration-200 hover:border-[var(--warning)]/40 hover:bg-[var(--warning)]/5"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Submission Pair</p>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--text-primary)]" title={pair.student1}>
                      {pair.student1.substring(0, 24)}
                    </span>
                    <span className="flex-shrink-0 text-[var(--text-tertiary)]">vs</span>
                    <span className="truncate text-sm font-semibold text-[var(--text-primary)]" title={pair.student2}>
                      {pair.student2.substring(0, 24)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black text-[var(--warning)]">{pair.score.toFixed(1)}%</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">Match</p>
                </div>
                <ChevronRight className="text-[var(--text-tertiary)] group-hover:text-[var(--warning)] flex-shrink-0" size={18} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SuspiciousPairsList;
