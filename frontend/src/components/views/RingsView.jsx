import React from 'react';
import { motion } from 'framer-motion';

const RingsView = ({ results, normalizedRings, getPairScore, riskThreshold, suspiciousThreshold }) => {
  return (
    <motion.div
      key="rings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="card p-6 sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="page-title">Plagiarism Rings</h3>
        <span className="badge badge-neutral">
          {normalizedRings.length} clusters
        </span>
      </div>

      {!results && (
        <div className="card-flat p-8 text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No ring data available yet</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>Run an analysis in Overview to populate ring intelligence.</p>
        </div>
      )}

      {results && normalizedRings.length === 0 && (
        <div className="card-flat p-8 text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No collaboration rings detected</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>Current dataset does not contain suspicious collaborative clusters.</p>
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
          const severityBadge = peakScore > riskThreshold ? 'badge-danger' : peakScore >= suspiciousThreshold ? 'badge-warning' : 'badge-success';

          return (
            <div key={`ring-${ringIndex}`} className="card-flat p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cluster #{ringIndex + 1}</p>
                <span className={`badge ${severityBadge}`}>
                  {severityLabel}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {ring.map((student) => (
                  <span
                    key={student}
                    className="rounded-md px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: 'var(--accent-muted)',
                      color: 'var(--accent-light)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    {student.split('.')[0]}
                  </span>
                ))}
              </div>

              <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
                <p className="section-label">Peak Pair Similarity</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{peakScore.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RingsView;