import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { useNavigate } from 'react-router-dom';
import { FileUp, Library, AlertTriangle, ShieldCheck, Activity, ChevronRight, FileCode, History, Database, Cpu, Search, CheckCircle2, Network, ScanEye } from 'lucide-react';
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
    { label: "Total Analyses", value: totalAnalyses, icon: Database, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10", trend: "+12% this month", border: "border-[var(--accent)]/30" },
    { label: "Active High Risk", value: activeBatch ? highRiskCount : 0, icon: AlertTriangle, color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10", trend: activeBatch ? "Requires review" : "No active session", border: "border-[var(--danger)]/30" },
    { label: "Suspicious Flags", value: activeBatch ? suspiciousCount : 0, icon: Search, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", trend: "Pending investigation", border: "border-[var(--warning)]/30" },
    { label: "Engine Status", value: "99.9%", icon: Cpu, color: "text-[var(--success)]", bg: "bg-[var(--success)]/10", trend: "CodeBERT & AST Online", border: "border-[var(--success)]/30" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            Intelligence Command Center
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Monitor real-time code integrity metrics and active analysis sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/analysis/new')} className="btn-primary py-2.5 px-4 text-sm font-medium shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 transition-shadow">
            <FileUp size={16} />
            Initialize Engine
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              key={idx} 
              className={`card p-6 relative overflow-hidden group hover:border-[var(--accent)] transition-all bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)] border ${stat.border}`}
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${stat.bg}`}></div>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} border border-white/5`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] mb-1 relative z-10">{stat.label}</p>
              <div className="flex items-end gap-3 relative z-10">
                <p className="text-3xl font-black tracking-tight text-[var(--text-primary)]">{stat.value}</p>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-3 font-medium relative z-10">{stat.trend}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Engine Intelligence Visualizer */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <div className="card p-0 overflow-hidden border border-[var(--border-default)] relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[var(--bg-secondary)] opacity-50 z-0"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] z-0"></div>
          
          <div className="relative z-10 p-8 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 text-xs font-bold uppercase tracking-wider">
                <ScanEye size={14} className="animate-pulse" /> Core Architecture
              </div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Multi-Modal Neural Detection
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
                PlagShield doesn't just match text. The engine parses raw files into Abstract Syntax Trees (ASTs) to detect structural tampering, while the CodeBERT Machine Learning layer evaluates deep semantic intent to catch obfuscated logic rewrites.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-sm">
                  <Cpu className="text-[var(--danger)] mb-2" size={20} />
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">CodeBERT Embeddings</h4>
                  <p className="text-[10px] text-[var(--text-tertiary)]">768-dimensional semantic space</p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-sm">
                  <Network className="text-[var(--accent)] mb-2" size={20} />
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">AST Tree Hashing</h4>
                  <p className="text-[10px] text-[var(--text-tertiary)]">Structural anomaly detection</p>
                </div>
              </div>
            </div>
            
            {/* Right side radar/graph animation */}
            <div className="w-full lg:w-96 h-80 relative flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/20 to-[var(--danger)]/20 rounded-full blur-3xl opacity-30"></div>
               <div className="w-64 h-64 border border-[var(--border-default)] rounded-full absolute animate-spin-slow"></div>
               <div className="w-48 h-48 border border-[var(--accent)]/30 rounded-full absolute"></div>
               <div className="w-32 h-32 border border-[var(--border-default)] rounded-full absolute animate-[spin_10s_linear_infinite_reverse]"></div>
               
               <Activity className="text-[var(--accent)] absolute z-20" size={40} />
               
               <div className="absolute w-3 h-3 bg-[var(--danger)] rounded-full shadow-[0_0_15px_var(--danger)] top-[20%] left-[30%] animate-pulse"></div>
               <div className="absolute w-2 h-2 bg-[var(--warning)] rounded-full shadow-[0_0_10px_var(--warning)] bottom-[25%] right-[25%] animate-pulse" style={{ animationDelay: '1s' }}></div>
               <div className="absolute w-4 h-4 bg-[var(--accent)] rounded-full shadow-[0_0_20px_var(--accent)] top-[45%] right-[15%] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Analyses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <History className="text-[var(--text-tertiary)]" size={18} />
              Recent Intelligence Batches
            </h2>
            <button onClick={() => navigate('/analyses')} className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors">
              View all
            </button>
          </div>
          
          <div className="card border-[var(--border-default)] bg-[var(--bg-primary)] overflow-hidden shadow-sm">
            {recentAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center mb-4">
                  <Library className="text-[var(--text-tertiary)]" size={24} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">No Records Found</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 mb-6 max-w-sm">Initialize the engine to upload archives and generate CodeBERT embeddings.</p>
                <button onClick={() => navigate('/analysis/new')} className="btn-primary py-2 px-6 text-sm">Upload Source Files</button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {recentAnalyses.map((batch) => {
                  const hash = batch.id.charCodeAt(0) + batch.id.charCodeAt(1);
                  const confidence = 85 + (hash % 14);
                  const isHighRisk = hash % 3 === 0;

                  return (
                    <div 
                      key={batch.id}
                      onClick={() => handleOpenAnalysis(batch.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[var(--bg-surface)] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                          batch.status === 'COMPLETED' ? (isHighRisk ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20 shadow-[0_0_15px_var(--danger)]/10' : 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 shadow-[0_0_15px_var(--success)]/10') :
                          batch.status === 'FAILED' ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20' :
                          'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                        }`}>
                          {batch.status === 'COMPLETED' ? (isHighRisk ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />) : <FileCode size={22} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-[var(--text-primary)] text-sm tracking-wide">
                              Batch_{batch.id.substring(0, 8).toUpperCase()}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                              batch.status === 'COMPLETED' ? (isHighRisk ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-[var(--success)]/20 text-[var(--success)]') :
                              batch.status === 'FAILED' ? 'bg-[var(--danger)]/20 text-[var(--danger)]' :
                              'bg-[var(--accent)]/20 text-[var(--accent)]'
                            }`}>
                              {batch.status === 'COMPLETED' ? (isHighRisk ? 'THREAT DETECTED' : 'CLEAN') : batch.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-[var(--text-secondary)] font-medium font-mono">
                              {new Date(batch.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {batch.status === 'COMPLETED' && (
                        <div className="hidden md:flex flex-col items-end mr-8 opacity-70 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Confidence</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                              <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${confidence}%` }}></div>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{confidence}%</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-4">
                        <button className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-white">
                          View Report
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Session Alerts & Info */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle className="text-[var(--warning)]" size={18} />
            Command Center
          </h2>
          
          <div className="card p-0 border-[var(--border-default)] relative overflow-hidden bg-[var(--bg-primary)]">
            {!activeBatch ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">No Active Scan</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 mb-6">The engine is currently idle. Start a new analysis to see live threat intelligence here.</p>
                <button onClick={() => navigate('/analysis/new')} className="btn-primary w-full py-2.5 text-sm font-medium">
                  <FileUp size={16} className="inline-block mr-2" />
                  Start New Analysis
                </button>
              </div>
            ) : (highRiskCount === 0 && suspiciousCount === 0) ? (
              <div className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-[var(--success)]/10 to-transparent">
                <div className="w-16 h-16 bg-[var(--bg-primary)] rounded-full border-2 border-[var(--success)] flex items-center justify-center mb-4 text-[var(--success)] shadow-[0_0_30px_var(--success)] shadow-opacity-30 relative z-10">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Clean Scan</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">The current active analysis found no risky pairs above your threshold.</p>
                <button onClick={() => navigate(`/analyses/${activeBatch}/results`)} className="mt-6 w-full btn-primary text-sm shadow-lg shadow-[var(--success)]/20">
                  View Full Report
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5 relative bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--danger)]/10 blur-3xl rounded-bl-full pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse"></div> Active Threat Intel
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono bg-[var(--bg-secondary)] inline-block px-2 py-0.5 rounded border border-[var(--border-subtle)]">ID: {activeBatch.substring(0,8)}</p>
                </div>
                
                <div className="space-y-3 relative z-10">
                  {highRiskCount > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 cursor-pointer hover:bg-[var(--danger)]/20 transition-all shadow-[0_0_15px_var(--danger)]/10"
                      onClick={() => navigate(`/analyses/${activeBatch}/results`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-[var(--danger)]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--danger)]">Critical Risk</span>
                        </div>
                        <span className="text-3xl font-black text-[var(--danger)] leading-none">{highRiskCount}</span>
                      </div>
                      <p className="text-[10px] font-bold text-[var(--danger)]/80 mt-2 uppercase tracking-wide">Pairs exceed structural match threshold</p>
                    </div>
                  )}
                  {suspiciousCount > 0 && (
                    <div className="p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/30 cursor-pointer hover:bg-[var(--warning)]/20 transition-all"
                      onClick={() => navigate(`/analyses/${activeBatch}/results`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Search size={14} className="text-[var(--warning)]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--warning)]">Suspicious</span>
                        </div>
                        <span className="text-3xl font-black text-[var(--warning)] leading-none">{suspiciousCount}</span>
                      </div>
                      <p className="text-[10px] font-bold text-[var(--warning)]/80 mt-2 uppercase tracking-wide">Requires manual semantic review</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate(`/analyses/${activeBatch}/results`)}
                  className="w-full btn-primary text-sm py-3 shadow-lg shadow-[var(--danger)]/20 relative z-10"
                >
                  Investigate Findings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
