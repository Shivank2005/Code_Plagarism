import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import { FileUp, Library, AlertTriangle, ShieldCheck, Activity, ChevronRight, FileCode, History, Database, Cpu, Search, CheckCircle2, Network } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OverviewPage() {
  const { filteredHistory, activeBatch, highRiskPairs, suspiciousPairs, fetchResults } = usePlagShield();
  const navigate = useNavigate();

  const recentAnalyses = filteredHistory?.slice(0, 5) || [];
  const totalAnalyses = filteredHistory?.length || 0;

  const highRiskCount = typeof highRiskPairs === 'number' ? highRiskPairs : 0;
  const suspiciousCount = typeof suspiciousPairs === 'number' ? suspiciousPairs : 0;

  const handleOpenAnalysis = (batchId) => {
    fetchResults(batchId);
    navigate(`/analyses/${batchId}/results`);
  };

  const statCards = [
    { label: "Total Analyses", value: totalAnalyses, icon: Database, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10", trend: "+12% this month" },
    { label: "Active High Risk", value: activeBatch ? highRiskCount : 0, icon: AlertTriangle, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10", trend: activeBatch ? "Requires review" : "No active session" },
    { label: "Suspicious Flags", value: activeBatch ? suspiciousCount : 0, icon: Search, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", trend: "Pending investigation" },
    { label: "System Health", value: "99.9%", icon: Cpu, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", trend: "All engines operational" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            Overview Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Monitor your code integrity metrics and recent analysis sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/analysis/new')} className="btn-primary py-2.5 px-4 text-sm font-medium">
            <FileUp size={16} />
            New Analysis
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-5 hover:border-[var(--border-default)] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <div>
                <h3 className="text-[28px] font-extrabold text-[var(--text-primary)] leading-none mb-1">{stat.value}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-3 font-medium">{stat.trend}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Workflow Guide */}
      <div className="card p-8 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
          <ShieldCheck className="text-[var(--accent)]" size={22} />
          Analysis Workflow
        </h2>
        
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {/* Connecting Line (desktop only) */}
          <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent)]/40 to-[var(--accent)]/10 z-0 border-t border-dashed border-[var(--accent)]/50"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--accent)] shadow-sm group-hover:scale-110 group-hover:border-[var(--accent)]/50 transition-all duration-300 mb-5 relative">
              <FileUp size={24} />
              <div className="absolute -bottom-2.5 -right-2.5 h-6 w-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold flex items-center justify-center text-[var(--text-primary)] shadow-sm">1</div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-2 uppercase tracking-wide">Upload & Parse</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[260px]">
              Upload source archives. The system automatically extracts files, identifies languages, and constructs <strong className="text-[var(--text-primary)] font-semibold">Abstract Syntax Trees (ASTs)</strong>.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--accent)] shadow-sm group-hover:scale-110 group-hover:border-[var(--accent)]/50 transition-all duration-300 mb-5 relative">
              <Cpu size={24} />
              <div className="absolute -bottom-2.5 -right-2.5 h-6 w-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold flex items-center justify-center text-[var(--text-primary)] shadow-sm">2</div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-2 uppercase tracking-wide">Semantic Scan</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[260px]">
              Leverages <strong className="text-[var(--text-primary)] font-semibold">CodeBERT embeddings</strong> to understand code intent, detecting evasions like variable renaming or structural reordering.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--accent)] shadow-sm group-hover:scale-110 group-hover:border-[var(--accent)]/50 transition-all duration-300 mb-5 relative">
              <Network size={24} />
              <div className="absolute -bottom-2.5 -right-2.5 h-6 w-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold flex items-center justify-center text-[var(--text-primary)] shadow-sm">3</div>
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-2 uppercase tracking-wide">Network Intelligence</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[260px]">
              Results compile into interactive <strong className="text-[var(--text-primary)] font-semibold">collusion rings</strong>. Dive into file pairs using the side-by-side AST Diff Viewer to verify cases.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="text-[var(--text-tertiary)]" size={18} />
              Recent Analysis Sessions
            </h2>
            <button onClick={() => navigate('/analyses')} className="text-sm font-medium text-[var(--accent)] hover:underline">
              View all
            </button>
          </div>

          <div className="card overflow-hidden">
            {recentAnalyses.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center bg-[var(--bg-secondary)]/30">
                <History size={32} className="text-[var(--text-tertiary)] mb-4" />
                <p className="text-lg font-semibold text-[var(--text-primary)]">No recent analyses</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">You haven't run any code plagiarism scans yet.</p>
                <button onClick={() => navigate('/analysis/new')} className="btn-secondary text-sm">
                  Start your first scan
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {recentAnalyses.map((batch) => (
                  <div 
                    key={batch.id}
                    onClick={() => handleOpenAnalysis(batch.id)}
                    className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        batch.status === 'COMPLETED' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                        batch.status === 'FAILED' ? 'bg-[var(--danger)]/10 text-[var(--danger)]' :
                        'bg-[var(--accent)]/10 text-[var(--accent)]'
                      }`}>
                        {batch.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <FileCode size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] font-mono text-sm">
                          Batch {batch.id.substring(0, 8)}...
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-[var(--text-tertiary)] font-medium">
                            {new Date(batch.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${
                            batch.status === 'COMPLETED' ? 'text-[var(--success)]' :
                            batch.status === 'FAILED' ? 'text-[var(--danger)]' :
                            'text-[var(--text-secondary)]'
                          }`}>
                            • {batch.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-[var(--accent)]">View Report</span>
                      <ChevronRight size={16} className="text-[var(--accent)]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Session Alerts & Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle className="text-[var(--warning)]" size={18} />
            Action Center
          </h2>
          
          <div className="card p-6 border-[var(--border-default)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            {!activeBatch ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <ShieldCheck size={36} className="text-[var(--success)] mb-4" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">System Secure</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">No active sessions require your immediate attention.</p>
                <button onClick={() => navigate('/analyses')} className="mt-6 w-full btn-secondary text-sm">
                  Browse Library
                </button>
              </div>
            ) : (highRiskCount === 0 && suspiciousCount === 0) ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-[var(--success)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--success)]">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Clean Scan</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">The current active analysis found no risky pairs above your threshold.</p>
                <button onClick={() => navigate(`/analyses/${activeBatch}/results`)} className="mt-6 w-full btn-secondary text-sm">
                  View Full Report
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Active Session Alerts</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">ID: {activeBatch.substring(0,8)}</p>
                </div>
                
                <div className="space-y-3">
                  {highRiskCount > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--danger)]/5 border border-[var(--danger)]/20 cursor-pointer hover:bg-[var(--danger)]/10 transition-colors"
                      onClick={() => navigate(`/analyses/${activeBatch}/results`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse"></div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--danger)]">Critical</span>
                        </div>
                        <span className="text-2xl font-black text-[var(--danger)] leading-none">{highRiskCount}</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--danger)]/80 mt-2">File pairs exceed high-risk threshold</p>
                    </div>
                  )}
                  {suspiciousCount > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--warning)]/5 border border-[var(--warning)]/20 cursor-pointer hover:bg-[var(--warning)]/10 transition-colors"
                      onClick={() => navigate(`/analyses/${activeBatch}/results`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--warning)]"></div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--warning)]">Suspicious</span>
                        </div>
                        <span className="text-2xl font-black text-[var(--warning)] leading-none">{suspiciousCount}</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--warning)]/80 mt-2">File pairs require manual investigation</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate(`/analyses/${activeBatch}/results`)}
                  className="w-full btn-primary text-sm py-2.5"
                >
                  Investigate Findings
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Info Card */}
          <div className="card p-5 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">PlagShield Engine v2.0</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Leveraging CodeBERT embeddings and syntax tree structural analysis for robust evasion detection.
            </p>
            <div className="flex gap-2">
              <span className="badge badge-neutral bg-[var(--bg-primary)]">AST Parsing</span>
              <span className="badge badge-neutral bg-[var(--bg-primary)]">Semantic Diff</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
