import React from 'react';
import { motion } from 'framer-motion';

const RingsView = ({ results, normalizedRings, getPairScore, riskThreshold, suspiciousThreshold }) => {
  return (
    <motion.div
      key="rings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-2xl font-bold text-white">Plagiarism Rings</h3>
        <span className="rounded-full border border-cyan-100/20 bg-cyan-950/60 px-3 py-1 text-xs uppercase tracking-[0.14em] text-cyan-100/80">
          {normalizedRings.length} clusters
        </span>
      </div>

      {!results && (
        <div className="rounded-2xl border border-cyan-100/10 bg-cyan-500/5 p-8 text-center">
          <p className="font-display text-xl text-white">No ring data available yet</p>
          <p className="mt-2 text-sm text-cyan-100/60">Run an analysis in Overview to populate ring intelligence.</p>
        </div>
      )}

      {results && normalizedRings.length === 0 && (
        <div className="rounded-2xl border border-emerald-100/20 bg-emerald-500/10 p-8 text-center">
          <p className="font-display text-xl text-white">No collaboration rings detected</p>
          <p className="mt-2 text-sm text-emerald-100/70">Current dataset does not contain suspicious collaborative clusters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {normalizedRings.map((ring, ringIndex) => {
          const peakScore = ring.reduce((max, studentA, i) => {
            for (let j = i + 1; j < ring.length; j += 1) {
              max = Math.max(max, getPairScore(studentA, ring[j]));
            }
            return max;
          }, 0);

          const severityLabel = peakScore > riskThreshold ? 'High Risk' : peakScore >= suspiciousThreshold ? 'Suspicious' : 'Low';

          return (
            <div key={`ring-${ringIndex}`} className="rounded-2xl border border-cyan-100/15 bg-[#062333]/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg text-white">Cluster #{ringIndex + 1}</p>
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs uppercase tracking-[0.12em] text-rose-100">
                  {severityLabel}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {ring.map((student) => (
                  <span key={student} className="rounded-md border border-cyan-100/15 bg-cyan-500/15 px-2.5 py-1 text-xs text-cyan-100">
                    {student.split('.')[0]}
                  </span>
                ))}
              </div>

              <div className="rounded-xl border border-cyan-100/15 bg-cyan-950/60 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100/65">Peak Pair Similarity</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">{peakScore.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RingsView;