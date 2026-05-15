import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, ChevronRight, Download, Trash2 } from 'lucide-react';

const HistoryView = ({ filteredHistory, onExport, onClear, onOpenBatch }) => {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-6 sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-2xl font-bold text-white">Analysis History</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-cyan-950/60 px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-900/80"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-100/20 bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-100 transition-colors hover:bg-orange-500/30"
          >
            <Trash2 size={15} /> Clear History
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="rounded-2xl border border-cyan-100/10 bg-cyan-500/5 p-8 text-center">
          <p className="font-display text-xl text-white">No matching analysis records</p>
          <p className="mt-2 text-sm text-cyan-100/60">Try a different search phrase or run a new analysis batch.</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredHistory.map((batch, i) => (
          <motion.div
            key={batch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group cursor-pointer rounded-2xl border border-cyan-100/15 bg-[#062333]/60 p-5 transition-all hover:bg-[#072b40]/80"
            onClick={() => onOpenBatch(batch.id)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    batch.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : batch.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-200'
                        : 'bg-cyan-500/20 text-cyan-100'
                  }`}
                >
                  {batch.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <BarChart3 size={24} />}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-white transition-colors group-hover:text-cyan-100">
                    {batch.id.substring(0, 8)}...
                  </p>
                  <p className="text-xs text-cyan-100/60">{new Date(batch.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    batch.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-100'
                      : batch.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-100'
                        : 'bg-cyan-500/20 text-cyan-100'
                  }`}
                >
                  {batch.status}
                </span>
                <ChevronRight className="text-cyan-100/50 transition-colors group-hover:text-cyan-50" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryView;