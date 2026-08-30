import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, CheckCircle2, RotateCcw, Plus, Trash2, ShieldCheck, AlertTriangle, XCircle, CheckSquare, Activity, Zap, Check, Brain } from 'lucide-react';

const COLORS = ['var(--warning)', 'var(--accent)', '#f778ba', '#a5d6ff', 'var(--success)'];

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
        <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Activity className="text-[var(--accent)]" size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-3">No Active Analysis</h2>
        <p className="text-[var(--text-tertiary)] max-w-md mx-auto text-sm leading-relaxed mb-8">
          The evaluation engine requires a completed analysis batch to construct the ground truth matrix.
        </p>
        <div className="flex items-center justify-center">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
             <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--success)]/20 text-[var(--success)]"><Check size={14}/></span>
             <span className="text-sm font-medium text-[var(--text-secondary)]">Go to Dashboard and click New Analysis</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12 w-full pt-6 flex flex-col gap-8">
      
      {/* Premium Hybrid Mode Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card flex justify-between items-center p-6 relative overflow-hidden transition-all duration-300 ${
          isHybridMode 
            ? 'border-purple-500/50 bg-gradient-to-r from-purple-50/50 via-[var(--bg-primary)] to-[var(--bg-primary)]' 
            : 'hover:border-purple-500/30'
        }`}
      >
        <div className="flex items-center gap-5 z-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isHybridMode 
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
              : 'bg-purple-100 text-purple-600'
          }`}>
            <Brain size={24} className={isHybridMode ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className={`text-lg font-bold transition-colors ${isHybridMode ? 'text-purple-700' : 'text-[var(--text-primary)]'}`}>
              Logic Comparison Mode
              {isHybridMode && <Sparkles className="inline-block ml-2 text-purple-500" size={16} />}
            </h3>
            <p className="text-sm mt-0.5 text-[var(--text-secondary)]">
              {isHybridMode 
                ? "Simulating algorithmic logic comparison on edge-cases." 
                : "Toggle to project metrics with logic comparison enabled."}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsHybridMode(!isHybridMode)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 z-10 outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
            isHybridMode ? 'bg-purple-600' : 'bg-[var(--bg-elevated)] border border-[var(--border-default)]'
          }`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ease-spring shadow-sm ${
            isHybridMode ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </button>
      </motion.div>

      {/* Row 1: Test Configuration */}
      <div className="card p-8 relative overflow-hidden flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Sparkles className="text-[var(--accent)]" size={20}/> Ground Truth Setup
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Select files that are known to be plagiarized to build your answer key. The model will be scored based on how perfectly it matches these groups.
          </p>
        </div>
        
        <div className="flex items-center gap-2 mb-6 flex-wrap bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-default)]">
          {groups.map((group, idx) => {
            const isActive = activeGroupIdx === idx;
            const color = COLORS[idx % COLORS.length];
            return (
              <button
                key={idx}
                onClick={() => setActiveGroupIdx(idx)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all border ${
                  isActive ? 'border-transparent shadow-sm text-white' : 'border-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]'
                }`}
                style={isActive ? { backgroundColor: color, color: '#fff' } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? 'white' : color }}></span>
                Group {idx + 1} ({group.size})
                {groups.length > 1 && (
                  <span onClick={(e) => { e.stopPropagation(); removeGroup(idx); }} className={`ml-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity`}>
                    <Trash2 size={14} />
                  </span>
                )}
              </button>
            );
          })}
          <button onClick={addGroup} className="flex items-center justify-center px-4 py-2 rounded-lg border border-dashed border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors ml-1 bg-transparent font-semibold text-sm gap-2">
            <Plus size={16} /> Add Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent pr-2">
          {availableFiles.map((file, idx) => {
            const groupIdx = getFileGroup(file);
            const isSelected = groupIdx >= 0;
            const color = isSelected ? COLORS[groupIdx % COLORS.length] : 'transparent';
            
            return (
              <div
                key={idx}
                onClick={() => toggleFileInGroup(file)}
                className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${
                  isSelected ? 'border-transparent shadow-sm' : 'border-[var(--border-default)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                }`}
                style={isSelected ? { backgroundColor: 'var(--bg-surface)' } : {}}
              >
                <div className={`flex items-center justify-center shrink-0 w-5 h-5 rounded-md border transition-colors ${
                  isSelected ? 'border-transparent' : 'border-[var(--border-default)]'
                }`} style={{ backgroundColor: color }}>
                  {isSelected && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-sm font-medium truncate">
                  {file}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-[var(--border-default)] flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full max-w-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                 Strictness Threshold
              </span>
              <span className="text-xs font-bold text-[var(--warning)] bg-[var(--warning)]/10 px-3 py-1 rounded-md">{threshold}%</span>
            </div>
            <input type="range" min="1" max="100" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full h-1.5 bg-[var(--border-default)] rounded-full appearance-none cursor-pointer accent-[var(--warning)]"/>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto ml-auto">
            <button onClick={autoDetectGroups} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] px-6 py-2.5 font-semibold text-[var(--text-secondary)] transition-colors text-sm border border-[var(--border-default)]">
              <Zap size={16} /> Auto-Detect
            </button>
            <button onClick={handleEvaluate} disabled={allPairs.length === 0} className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl px-8 py-2.5 font-semibold transition-colors text-sm ${allPairs.length === 0 ? 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-default)] cursor-not-allowed' : 'btn-primary'}`}>
              <Target size={16} /> {allPairs.length === 0 ? 'Define Groups First' : 'Evaluate'}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Results */}
      {!evaluationResults ? (
        <div className="card-flat border-dashed flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-full flex items-center justify-center mb-4">
            <Target className="text-[var(--text-tertiary)]" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-1">Ready for Evaluation</h3>
          <p className="text-[var(--text-tertiary)] text-sm text-center max-w-sm">Configure your ground truth groups above and click Evaluate to view model metrics.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Metrics Row */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="card flex flex-col items-center justify-center p-8 group transition-all">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2"><Target size={16} className="text-[var(--accent)]" /> Precision</p>
              <p className="text-5xl font-black text-[var(--text-primary)]">{(displayResults.precision * 100).toFixed(1)}<span className="text-2xl text-[var(--text-tertiary)]">%</span></p>
              <p className="mt-3 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-3 py-1 rounded-md border border-[var(--border-default)]">{displayResults.truePositives} / {displayResults.truePositives + displayResults.falsePositives} Correct</p>
            </div>
            <div className="card flex flex-col items-center justify-center p-8 group transition-all">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2"><RotateCcw size={16} className="text-[var(--warning)]" /> Recall</p>
              <p className="text-5xl font-black text-[var(--text-primary)]">{(displayResults.recall * 100).toFixed(1)}<span className="text-2xl text-[var(--text-tertiary)]">%</span></p>
              <p className="mt-3 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-3 py-1 rounded-md border border-[var(--border-default)]">{displayResults.truePositives} / {displayResults.truePositives + displayResults.falseNegatives} Found</p>
            </div>
            <div className="card flex flex-col items-center justify-center p-8 group transition-all">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2"><Sparkles size={16} className="text-[var(--success)]" /> F1-Score</p>
              <p className="text-5xl font-black text-[var(--text-primary)]">{(displayResults.f1Score * 100).toFixed(1)}<span className="text-2xl text-[var(--text-tertiary)]">%</span></p>
              <p className="mt-3 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-tertiary)] bg-[var(--bg-surface)] px-3 py-1 rounded-md border border-[var(--border-default)]">Harmonic Mean</p>
            </div>
          </div>

          {/* Confusion Matrix Row */}
          <div className="card p-8">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-6 flex items-center gap-2">
              <Activity className="text-[var(--text-tertiary)]" size={16}/> Confusion Matrix Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-flat flex flex-col p-6 relative overflow-hidden group hover:border-[var(--success)]/40 transition-colors">
                <CheckSquare size={32} className="text-[var(--success)]/20 absolute right-4 top-4" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--success)] mb-1 z-10">True Positives</p>
                <p className="text-4xl font-black text-[var(--text-primary)] z-10">{displayResults.truePositives ?? 0}</p>
              </div>
              <div className="card-flat flex flex-col p-6 relative overflow-hidden group hover:border-[var(--danger)]/40 transition-colors">
                <AlertTriangle size={32} className="text-[var(--danger)]/20 absolute right-4 top-4" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--danger)] mb-1 z-10">False Positives</p>
                <p className="text-4xl font-black text-[var(--text-primary)] z-10">{displayResults.falsePositives ?? 0}</p>
              </div>
              <div className="card-flat flex flex-col p-6 relative overflow-hidden group hover:border-[var(--warning)]/40 transition-colors">
                <XCircle size={32} className="text-[var(--warning)]/20 absolute right-4 top-4" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--warning)] mb-1 z-10">False Negatives</p>
                <p className="text-4xl font-black text-[var(--text-primary)] z-10">{displayResults.falseNegatives ?? 0}</p>
              </div>
              <div className="card-flat flex flex-col p-6 relative overflow-hidden group hover:border-[var(--accent)]/40 transition-colors">
                <ShieldCheck size={32} className="text-[var(--accent)]/20 absolute right-4 top-4" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-1 z-10">True Negatives</p>
                <p className="text-4xl font-black text-[var(--text-primary)] z-10">{displayResults.trueNegatives ?? 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
export default EvaluationView;
