import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BarChart3, ChevronRight, Download, Trash2 } from 'lucide-react';

const HistoryView = ({ filteredHistory, onExport, onClear, onOpenBatch }) => {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="card p-6 sm:p-8"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="page-title">Analysis History</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExport} className="btn-secondary">
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={onClear}
            className="btn-secondary hover:!border-red-500/50 hover:!text-red-400"
          >
            <Trash2 size={14} />
            Clear History
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredHistory.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
            No matching analysis records
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Try a different search phrase or run a new analysis batch.
          </p>
        </div>
      )}

      {/* Batch list */}
      <div className="space-y-2">
        {filteredHistory.map((batch, i) => (
          <motion.div
            key={batch.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            className="card-flat group cursor-pointer px-5 py-4 transition-colors hover:border-[#3f3f46]"
            onClick={() => onOpenBatch(batch.id)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background:
                      batch.status === 'COMPLETED'
                        ? 'rgba(34, 197, 94, 0.12)'
                        : batch.status === 'FAILED'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'var(--accent-muted)',
                    color:
                      batch.status === 'COMPLETED'
                        ? '#16A34A'
                        : batch.status === 'FAILED'
                          ? '#FCA5A5'
                          : 'var(--accent-light)',
                  }}
                >
                  {batch.status === 'COMPLETED' ? <CheckCircle2 size={18} /> : <BarChart3 size={18} />}
                </div>

                {/* Batch info */}
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {batch.id.substring(0, 8)}…
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(batch.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status badge */}
                <span
                  className={`badge ${
                    batch.status === 'COMPLETED'
                      ? 'badge-success'
                      : batch.status === 'FAILED'
                        ? 'badge-danger'
                        : 'badge-neutral'
                  }`}
                >
                  {batch.status}
                </span>
                <ChevronRight
                  size={16}
                  className="transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryView;