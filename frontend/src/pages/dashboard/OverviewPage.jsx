import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  Database,
  FileCode2,
  FileUp,
  History,
  Library,
  Network,
  ScanEye,
  Search,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OverviewPage() {
  const {
    filteredHistory,
    activeBatch,
    highRiskPairs,
    suspiciousPairs,
    fetchResults,
  } = usePlagShield();

  const navigate = useNavigate();

  const recentAnalyses = filteredHistory?.slice(0, 5) || [];
  const totalAnalyses = filteredHistory?.length || 0;
  const highRiskCount = typeof highRiskPairs === 'number' ? highRiskPairs : 0;
  const suspiciousCount =
    typeof suspiciousPairs === 'number' ? suspiciousPairs : 0;

  const totalFlagged = highRiskCount + suspiciousCount;
  const highRiskShare =
    totalFlagged > 0 ? Math.round((highRiskCount / totalFlagged) * 100) : 0;

  const handleOpenAnalysis = (batchId) => {
    fetchResults(batchId);
    navigate(`/analyses/${batchId}/results`);
  };

  const statCards = [
    {
      label: 'Total analyses',
      value: totalAnalyses,
      meta: 'Saved investigation sessions',
      icon: Database,
      tone: 'blue',
    },
    {
      label: 'High-risk pairs',
      value: activeBatch ? highRiskCount : 0,
      meta: activeBatch ? 'Above strict threshold' : 'No active session',
      icon: AlertTriangle,
      tone: 'red',
    },
    {
      label: 'Suspicious pairs',
      value: activeBatch ? suspiciousCount : 0,
      meta: activeBatch ? 'Requires closer review' : 'No active session',
      icon: Search,
      tone: 'amber',
    },
    {
      label: 'Engine availability',
      value: '99.9%',
      meta: 'CodeBERT + AST services online',
      icon: Cpu,
      tone: 'green',
    },
  ];

  const toneMap = {
    blue: {
      icon: 'bg-blue-50 text-blue-600 border-blue-100',
      line: 'bg-blue-600',
      glow: 'bg-blue-500/10',
    },
    red: {
      icon: 'bg-red-50 text-red-600 border-red-100',
      line: 'bg-red-500',
      glow: 'bg-red-500/10',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-600 border-amber-100',
      line: 'bg-amber-500',
      glow: 'bg-amber-500/10',
    },
    green: {
      icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      line: 'bg-emerald-500',
      glow: 'bg-emerald-500/10',
    },
  };

  return (
    <div className="min-h-full space-y-6 pb-8">
      {/* ============================================================
          HEADER
      ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#D9E4F2] bg-[#F7FAFF]"
      >
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              PlagShield Intelligence
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Command Center
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64748B]">
              Monitor code-integrity activity, review flagged relationships,
              and move directly into your latest investigation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/analyses')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D7E1ED] bg-white px-4 py-2.5 text-sm font-bold text-[#334155] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600"
            >
              <Library size={16} />
              Analysis Library
            </button>

            <button
              type="button"
              onClick={() => navigate('/analysis/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-blue-600/30"
            >
              <FileUp size={16} />
              New Analysis
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          KPI CARDS
      ============================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const tone = toneMap[stat.tone];

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#C9D8E9] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
            >
              <div
                className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl ${tone.glow}`}
              />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tone.icon}`}
                >
                  <Icon size={19} />
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                  Live
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>

              <div className="relative mt-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                  {stat.label}
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <p className="text-3xl font-black tracking-tight text-[#0F172A]">
                    {stat.value}
                  </p>
                </div>

                <p className="mt-2 text-[11px] font-medium text-[#64748B]">
                  {stat.meta}
                </p>
              </div>

              <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className={`h-full w-2/3 rounded-full transition-all duration-700 group-hover:w-4/5 ${tone.line}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ============================================================
          ACTIVE ANALYSIS + RISK POSTURE
      ============================================================ */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.07),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(99,102,241,0.05),transparent_30%)]" />

            <div className="relative p-6 lg:p-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                    <ScanEye size={13} />
                    Active intelligence
                  </span>

                  {activeBatch && (
                    <span className="rounded-full border border-[#E2E8F0] bg-white/5 px-2.5 py-1.5 font-mono text-[9px] text-[#64748B]">
                      {activeBatch.substring(0, 8)}
                    </span>
                  )}
                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                  Multi-modal code similarity detection
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-[#64748B] sm:text-[17px]">
                  Combine structural AST signals with semantic CodeBERT
                  analysis to identify relationships that simple text matching
                  can miss.
                </p>

                <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <EngineChip
                    icon={Cpu}
                    title="CodeBERT"
                    text="Semantic signals"
                  />
                  <EngineChip
                    icon={Network}
                    title="AST"
                    text="Structure analysis"
                  />
                  <EngineChip
                    icon={Zap}
                    title="Scoring"
                    text="Risk classification"
                  />
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl border border-[#DCE5EF] bg-white p-7 lg:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                Risk posture
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#0F172A]">
                Current findings
              </h2>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#64748B]">
              <Shield size={18} />
            </div>
          </div>

          <div className="mt-7 flex items-center justify-center">
            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full"
              style={{
                background:
                  totalFlagged > 0
                    ? `conic-gradient(#ef4444 0 ${highRiskShare}%, #f59e0b ${highRiskShare}% 100%, #E8EEF5 100%)`
                    : '#E8EEF5',
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-5xl font-black text-[#0F172A]">
                  {totalFlagged}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                  flagged pairs
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <RiskLegend
              label="High risk"
              value={highRiskCount}
              color="bg-red-500"
            />
            <RiskLegend
              label="Suspicious"
              value={suspiciousCount}
              color="bg-amber-500"
            />
          </div>

          <button
            type="button"
            disabled={!activeBatch}
            onClick={() =>
              activeBatch &&
              navigate(`/analyses/${activeBatch}/results`)
            }
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D7E1ED] bg-[#F8FAFC] px-4 py-2.5 text-xs font-bold text-[#334155] transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open findings
            <ChevronRight size={15} />
          </button>
        </motion.section>
      </div>

      {/* ============================================================
          RECENT ANALYSES
      ============================================================ */}
      <section className="overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[#E8EEF5] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History size={17} className="text-blue-600" />
              <h2 className="text-base font-black text-[#0F172A]">
                Recent analyses
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#64748B]">
              Your latest investigation sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/analyses')}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50"
          >
            View all
            <ChevronRight size={14} />
          </button>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#64748B]">
              <Library size={24} />
            </div>
            <h3 className="mt-4 text-sm font-black text-[#0F172A]">
              No analysis sessions yet
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-5 text-[#64748B]">
              Start your first investigation to populate the dashboard with
              analysis history.
            </p>
            <button
              type="button"
              onClick={() => navigate('/analysis/new')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/15 hover:bg-[#1D4ED8]"
            >
              <FileUp size={15} />
              Upload source files
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EEF2F6]">
            {recentAnalyses.map((batch, index) => {
              const isCompleted = batch.status === 'COMPLETED';
              const isFailed = batch.status === 'FAILED';

              return (
                <motion.button
                  type="button"
                  key={batch.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleOpenAnalysis(batch.id)}
                  className="group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[#F8FAFC]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isCompleted
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                        : isFailed
                          ? 'border-red-100 bg-red-50 text-red-600'
                          : 'border-blue-100 bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : isFailed ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <FileCode2 size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-mono text-xs font-bold text-[#1E293B]">
                        Batch_{batch.id.substring(0, 8).toUpperCase()}
                      </span>

                      <StatusPill status={batch.status} />
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#64748B]">
                      <CircleDot size={11} />
                      {new Date(batch.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>

                  <span className="hidden items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[10px] font-bold text-[#64748B] transition-all group-hover:border-blue-200 group-hover:text-blue-600 sm:inline-flex">
                    Open
                    <ChevronRight size={13} />
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ================================================================
   SMALL UI COMPONENTS
================================================================ */

function EngineChip({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <Icon size={15} className="text-blue-600" />
      <p className="mt-2 text-sm font-bold text-[#0F172A]">{title}</p>
      <p className="mt-0.5 text-[10px] text-[#64748B]">{text}</p>
    </div>
  );
}

function RiskLegend({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-xs font-semibold text-[#475569]">{label}</span>
      </div>
      <span className="text-xs font-black text-[#0F172A]">{value}</span>
    </div>
  );
}

function ProgressRow({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#475569]">{label}</span>
        <span className="font-mono text-[10px] font-bold text-[#64748B]">
          {value} · {percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#E9EEF5]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function PipelineStep({ number, label, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-3 text-center">
      <span className="font-mono text-[8px] font-bold text-[#64748B]">
        {number}
      </span>
      <Icon size={15} className="mx-auto mt-1.5 text-blue-600" />
      <p className="mt-1.5 text-[9px] font-bold text-[#0F172A]">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, title, text, onClick, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-[#E5EBF2] bg-[#FAFCFE] p-3 text-left transition-all hover:border-blue-200 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[#1E293B]">{title}</p>
        <p className="mt-0.5 text-[10px] text-[#64748B]">{text}</p>
      </div>

      <ChevronRight
        size={15}
        className="text-[#CBD5E1] transition-all group-hover:translate-x-0.5 group-hover:text-blue-500"
      />
    </button>
  );
}

function StatusPill({ status }) {
  const styles =
    status === 'COMPLETED'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : status === 'FAILED'
        ? 'bg-red-50 text-red-700 border-red-100'
        : 'bg-blue-50 text-blue-700 border-blue-100';

  const label =
    status === 'COMPLETED'
      ? 'Completed'
      : status === 'FAILED'
        ? 'Failed'
        : status;

  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}
