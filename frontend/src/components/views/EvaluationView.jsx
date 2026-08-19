import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Hash, SlidersHorizontal, Target, Sparkles, Info, CheckCircle2, Users, Zap, RotateCcw, Plus, Trash2, ShieldCheck, AlertTriangle, XCircle, CheckSquare } from 'lucide-react';

const COLORS = ['#d29922', '#58a6ff', '#f778ba', '#a5d6ff', '#7ee787'];

const EvaluationView = ({ activeBatch, evaluateModel, evaluationResults, results }) => {
  const [batchId, setBatchId] = useState(activeBatch || '');
  const [threshold, setThreshold] = useState(60);
  const [lastSentPairs, setLastSentPairs] = useState([]);
  const [groups, setGroups] = useState([new Set()]);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  const availableFiles = useMemo(() => {
    if (results && Array.isArray(results.students)) {
      return results.students;
    }
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

  const clearAll = () => {
    setGroups([new Set()]);
    setActiveGroupIdx(0);
  };

  const autoDetectGroups = () => {
    const group1 = new Set();
    const group2 = new Set();

    availableFiles.forEach(file => {
      const lower = file.toLowerCase();
      
      const isLikelyInnocent =
        lower.includes('different') ||
        lower.includes('unrelated') ||
        lower.includes('boilerplate') ||
        lower.includes('essay') ||
        lower.includes('readme') ||
        lower.includes('mergesort');

      if (isLikelyInnocent) return;

      if (lower.includes('quicksort') || lower.includes('quick_sort')) {
        group2.add(file);
        return;
      }

      const isBaseGroup =
        lower.includes('copy') ||
        lower.includes('translated') ||
        lower.includes('obfuscat') ||
        lower.includes('renamed') ||
        lower.includes('restructured') ||
        lower.includes('plagiari') ||
        lower.includes('original') ||
        lower.includes('base');

      if (isBaseGroup) {
        group1.add(file);
      }
    });

    const newGroups = [];
    if (group1.size >= 2) newGroups.push(group1);
    if (group2.size >= 2) newGroups.push(group2);

    if (newGroups.length === 0) {
      const all = new Set();
      availableFiles.forEach(f => {
        if (!f.endsWith('.txt') && !f.endsWith('.md')) all.add(f);
      });
      newGroups.push(all);
    }

    setGroups(newGroups);
    setActiveGroupIdx(0);
  };

  const handleEvaluate = () => {
    const pairs = allPairs.map(([a, b]) => `${a},${b}`);
    setLastSentPairs(pairs);
    evaluateModel(batchId, threshold, pairs);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-10 w-full px-4 pt-6">
      {/* Header (Borderless) */}
      <div className="pb-6 border-b border-[#30363d]/40 relative">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-[#58a6ff]/10 blur-[80px] pointer-events-none"></div>
        <h2 className="font-display text-3xl font-black text-[#e6edf3] mb-3 flex items-center gap-3 tracking-tight">
          <Sparkles className="text-[#58a6ff]" size={28}/> 
          Model Evaluation Engine
        </h2>
        <p className="text-[#8b949e] max-w-3xl leading-relaxed text-sm">
          Define <strong className="text-[#d29922]">plagiarism groups</strong> — clusters of files you know are copies of each other. The engine auto-generates all pairs within each group and evaluates the model's detection accuracy.
        </p>
      </div>

      {/* Multi-Group Select (Borderless) */}
      {availableFiles.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#d29922]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#c9d1d9]">
                Plagiarism Groups ({availableFiles.length} files)
              </h4>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {totalSelected > 0 && (
                <button onClick={clearAll} className="flex items-center gap-1.5 rounded-full bg-[#f85149]/10 hover:bg-[#f85149]/20 text-[#f85149] text-xs font-bold px-4 py-2 transition-all">
                  <RotateCcw size={13} /> Reset All
                </button>
              )}
              <span className="rounded-full bg-[#d29922]/10 px-4 py-2 text-xs font-bold text-[#d29922]">
                {totalSelected} files → {allPairs.length} pairs
              </span>
            </div>
          </div>

          {/* Group Tabs (Pills) */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {groups.map((group, idx) => {
              const isActive = activeGroupIdx === idx;
              const color = COLORS[idx % COLORS.length];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveGroupIdx(idx)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? 'text-white shadow-md transform scale-105'
                      : 'text-[#8b949e] hover:text-[#c9d1d9] bg-[#161b22]'
                  }`}
                  style={isActive ? {
                    backgroundColor: color,
                    color: '#000'
                  } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? '#000' : color }}></span>
                  Group {idx + 1} ({group.size})
                  {groups.length > 1 && (
                    <span 
                      onClick={(e) => { e.stopPropagation(); removeGroup(idx); }}
                      className={`ml-1 cursor-pointer transition-colors ${isActive ? 'hover:text-white/80' : 'hover:text-[#f85149]'}`}
                    >
                      ×
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={addGroup}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-[#30363d] px-4 py-2 text-sm text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] hover:bg-[#58a6ff]/5 transition-all"
            >
              <Plus size={14} /> Add Group
            </button>
          </div>

          {/* File Selection Area */}
          <div className="bg-[#0d1117]/60 rounded-3xl p-6 mt-2 border border-[#30363d]/30 relative overflow-hidden">
            {/* Subtle glow reflecting the active group color */}
            <div 
              className="absolute top-0 left-0 w-full h-1 opacity-20 transition-colors duration-500" 
              style={{ backgroundColor: COLORS[activeGroupIdx % COLORS.length] }}
            ></div>
            
            <p className="text-xs text-[#8b949e] mb-5 font-medium flex items-center gap-2">
              <Info size={14} className="text-[#8b949e]" />
              Click files to assign them to <strong style={{ color: COLORS[activeGroupIdx % COLORS.length] }}>Group {activeGroupIdx + 1}</strong>.
            </p>

            {/* File Chips (Borderless Pills) */}
            <div className="flex flex-wrap gap-2.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#30363d] pr-2 pb-2">
              {availableFiles.map((file, idx) => {
                const fileGroupIdx = getFileGroup(file);
                const isSelected = fileGroupIdx >= 0;
                const color = isSelected ? COLORS[fileGroupIdx % COLORS.length] : null;
                return (
                  <button
                    key={idx}
                    onClick={() => toggleFileInGroup(file)}
                    className={`rounded-full px-4 py-2.5 text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'shadow-sm font-bold transform scale-[1.02]'
                        : 'bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] border border-transparent hover:border-[#30363d]'
                    }`}
                    style={isSelected ? {
                      backgroundColor: color + '15',
                      color: color,
                      boxShadow: `0 0 0 1px ${color}40 inset`
                    } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? color : '#484f58' }}></span>
                      {file}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pairs summary per group (Soft box) */}
          {groups.some(g => g.size >= 2) && (
            <div className="mt-8 rounded-2xl bg-[#161b22]/50 p-5 border border-[#30363d]/30">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#238636]" /> Ground Truth Summary — {allPairs.length} Pairs
              </h5>
              <div className="space-y-2">
                {groups.map((group, idx) => {
                  const n = group.size;
                  const p = (n * (n - 1)) / 2;
                  if (n < 2) return null;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs bg-[#0d1117]/50 rounded-lg py-2 px-3 w-fit">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-[#c9d1d9] font-medium">Group {idx + 1}</span>
                      <span className="text-[#8b949e] ml-2">{n} files</span>
                      <span className="text-[#8b949e]">→</span>
                      <span className="text-[#e6edf3] font-bold">{p} pairs</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings & Execution (Borderless) */}
      <div className="mt-8 pt-8 border-t border-[#30363d]/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Batch ID */}
          <div className="group">
            <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8b949e]">
              <Hash size={16} className="text-[#58a6ff]" /> Target Batch ID
            </label>
            <input 
              type="text" 
              className="w-full rounded-2xl border-none bg-[#161b22] px-6 py-4 text-sm text-[#e6edf3] placeholder-[#484f58] transition-all focus:bg-[#21262d] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]/30 shadow-inner" 
              value={batchId} 
              onChange={e => setBatchId(e.target.value)} 
              placeholder="e.g. batch_170123456" 
            />
          </div>

          {/* Threshold */}
          <div className="group">
            <label className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8b949e]">
              <span className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-[#d29922]" /> Strictness Threshold</span>
              <span className="rounded-full bg-[#d29922]/10 px-3 py-1 text-[#d29922] font-bold">{threshold}%</span>
            </label>
            <div className="flex h-[52px] items-center rounded-2xl border-none bg-[#161b22] px-6 shadow-inner transition-colors">
              <input 
                type="range" 
                className="w-full accent-[#d29922] cursor-pointer" 
                min="0" 
                max="100" 
                value={threshold} 
                onChange={e => setThreshold(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        {/* Status */}
        {allPairs.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl bg-[#d29922]/5 px-6 py-5 mb-8">
            <Info size={18} className="text-[#d29922] shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-[#c9d1d9]">
              <strong>{groups.filter(g => g.size >= 2).length} group{groups.filter(g => g.size >= 2).length > 1 ? 's' : ''}</strong> defined with <strong className="text-[#d29922]">{allPairs.length} ground truth pairs</strong>. Files within the same group are expected to be flagged as plagiarized.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={autoDetectGroups}
            className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-[#238636]/10 hover:bg-[#238636]/20 px-6 py-5 font-bold text-[#2ea043] transition-all duration-300 text-sm tracking-wide uppercase"
          >
            <Zap size={18} />
            Auto-Detect Ground Truth
          </button>

          <button 
            className={`flex-1 flex items-center justify-center gap-3 rounded-2xl px-6 py-5 font-bold transition-all duration-300 text-sm tracking-wide uppercase ${
              !batchId || allPairs.length === 0
                ? 'bg-[#161b22] text-[#8b949e] cursor-not-allowed' 
                : 'bg-[#238636] hover:bg-[#2ea043] text-white shadow-[0_4px_20px_rgba(35,134,54,0.3)] hover:shadow-[0_4px_25px_rgba(35,134,54,0.5)] transform hover:-translate-y-0.5'
            }`}
            onClick={handleEvaluate} 
            disabled={!batchId || allPairs.length === 0}
          >
            <Target size={20} />
            {allPairs.length === 0 ? 'Select Files' : `Execute Evaluation`}
          </button>
        </div>
      </div>

      {/* Results */}
      {evaluationResults && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Metrics Row */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-8 shadow-2xl overflow-hidden group hover:border-[#58a6ff]/50 transition-all hover:shadow-[0_0_30px_rgba(88,166,255,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#58a6ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b949e] flex items-center gap-2">
                <Target size={14} className="text-[#58a6ff]" /> Precision
              </p>
              <p className="text-6xl font-black text-[#58a6ff] drop-shadow-[0_0_15px_rgba(88,166,255,0.4)] tracking-tight">
                {(evaluationResults.precision * 100).toFixed(1)}<span className="text-3xl text-[#58a6ff]/50">%</span>
              </p>
              <div className="mt-4 flex items-center justify-between w-full px-2 text-[10px] uppercase tracking-wider font-semibold text-[#8b949e]">
                <span>Correct Flags</span>
                <span className="text-[#c9d1d9]">{evaluationResults.truePositives} / {evaluationResults.truePositives + evaluationResults.falsePositives}</span>
              </div>
            </div>
            
            <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-8 shadow-2xl overflow-hidden group hover:border-[#d29922]/50 transition-all hover:shadow-[0_0_30px_rgba(210,153,34,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d29922]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b949e] flex items-center gap-2">
                <RotateCcw size={14} className="text-[#d29922]" /> Recall
              </p>
              <p className="text-6xl font-black text-[#d29922] drop-shadow-[0_0_15px_rgba(210,153,34,0.4)] tracking-tight">
                {(evaluationResults.recall * 100).toFixed(1)}<span className="text-3xl text-[#d29922]/50">%</span>
              </p>
              <div className="mt-4 flex items-center justify-between w-full px-2 text-[10px] uppercase tracking-wider font-semibold text-[#8b949e]">
                <span>Found Cheats</span>
                <span className="text-[#c9d1d9]">{evaluationResults.truePositives} / {evaluationResults.truePositives + evaluationResults.falseNegatives}</span>
              </div>
            </div>
            
            <div className="relative flex flex-col items-center justify-center rounded-[2rem] border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-8 shadow-2xl overflow-hidden group hover:border-[#238636]/50 transition-all hover:shadow-[0_0_30px_rgba(35,134,54,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#238636]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8b949e] flex items-center gap-2">
                <Sparkles size={14} className="text-[#238636]" /> F1-Score
              </p>
              <p className="text-6xl font-black text-[#238636] drop-shadow-[0_0_15px_rgba(35,134,54,0.4)] tracking-tight">
                {(evaluationResults.f1Score * 100).toFixed(1)}<span className="text-3xl text-[#238636]/50">%</span>
              </p>
              <div className="mt-4 flex items-center justify-center w-full px-2 text-[10px] uppercase tracking-widest font-bold text-[#8b949e] bg-[#30363d]/30 rounded-lg py-1.5">
                Harmonic Mean (Overall)
              </div>
            </div>
          </div>

          {/* Expanded Confusion Matrix */}
          <div className="rounded-[2rem] border border-[#30363d] bg-[#0d1117] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-[#30363d]/50 pb-4">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9d1d9] flex items-center gap-3">
                Confusion Matrix Breakdown
              </h4>
              <span className="text-[10px] font-mono text-[#8b949e] uppercase tracking-widest bg-[#161b22] px-3 py-1 rounded-full border border-[#30363d]">
                Threshold: {threshold}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* True Positives */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#238636]/20 to-[#238636]/5 border border-[#238636]/30 p-6 overflow-hidden">
                <CheckSquare size={48} className="absolute -right-2 -top-2 text-[#238636]/10" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#238636] mb-2 z-10">True Positives</p>
                <p className="text-4xl font-black text-[#238636] z-10 drop-shadow-md">{evaluationResults.truePositives ?? 0}</p>
                <p className="text-[10px] text-[#238636]/80 mt-2 z-10 font-medium">Correctly flagged</p>
              </div>

              {/* False Positives */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#f85149]/20 to-[#f85149]/5 border border-[#f85149]/30 p-6 overflow-hidden">
                <AlertTriangle size={48} className="absolute -right-2 -top-2 text-[#f85149]/10" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f85149] mb-2 z-10">False Positives</p>
                <p className="text-4xl font-black text-[#f85149] z-10 drop-shadow-md">{evaluationResults.falsePositives ?? 0}</p>
                <p className="text-[10px] text-[#f85149]/80 mt-2 z-10 font-medium">Wrongly flagged (False Alarms)</p>
              </div>

              {/* False Negatives */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#d29922]/20 to-[#d29922]/5 border border-[#d29922]/30 p-6 overflow-hidden">
                <XCircle size={48} className="absolute -right-2 -top-2 text-[#d29922]/10" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#d29922] mb-2 z-10">False Negatives</p>
                <p className="text-4xl font-black text-[#d29922] z-10 drop-shadow-md">{evaluationResults.falseNegatives ?? 0}</p>
                <p className="text-[10px] text-[#d29922]/80 mt-2 z-10 font-medium">Missed cheats</p>
              </div>

              {/* True Negatives */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff]/20 to-[#58a6ff]/5 border border-[#58a6ff]/30 p-6 overflow-hidden">
                <ShieldCheck size={48} className="absolute -right-2 -top-2 text-[#58a6ff]/10" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#58a6ff] mb-2 z-10">True Negatives</p>
                <p className="text-4xl font-black text-[#58a6ff] z-10 drop-shadow-md">{evaluationResults.trueNegatives ?? 0}</p>
                <p className="text-[10px] text-[#58a6ff]/80 mt-2 z-10 font-medium">Correctly cleared</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EvaluationView;
