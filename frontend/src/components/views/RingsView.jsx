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
      className="rounded-[2rem] border border-[#E2E8F0] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10"
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#2563EB]">
            <Network size={22} />
          </span>
          <div>
            <h3 className="font-display text-2xl font-bold text-[#0F172A]">Plagiarism Rings</h3>
            <p className="text-sm text-[#64748B]">Detailed intelligence on collaborative cheating networks.</p>
          </div>
        </div>
        <span className="flex h-8 items-center rounded-full bg-[#2563EB]/10 px-4 text-sm font-bold text-[#2563EB] border border-[#2563EB]/20">
          {rings.length} clusters detected
        </span>
      </div>

      {!results && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#FFFFFF]/30 py-16 text-center">
          <Activity className="mb-4 text-[#64748B]" size={32} />
          <p className="text-lg font-semibold text-[#0F172A]">No ring data available yet</p>
          <p className="mt-2 text-sm text-[#64748B]">Run an analysis in Overview to populate ring intelligence.</p>
        </div>
      )}

      {results && rings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#FFFFFF]/30 py-16 text-center">
          <ShieldAlert className="mb-4 text-[#16A34A]" size={32} />
          <p className="text-lg font-semibold text-[#0F172A]">No collaborative networks detected</p>
          <p className="mt-2 text-sm text-[#64748B]">This dataset does not contain any suspicious collaborative clusters.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {rings.map((ring, index) => {
          const isHighDensity = ring.density >= 0.8;
          const isMediumDensity = ring.density >= 0.5 && ring.density < 0.8;
          const glowColor = isHighDensity ? 'bg-[#DC2626]' : isMediumDensity ? 'bg-[#F59E0B]' : 'bg-[#2563EB]';
          const textColor = isHighDensity ? 'text-[#DC2626]' : isMediumDensity ? 'text-[#F59E0B]' : 'text-[#2563EB]';
          const borderColor = isHighDensity ? 'border-[#DC2626]/30' : isMediumDensity ? 'border-[#F59E0B]/30' : 'border-[#2563EB]/30';

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={`ring-${index}`}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#F8FAFC] to-[#FFFFFF] p-6 shadow-lg transition-all hover:shadow-xl ${borderColor}`}
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${glowColor} opacity-10 blur-3xl`}></div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users2 size={16} className={textColor} />
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${textColor}`}>
                    {ring.classification || 'Suspicious Cluster'}
                  </p>
                </div>
                <span className="rounded-md bg-[#E2E8F0]/50 px-2.5 py-1 text-xs font-semibold text-[#334155]">
                  {ring.members.length} files
                </span>
              </div>

              {/* Stats Grid */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Peak Match</p>
                  <p className="mt-1 text-lg font-bold text-[#0F172A]">{Math.round(ring.maxSimilarity)}%</p>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Average</p>
                  <p className="mt-1 text-lg font-bold text-[#0F172A]">{Math.round(ring.averageSimilarity)}%</p>
                </div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">Density</p>
                  <p className="mt-1 text-lg font-bold text-[#0F172A]">{Math.round(ring.density * 100)}%</p>
                </div>
              </div>

              {/* Members List */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Involved Files</p>
                <div className="flex flex-wrap gap-2">
                  {ring.members.map((student) => (
                    <span
                      key={student}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#334155] transition-colors hover:border-[#2563EB]/50 hover:text-[#2563EB]"
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