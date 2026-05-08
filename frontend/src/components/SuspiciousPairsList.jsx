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
      <div className="glass-card rounded-3xl p-6 border border-emerald-100/20 bg-emerald-500/10">
        <div className="flex items-center gap-3 mb-2">
          <TrendingDown className="text-emerald-300" size={20} />
          <h3 className="font-display text-lg font-bold text-white">All Clear</h3>
        </div>
        <p className="text-sm text-emerald-100/70">No suspicious pairs detected in this batch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {highRiskPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 border-rose-100/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-rose-300" size={20} />
            <h3 className="font-display text-lg font-bold text-white">High Risk Pairs</h3>
            <span className="ml-auto rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-100">
              {highRiskPairs.length}
            </span>
          </div>
          <div className="space-y-2">
            {highRiskPairs.map((pair, idx) => (
              <motion.button
                key={`high-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onPairClick?.(pair)}
                className="w-full group flex items-center gap-4 rounded-xl border border-rose-100/20 bg-rose-500/10 px-4 py-3 transition-all hover:bg-rose-500/20 hover:border-rose-100/40"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs uppercase tracking-[0.12em] text-rose-100/70 mb-1">Submission Pair</p>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-rose-50 truncate" title={pair.student1}>
                      {pair.student1.substring(0, 20)}
                    </span>
                    <span className="text-rose-100/60 flex-shrink-0">vs</span>
                    <span className="text-sm font-semibold text-rose-50 truncate" title={pair.student2}>
                      {pair.student2.substring(0, 20)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-2xl font-black text-rose-300">{pair.score.toFixed(1)}%</p>
                  <p className="text-xs text-rose-100/60">Match</p>
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
          className="glass-card rounded-3xl p-6 border-amber-100/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-300" size={20} />
            <h3 className="font-display text-lg font-bold text-white">Suspicious Pairs</h3>
            <span className="ml-auto rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-100">
              {suspiciousPairs.length}
            </span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {suspiciousPairs.map((pair, idx) => (
              <motion.button
                key={`suspicious-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.03 }}
                onClick={() => onPairClick?.(pair)}
                className="w-full group flex items-center gap-4 rounded-xl border border-amber-100/20 bg-amber-500/10 px-4 py-3 transition-all hover:bg-amber-500/20 hover:border-amber-100/40"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs uppercase tracking-[0.12em] text-amber-100/70 mb-1">Submission Pair</p>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-amber-50 truncate" title={pair.student1}>
                      {pair.student1.substring(0, 20)}
                    </span>
                    <span className="text-amber-100/60 flex-shrink-0">vs</span>
                    <span className="text-sm font-semibold text-amber-50 truncate" title={pair.student2}>
                      {pair.student2.substring(0, 20)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-2xl font-black text-amber-300">{pair.score.toFixed(1)}%</p>
                  <p className="text-xs text-amber-100/60">Match</p>
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
