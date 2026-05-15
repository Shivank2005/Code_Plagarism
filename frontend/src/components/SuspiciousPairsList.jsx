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

  // Extract all pairs with their scores
  const pairs = [];
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const score = matrix[i][j];
      if (score >= suspiciousThreshold && score < 100) {
        pairs.push({
          student1: students[i],
          student2: students[j],
          score,
          isHighRisk: score > highRiskThreshold,
          isSuspicious: score >= suspiciousThreshold && score <= highRiskThreshold,
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
      <div className="glass-card rounded-[2rem] border border-emerald-100/15 bg-emerald-500/8 p-6">
        <div className="mb-2 flex items-center gap-3">
          <TrendingDown className="text-emerald-300" size={20} />
          <h3 className="font-display text-lg font-bold text-white">All Clear</h3>
        </div>
        <p className="text-sm text-emerald-100/70">No suspicious pairs detected in this batch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {highRiskPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] border border-rose-100/20 bg-[#071f2d]/85 p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="text-rose-300" size={20} />
            <h3 className="font-display text-lg font-bold text-white">High Risk Pairs</h3>
            <span className="ml-auto rounded-full border border-rose-100/15 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-100">
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
                className="group flex w-full items-center gap-4 rounded-2xl border border-rose-100/10 bg-white/4 px-4 py-4 text-left transition-all duration-200 hover:border-rose-100/25 hover:bg-white/6"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100/55">Submission Pair</p>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-rose-50" title={pair.student1}>
                      {pair.student1.substring(0, 24)}
                    </span>
                    <span className="flex-shrink-0 text-rose-100/45">vs</span>
                    <span className="truncate text-sm font-semibold text-rose-50" title={pair.student2}>
                      {pair.student2.substring(0, 24)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black text-rose-300">{pair.score.toFixed(1)}%</p>
                  <p className="text-[11px] text-rose-100/55">Match</p>
                </div>
                <ChevronRight className="text-rose-100/40 group-hover:text-rose-100 flex-shrink-0" size={18} />
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
          className="glass-card rounded-[2rem] border border-amber-100/20 bg-[#071f2d]/85 p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="text-amber-300" size={20} />
            <h3 className="font-display text-lg font-bold text-white">Suspicious Pairs</h3>
            <span className="ml-auto rounded-full border border-amber-100/15 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
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
                className="group flex w-full items-center gap-4 rounded-2xl border border-amber-100/10 bg-white/4 px-4 py-4 text-left transition-all duration-200 hover:border-amber-100/25 hover:bg-white/6"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/55">Submission Pair</p>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-semibold text-amber-50" title={pair.student1}>
                      {pair.student1.substring(0, 24)}
                    </span>
                    <span className="flex-shrink-0 text-amber-100/45">vs</span>
                    <span className="truncate text-sm font-semibold text-amber-50" title={pair.student2}>
                      {pair.student2.substring(0, 24)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black text-amber-300">{pair.score.toFixed(1)}%</p>
                  <p className="text-[11px] text-amber-100/55">Match</p>
                </div>
                <ChevronRight className="text-amber-100/40 group-hover:text-amber-100 flex-shrink-0" size={18} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SuspiciousPairsList;
