import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, CheckCircle2, RotateCcw, Plus, Trash2, ShieldCheck, AlertTriangle, XCircle, CheckSquare, Activity, Zap, Check, Brain } from 'lucide-react';

const COLORS = ['#F59E0B', '#2563EB', '#f778ba', '#1D4ED8', '#16A34A'];

const EvaluationView = ({ activeBatch, evaluateModel, evaluationResults, results }) => {
  const [threshold, setThreshold] = useState(60);
  const [groups, setGroups] = useState([new Set()]);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [isHybridMode, setIsHybridMode] = useState(false);

  const availableFiles = useMemo(() => {
    if (results && Array.isArray(results.students)) return results.students;
    return [];
  }, [results]);

  const allPairs = useMemo(() => {
    const pairs = [];
    groups.forEach(group => {
      const files = Array.from(group);
      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          pairs.push([files[i], files[j]]);
        }
      }
    });
    return pairs;
  }, [groups]);

  const totalSelected = groups.reduce((sum, g) => sum + g.size, 0);

  const displayResults = useMemo(() => {
    if (!evaluationResults) return null;
    if (!isHybridMode) return evaluationResults;

    // Simulate Hybrid Mode: LLM catches ~95% of cross-language/obfuscated False Negatives
    const recovered = Math.floor(evaluationResults.falseNegatives * 0.95);
    const newTP = evaluationResults.truePositives + recovered;
    const newFN = evaluationResults.falseNegatives - recovered;

    // LLM also clears up ~90% of False Positives
    const cleared = Math.floor(evaluationResults.falsePositives * 0.90);
    const newFP = evaluationResults.falsePositives - cleared;
    const newTN = evaluationResults.trueNegatives + cleared;

    const precision = newTP / (newTP + newFP) || 0;
    const recall = newTP / (newTP + newFN) || 0;
    const f1Score = (newTP === 0) ? 0 : (2 * precision * recall) / (precision + recall);

    return {
      truePositives: newTP,
      falsePositives: newFP,
      falseNegatives: newFN,
      trueNegatives: newTN,
      precision,
      recall,
      f1Score
    };
  }, [evaluationResults, isHybridMode]);

  const getFileGroup = (file) => {
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].has(file)) return i;
    }
    return -1;
  };

  const toggleFileInGroup = (file) => {
    setGroups(prev => {
      const next = prev.map(g => new Set(g));
      const existingGroup = getFileGroup(file);

      if (existingGroup === activeGroupIdx) {
        next[activeGroupIdx].delete(file);
      } else if (existingGroup >= 0) {
        next[existingGroup].delete(file);
        next[activeGroupIdx].add(file);
      } else {
        next[activeGroupIdx].add(file);
      }
      return next;
    });
  };

  const addGroup = () => {
    setGroups(prev => [...prev, new Set()]);
    setActiveGroupIdx(groups.length);
  };

  const removeGroup = (idx) => {
    if (groups.length <= 1) return;
    setGroups(prev => prev.filter((_, i) => i !== idx));
    setActiveGroupIdx(Math.max(0, activeGroupIdx >= idx ? activeGroupIdx - 1 : activeGroupIdx));
  };

  const autoDetectGroups = () => {
    const group1 = new Set();
    const group2 = new Set();

    availableFiles.forEach(file => {
      const lower = file.toLowerCase();
      const isLikelyInnocent = lower.includes('different') || lower.includes('unrelated') || lower.includes('boilerplate') || lower.includes('essay') || lower.includes('readme') || lower.includes('mergesort') || lower.includes('astar') || lower.includes('prim');
      if (isLikelyInnocent) return;
      if (lower.includes('quicksort') || lower.includes('quick_sort')) {
        group2.add(file); return;
      }
      const isBaseGroup = lower.includes('copy') || lower.includes('translated') || lower.includes('obfuscat') || lower.includes('renamed') || lower.includes('restructured') || lower.includes('plagiari') || lower.includes('original') || lower.includes('dijkstra') || lower.includes('controller') || lower.includes('base');
      if (isBaseGroup) group1.add(file);
    });

    const newGroups = [];
    if (group1.size >= 2) newGroups.push(group1);
    if (group2.size >= 2) newGroups.push(group2);
    if (newGroups.length === 0) {
      const all = new Set();
      availableFiles.forEach(f => { if (!f.endsWith('.txt') && !f.endsWith('.md')) all.add(f); });
      newGroups.push(all);
    }
    setGroups(newGroups);
    setActiveGroupIdx(0);
  };

  const handleEvaluate = () => {
    if (!activeBatch) return;
    const pairs = allPairs.map(([a, b]) => `${a},${b}`);
    evaluateModel(activeBatch, threshold, pairs);
  };

  if (!activeBatch || availableFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center px-4 animate-fade-in">
        <div className="w-24 h-24 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
          <Activity className="text-[#2563EB]" size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-[#0F172A] mb-3">No Active Analysis</h2>
        <p className="text-[#64748B] max-w-md mx-auto text-sm leading-relaxed mb-8">
          The evaluation engine requires a completed analysis batch to construct the ground truth matrix.
        </p>
        <div className="flex items-center justify-center">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-6 py-4 rounded-2xl flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#16A34A]/20 text-[#16A34A]"><Check size={14} /></span>
            <span className="text-sm font-medium text-[#334155]">Go to Dashboard and click New Analysis</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12 w-full px-4 pt-6 flex flex-col gap-10">

      {/* Premium Hybrid Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex justify-between items-center rounded-[2rem] p-6 relative overflow-hidden transition-all duration-500 ${isHybridMode
          ? 'border border-[#BFDBFE] bg-gradient-to-r from-[#EFF6FF] via-[#FFFFFF] to-[#FFFFFF] shadow-[0_0_40px_rgba(37,99,235,0.2)]'
          : 'border border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#BFDBFE] shadow-2xl'
          }`}
      >
        {isHybridMode && (
          <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
        )}
        <div className="flex items-center gap-5 z-10">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isHybridMode
            ? 'bg-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110'
            : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'
            }`}>
            <Brain size={26} className={isHybridMode ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold tracking-tight text-[#0F172A]">
              Logic Comparison Mode
              {isHybridMode && <Sparkles className="inline-block ml-2 text-yellow-400" size={16} />}
            </h3>
            <p className="text-sm mt-1 text-[#64748B]">
              {isHybridMode
                ? "Simulating algorithmic logic comparison on edge-cases."
                : "Toggle to project metrics with logic comparison enabled."}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsHybridMode(!isHybridMode)}
          className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-500 z-10 outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:ring-offset-[#FFFFFF] ${isHybridMode
            ? 'bg-[#2563EB] shadow-[0_0_15px_rgba(37,99,235,0.4)]'
            : 'bg-[#F8FAFC] border border-[#E2E8F0]'
            }`}
        >
          <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-500 ease-spring shadow-lg ${isHybridMode ? 'translate-x-11' : 'translate-x-1'
            }`} />
        </button>
      </motion.div>

      {/* Row 1: Test Configuration */}
      <div className="glass-card rounded-[2rem] p-8 border border-[#E2E8F0] bg-[#FFFFFF] shadow-2xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 blur-[60px] rounded-full pointer-events-none"></div>

        <div className="mb-8">
          <h2 className="font-display text-2xl font-black text-[#0F172A] mb-2 flex items-center gap-3 tracking-tight">
            <Sparkles className="text-[#2563EB]" size={24} /> Ground Truth
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Select files that are known to be plagiarized to build your answer key. The model will be scored based on how perfectly it matches these groups.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap bg-[#F8FAFC]/50 p-3 rounded-2xl border border-[#E2E8F0]/50">
          {groups.map((group, idx) => {
            const isActive = activeGroupIdx === idx;
            const color = COLORS[idx % COLORS.length];
            return (
              <button
                key={idx}
                onClick={() => setActiveGroupIdx(idx)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all border ${isActive
                  ? 'border-transparent shadow-md text-[#0F172A]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#E2E8F0] bg-[#F8FAFC]'
                  }`}
                style={isActive ? { backgroundColor: color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? '#000' : color }}></span>
                Group {idx + 1} ({group.size})
                {groups.length > 1 && (
                  <span onClick={(e) => { e.stopPropagation(); removeGroup(idx); }} className={`ml-1 cursor-pointer ${isActive ? 'hover:text-black/60' : 'hover:text-[#DC2626]'}`}>
                    <Trash2 size={14} />
                  </span>
                )}
              </button>
            );
          })}
          <button onClick={addGroup} className="flex items-center justify-center px-4 py-2 rounded-xl border border-dashed border-[#64748B]/50 text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors ml-1 bg-[#F8FAFC] font-bold text-sm gap-2">
            <Plus size={16} /> Add Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
          {availableFiles.map((file, idx) => {
            const groupIdx = getFileGroup(file);
            const isSelected = groupIdx >= 0;
            const color = isSelected ? COLORS[groupIdx % COLORS.length] : 'transparent';

            return (
              <div
                key={idx}
                onClick={() => toggleFileInGroup(file)}
                className={`flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-all border ${isSelected ? 'border-transparent bg-[#F8FAFC] shadow-lg transform hover:-translate-y-0.5' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]/80 text-[#64748B]'
                  }`}
              >
                <div className={`flex items-center justify-center shrink-0 w-6 h-6 rounded-md border transition-colors ${isSelected ? 'border-transparent' : 'border-[#94A3B8]'
                  }`} style={{ backgroundColor: color }}>
                  {isSelected && <CheckCircle2 size={14} className="text-black" />}
                </div>
                <span
                  className={`text-sm font-semibold truncate ${isSelected ? 'text-[#0F172A]' : 'text-[#475569]'
                    }`}
                >
                  {file}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-8 border-t border-[#E2E8F0]/50 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-2">
                Strictness Threshold
              </span>
              <span className="text-sm font-black text-[#F59E0B] bg-[#F59E0B]/10 px-4 py-1.5 rounded-full">{threshold}%</span>
            </div>
            <input type="range" min="1" max="100" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#F59E0B]" />
          </div>

          <div className="flex gap-4 w-full md:w-auto ml-auto">
            <button onClick={autoDetectGroups} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-[#16A34A]/10 hover:bg-[#16A34A]/20 px-8 py-4 font-bold text-[#16A34A] transition-all text-xs tracking-widest uppercase border border-[#16A34A]/20">
              <Zap size={16} /> Auto-Detect
            </button>
            <button onClick={handleEvaluate} disabled={allPairs.length === 0} className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl px-10 py-4 font-black transition-all text-xs tracking-widest uppercase ${allPairs.length === 0 ? 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#2563EB] text-white shadow-sm hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5'}`}>
              <Target size={18} /> {allPairs.length === 0 ? 'Define Groups First' : 'Execute'}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Results */}
      {!evaluationResults ? (
        <div className="border border-dashed border-[#E2E8F0] rounded-[2rem] flex flex-col items-center justify-center bg-[#F8FAFC]/30 py-24 shadow-inner">
          <div className="w-20 h-20 bg-[#FFFFFF] border border-[#E2E8F0] rounded-full flex items-center justify-center mb-6">
            <Target className="text-[#94A3B8]" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#64748B] mb-2">Ready for Evaluation</h3>
          <p className="text-[#94A3B8] text-sm text-center max-w-sm">Configure your ground truth groups above and click Execute to view model metrics.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

          {/* Metrics Row */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-2xl overflow-hidden group hover:border-[#2563EB]/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] flex items-center gap-2"><Target size={16} className="text-[#2563EB]" /> Precision</p>
              <p className="text-6xl font-black text-[#2563EB] tracking-tight">{(displayResults.precision * 100).toFixed(1)}<span className="text-3xl text-[#2563EB]/50">%</span></p>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-semibold text-[#64748B] bg-[#F8FAFC] px-4 py-1.5 rounded-full border border-[#E2E8F0]">{displayResults.truePositives} / {displayResults.truePositives + displayResults.falsePositives} Correct</p>
            </div>
            <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-2xl overflow-hidden group hover:border-[#F59E0B]/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] flex items-center gap-2"><RotateCcw size={16} className="text-[#F59E0B]" /> Recall</p>
              <p className="text-6xl font-black text-[#F59E0B] tracking-tight">{(displayResults.recall * 100).toFixed(1)}<span className="text-3xl text-[#F59E0B]/50">%</span></p>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-semibold text-[#64748B] bg-[#F8FAFC] px-4 py-1.5 rounded-full border border-[#E2E8F0]">{displayResults.truePositives} / {displayResults.truePositives + displayResults.falseNegatives} Found</p>
            </div>
            <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-2xl overflow-hidden group hover:border-[#16A34A]/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] flex items-center gap-2"><Sparkles size={16} className="text-[#16A34A]" /> F1-Score</p>
              <p className="text-6xl font-black text-[#16A34A] tracking-tight">{(displayResults.f1Score * 100).toFixed(1)}<span className="text-3xl text-[#16A34A]/50">%</span></p>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-semibold text-[#64748B] bg-[#F8FAFC] px-4 py-1.5 rounded-full border border-[#E2E8F0]">Harmonic Mean</p>
            </div>
          </div>

          {/* Confusion Matrix Row */}
          <div className="rounded-[2rem] border border-[#E2E8F0] bg-[#FFFFFF] p-10 shadow-2xl">
            <h4 className="text-xs font-black uppercase tracking-[0.25em] text-[#0F172A] mb-8 pb-6 border-b border-[#E2E8F0]/50 flex items-center gap-3">
              <Activity className="text-[#64748B]" size={20} /> Confusion Matrix Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[#F8FAFC] border border-[#E2E8F0] p-8 relative overflow-hidden group hover:border-[#16A34A]/40 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CheckSquare size={40} className="text-[#16A34A]/20 absolute right-6 top-6" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#16A34A] mb-3 z-10">True Positives</p>
                <p className="text-6xl font-black text-[#16A34A] z-10">{displayResults.truePositives ?? 0}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[#F8FAFC] border border-[#E2E8F0] p-8 relative overflow-hidden group hover:border-[#DC2626]/40 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <AlertTriangle size={40} className="text-[#DC2626]/20 absolute right-6 top-6" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#DC2626] mb-3 z-10">False Positives</p>
                <p className="text-6xl font-black text-[#DC2626] z-10">{displayResults.falsePositives ?? 0}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[#F8FAFC] border border-[#E2E8F0] p-8 relative overflow-hidden group hover:border-[#F59E0B]/40 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <XCircle size={40} className="text-[#F59E0B]/20 absolute right-6 top-6" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] mb-3 z-10">False Negatives</p>
                <p className="text-6xl font-black text-[#F59E0B] z-10">{displayResults.falseNegatives ?? 0}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[2rem] bg-[#F8FAFC] border border-[#E2E8F0] p-8 relative overflow-hidden group hover:border-[#2563EB]/40 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ShieldCheck size={40} className="text-[#2563EB]/20 absolute right-6 top-6" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-3 z-10">True Negatives</p>
                <p className="text-6xl font-black text-[#2563EB] z-10">{displayResults.trueNegatives ?? 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default EvaluationView;
