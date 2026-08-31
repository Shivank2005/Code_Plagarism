import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Network, ShieldAlert, Activity } from 'lucide-react';

const RingsView = ({ results }) => {
  const rings = results?.rings || [];

  return (
    <motion.div
      key="rings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="card p-6 sm:p-8 lg:p-10"
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-default)] pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--accent)]">
            <Network size={22} />
          </span>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Plagiarism Rings</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Detailed intelligence on collaborative cheating networks.</p>
          </div>
        </div>
        <span className="flex h-8 items-center rounded-full bg-[var(--accent)]/10 px-4 text-sm font-bold text-[var(--accent)] border border-[var(--accent)]/20">
          {rings.length} clusters detected
        </span>
      </div>

      {!results && (
        <div className="card-flat border-dashed flex flex-col items-center justify-center py-16 text-center">
          <Activity className="mb-4 text-[var(--text-tertiary)]" size={32} />
          <p className="text-lg font-semibold text-[var(--text-primary)]">No ring data available yet</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Run an analysis in Overview to populate ring intelligence.</p>
        </div>
      )}

      {results && rings.length === 0 && (
        <div className="card-flat border-dashed flex flex-col items-center justify-center py-16 text-center">
          <ShieldAlert className="mb-4 text-[var(--success)]" size={32} />
          <p className="text-lg font-semibold text-[var(--text-primary)]">No collaborative networks detected</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">This dataset does not contain any suspicious collaborative clusters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {rings.map((ring, index) => {
          const isHighDensity = ring.density >= 0.8;
          const isMediumDensity = ring.density >= 0.5 && ring.density < 0.8;
          const glowColor = isHighDensity ? 'bg-[var(--danger)]' : isMediumDensity ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]';
          const textColor = isHighDensity ? 'text-[var(--danger)]' : isMediumDensity ? 'text-[var(--warning)]' : 'text-[var(--accent)]';
          const borderColor = isHighDensity ? 'border-[var(--danger)]/30' : isMediumDensity ? 'border-[var(--warning)]/30' : 'border-[var(--border-default)]';

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={`ring-${index}`}
              className={`relative overflow-hidden rounded-2xl border bg-[var(--bg-primary)] p-6 shadow-sm transition-all hover:shadow-md ${borderColor}`}
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${glowColor} opacity-[0.08] blur-3xl`}></div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users2 size={16} className={textColor} />
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${textColor}`}>
                    {ring.classification || 'Suspicious Cluster'}
                  </p>
                </div>
                <span className="rounded-md bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] border border-[var(--border-default)]">
                  {ring.members.length} files
                </span>
              </div>

              {/* Stats Grid */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Peak Match</p>
                  <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{Math.round(ring.maxSimilarity)}%</p>
                </div>
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Average</p>
                  <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{Math.round(ring.averageSimilarity)}%</p>
                </div>
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Density</p>
                  <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{Math.round(ring.density * 100)}%</p>
                </div>
              </div>

              {/* Evaluator Notes / Bullet Points */}
              <div className="mb-6 rounded-xl bg-[var(--bg-secondary)]/50 p-4 border border-[var(--border-subtle)]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Evaluator Insights</p>
                <ul className="list-disc space-y-1.5 pl-4 text-sm text-[var(--text-secondary)] marker:text-[var(--text-tertiary)]">
                  <li>
                    <strong>Classification:</strong> {ring.classification || 'Suspicious Cluster'} detected involving {ring.members.length} submissions.
                  </li>
                  <li>
                    <strong>Network Density ({Math.round(ring.density * 100)}%):</strong>{' '}
                    {isHighDensity 
                      ? "High density suggests a highly organized sharing ring where almost all members copied from each other or a single source." 
                      : isMediumDensity 
                      ? "Moderate density implies a chained copying pattern where code was passed sequentially between students."
                      : "Low density suggests loose unauthorized collaboration."}
                  </li>
                  <li>
                    <strong>Peak Match ({Math.round(ring.maxSimilarity)}%):</strong>{' '}
                    {ring.maxSimilarity >= 95 
                      ? "Contains near-exact copies. Investigation highly recommended."
                      : "Shows heavy structural and semantic similarities."}
                  </li>
                  <li>
                    <strong>Average Overlap ({Math.round(ring.averageSimilarity)}%):</strong> Indicates the overall severity of plagiarism across the entire cluster.
                  </li>
                </ul>
              </div>

              {/* Members List */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Involved Files</p>
                <div className="flex flex-wrap gap-2">
                  {ring.members.map((student) => (
                    <span
                      key={student}
                      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                    >
                      {student}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RingsView;