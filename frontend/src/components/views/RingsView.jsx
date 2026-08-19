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
      className="glass-card rounded-[2rem] border border-[#30363d] p-6 shadow-[0_16px_40px_rgba(1,4,9,0.35)] sm:p-8 lg:p-10"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] text-[#58a6ff]">
            <Network size={22} />
          </span>
          <div>
            <h3 className="font-display text-2xl font-bold text-[#e6edf3]">Plagiarism Rings</h3>
            <p className="text-sm text-[#8b949e]">Detailed intelligence on collaborative cheating networks.</p>
          </div>
        </div>
        <span className="flex h-8 items-center rounded-full bg-[#58a6ff]/10 px-4 text-sm font-bold text-[#58a6ff] border border-[#58a6ff]/20">
          {rings.length} clusters detected
        </span>
      </div>

      {!results && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#30363d] bg-[#0d1117]/30 py-16 text-center">
          <Activity className="mb-4 text-[#8b949e]" size={32} />
          <p className="text-lg font-semibold text-[#e6edf3]">No ring data available yet</p>
          <p className="mt-2 text-sm text-[#8b949e]">Run an analysis in Overview to populate ring intelligence.</p>
        </div>
      )}

      {results && rings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#30363d] bg-[#0d1117]/30 py-16 text-center">
          <ShieldAlert className="mb-4 text-[#22c55e]" size={32} />
          <p className="text-lg font-semibold text-[#e6edf3]">No collaborative networks detected</p>
          <p className="mt-2 text-sm text-[#8b949e]">This dataset does not contain any suspicious collaborative clusters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {rings.map((ring, index) => {
          const isHighDensity = ring.density >= 0.8;
          const isMediumDensity = ring.density >= 0.5 && ring.density < 0.8;
          const glowColor = isHighDensity ? 'bg-[#f85149]' : isMediumDensity ? 'bg-[#d29922]' : 'bg-[#58a6ff]';
          const textColor = isHighDensity ? 'text-[#f85149]' : isMediumDensity ? 'text-[#d29922]' : 'text-[#58a6ff]';
          const borderColor = isHighDensity ? 'border-[#f85149]/30' : isMediumDensity ? 'border-[#d29922]/30' : 'border-[#58a6ff]/30';

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={`ring-${index}`}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#161b22] to-[#0d1117] p-6 shadow-lg transition-all hover:shadow-xl ${borderColor}`}
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${glowColor} opacity-10 blur-3xl`}></div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users2 size={16} className={textColor} />
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${textColor}`}>
                    {ring.classification || 'Suspicious Cluster'}
                  </p>
                </div>
                <span className="rounded-md bg-[#30363d]/50 px-2.5 py-1 text-xs font-semibold text-[#c9d1d9]">
                  {ring.members.length} files
                </span>
              </div>

              {/* Stats Grid */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#30363d] bg-[#0d1117]/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#8b949e]">Peak Match</p>
                  <p className="mt-1 text-lg font-bold text-[#e6edf3]">{Math.round(ring.maxSimilarity)}%</p>
                </div>
                <div className="rounded-xl border border-[#30363d] bg-[#0d1117]/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#8b949e]">Average</p>
                  <p className="mt-1 text-lg font-bold text-[#e6edf3]">{Math.round(ring.averageSimilarity)}%</p>
                </div>
                <div className="rounded-xl border border-[#30363d] bg-[#0d1117]/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#8b949e]">Density</p>
                  <p className="mt-1 text-lg font-bold text-[#e6edf3]">{Math.round(ring.density * 100)}%</p>
                </div>
              </div>

              {/* Members List */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b949e]">Involved Files</p>
                <div className="flex flex-wrap gap-2">
                  {ring.members.map((student) => (
                    <span
                      key={student}
                      className="rounded-lg border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#c9d1d9] transition-colors hover:border-[#58a6ff]/50 hover:text-[#58a6ff]"
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