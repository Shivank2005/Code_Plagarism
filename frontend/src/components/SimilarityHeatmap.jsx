import React from 'react';
import { motion } from 'framer-motion';
import { Layers, AlertTriangle, Users2, Activity } from 'lucide-react';

const SimilarityHeatmap = ({ data, thresholds = { highRisk: 75, suspicious: 40 }, animateCells = true }) => {
  if (!data) {
    return (
      <div className="glass-card flex min-h-[600px] h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-cyan-100/30 p-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-100/25 bg-cyan-900/40">
          <Activity className="text-cyan-100/55" size={32} />
        </div>
        <h3 className="font-display mb-2 text-2xl font-bold text-white">No Active Dataset</h3>
        <p className="max-w-sm text-cyan-100/65">Upload a collection of code submissions to generate the structural similarity matrix.</p>
      </div>
    );
  }

  const { students, matrix, rings } = data;
  const highRiskThreshold = thresholds.highRisk ?? 75;
  const suspiciousThreshold = thresholds.suspicious ?? 40;

  return (
    <div className="glass-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h3 className="font-display flex items-center gap-4 text-2xl font-black text-white sm:text-3xl">
            <Layers className="text-cyan-300" /> Matrix Analysis
          </h3>
          <p className="mt-1 text-cyan-100/65">Cross-referencing {students.length} unique submissions</p>
        </div>
        <div className="flex gap-2">
          {rings.length > 0 && (
            <div className="flex animate-pulse items-center gap-2 rounded-xl border border-rose-100/35 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-100">
              <AlertTriangle size={14} /> {rings.length} COLLABORATION RINGS DETECTED
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="flex-1 overflow-x-auto pb-4">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="p-4"></th>
                {students.map((student, i) => (
                  <th key={i} className="min-w-[40px] whitespace-nowrap origin-bottom-left -rotate-45 p-2 text-[10px] font-black uppercase tracking-tighter text-cyan-100/60">
                    {student.split('.')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap border-r border-cyan-100/15 p-3 pr-6 text-right text-xs font-bold text-cyan-100/65">
                    {students[i].split('.')[0]}
                  </td>
                  {row.map((score, j) => (
                    <td key={j} className="p-0">
                      <motion.div 
                        initial={animateCells ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={animateCells ? { delay: (i + j) * 0.02 } : { duration: 0 }}
                        className={`flex h-10 w-10 cursor-help items-center justify-center rounded-lg text-[10px] font-black shadow-inner transition-transform hover:scale-110 ${
                          i === j ? 'opacity-20' : ''
                        }`}
                        style={{ 
                          backgroundColor: score > highRiskThreshold ? 'rgba(244, 63, 94, 0.9)' : 
                                           score > suspiciousThreshold ? 'rgba(245, 158, 11, 0.8)' : 
                                           score > 15 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(7, 42, 60, 0.45)',
                          color: score > 15 ? 'white' : 'rgba(172, 215, 236, 0.45)',
                          border: score > highRiskThreshold ? '1px solid rgba(255,255,255,0.2)' : 'none'
                        }}
                        title={`${students[i]} vs ${students[j]}: ${score.toFixed(1)}%`}
                      >
                        {score > 10 && i !== j ? Math.round(score) : ''}
                      </motion.div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-72">
          <div className="rounded-3xl border border-cyan-100/15 bg-cyan-500/5 p-6">
            <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-cyan-100/65">Legend</h4>
            <div className="space-y-4">
              <LegendItem color="bg-rose-500" label="High Risk" range={`>${highRiskThreshold}%`} />
              <LegendItem color="bg-amber-500" label="Suspicious" range={`${suspiciousThreshold}-${highRiskThreshold}%`} />
              <LegendItem color="bg-emerald-500" label="Safe" range={`0-${suspiciousThreshold}%`} />
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-100/15 bg-cyan-900/25 p-6">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-200">
              <Users2 size={14}/> Ring Clusters
            </h4>
            <div className="space-y-3">
              {rings.length === 0 ? (
                <p className="text-xs italic text-cyan-100/55">No collaborative networks found in this batch.</p>
              ) : (
                rings.map((ring, i) => (
                  <div key={i} className="rounded-xl border border-cyan-100/15 bg-[#062538]/70 p-3">
                    <p className="mb-1 text-[10px] font-bold text-cyan-100/65">CLUSTER #{i + 1}</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(ring).map(s => (
                        <span key={s} className="rounded bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-100">
                          {s.split('.')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, range }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 ${color} rounded-full`}></div>
      <span className="text-xs font-semibold text-cyan-100/85">{label}</span>
    </div>
    <span className="text-[10px] font-mono text-cyan-100/55">{range}</span>
  </div>
);

export default SimilarityHeatmap;
