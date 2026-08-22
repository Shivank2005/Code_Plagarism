import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { GitCompareArrows, Loader2, FileText, GitMerge, Brain, ShieldAlert } from 'lucide-react';

const CODEBERT_BASE = import.meta.env.VITE_CODEBERT_API || 'http://localhost:8090';
const CODEBERT_API = `${CODEBERT_BASE}/api/embeddings`;

const rowClass = {
  same: 'bg-rose-500/20',
  replace: 'bg-transparent opacity-60',
  insert: 'bg-transparent opacity-60',
  delete: 'bg-transparent opacity-60',
};

const CodeHighlight = ({ code }) => {
  if (!code) return null;

  // Add zero-width spaces after punctuation to allow browser wrapping on minified code
  const spacedCode = code.replace(/([;{}])/g, '$1\u200B');

  // Tokenizer regex
  const tokenRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|public|private|protected|class|static|void|int|boolean|for|if|else|break|def|return|False|True|not|in|while|new)\b|\b(?:Scanner|String|System|out|arr|len|range|print|println)\b|\b\d+\b)/g;
  
  const parts = spacedCode.split(tokenRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (/^["']/.test(part)) {
          return <span key={index} className="text-green-400">{part}</span>;
        }
        if (/^(import|public|private|protected|class|static|void|int|boolean|for|if|else|break|def|return|False|True|not|in|while|new)$/.test(part)) {
          return <span key={index} className="text-blue-400 font-semibold">{part}</span>;
        }
        if (/^(Scanner|String|System|out|arr|len|range|print|println)$/.test(part)) {
          return <span key={index} className="text-amber-300">{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={index} className="text-purple-400">{part}</span>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const DiffViewer = ({ files, results, semanticData, selectedPair }) => {
  const candidatePairs = useMemo(() => {
    if (!results || !Array.isArray(results.students) || !Array.isArray(results.matrix)) {
      return [];
    }

    const pairs = [];
    for (let i = 0; i < results.students.length; i += 1) {
      for (let j = i + 1; j < results.students.length; j += 1) {
        const score = results.matrix[i][j] ?? 0;
        if (score > 0) {
          // Find the detailed result object
          const detail = (results.detailedResults || []).find(r => 
            (r.submissionA === results.students[i] && r.submissionB === results.students[j]) ||
            (r.submissionA === results.students[j] && r.submissionB === results.students[i])
          );

          pairs.push({
            source: results.students[i],
            target: results.students[j],
            weight: score.toFixed(1),
            details: detail || null
          });
        }
      }
    }
    return pairs.sort((a, b) => b.weight - a.weight).slice(0, 250);
  }, [results]);

  const [selectedLocalPair, setSelectedLocalPair] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [deepScanResult, setDeepScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileById = useMemo(() => {
    return new Map((files || []).map((item) => [item.id, item]));
  }, [files]);

  const runDeepScan = async (pairOverride = null) => {
    const pairToScan = pairOverride || selectedLocalPair;
    if (!pairToScan) return;
    setScanning(true);
    setDeepScanResult(null);
    try {
      let leftFile = fileById.get(pairToScan.source);
      let rightFile = fileById.get(pairToScan.target);
      
      if (!leftFile || !rightFile) {
        const leftName = pairToScan.source.split('/').pop();
        const rightName = pairToScan.target.split('/').pop();
        leftFile = Array.from(fileById.values()).find(f => f.id.endsWith(leftName));
        rightFile = Array.from(fileById.values()).find(f => f.id.endsWith(rightName));
      }

      if (!leftFile || !rightFile) {
          throw new Error("Files not found in memory");
      }

      const res = await axios.post(`${CODEBERT_API}/deepscan`, {
        code1: leftFile.code,
        code2: rightFile.code,
        filename1: pairToScan.source,
        filename2: pairToScan.target
      });
      setDeepScanResult(res.data);
    } catch (err) {
      setDeepScanResult({ error: err.message || "Failed to connect to AI Deep Scan service.", plagiarized: false, explanation: "Connection error." });
    } finally {
      setScanning(false);
    }
  };

  // Auto-run diff when selectedPair changes from parent
  useEffect(() => {
    if (selectedPair && selectedPair.student1 && selectedPair.student2) {
      runDiff({
        source: selectedPair.student1,
        target: selectedPair.student2,
        weight: selectedPair.score
      });
    }
  }, [selectedPair]);

  const runDiff = async (pair) => {
    setSelectedLocalPair(pair);
    setLoading(true);
    setError('');
    setDiffData(null);
    setDeepScanResult(null);

    // Automatically trigger Deep Scan
    runDeepScan(pair);

    let leftFile = fileById.get(pair.source);
    let rightFile = fileById.get(pair.target);

    if (!leftFile || !rightFile) {
      const allFiles = Array.from(fileById.values());
      if (!leftFile) {
        leftFile = allFiles.find(f => f.id.includes(pair.source) || pair.source.includes(f.id) || (f.name && (f.name.includes(pair.source) || pair.source.includes(f.name))));
      }
      if (!rightFile) {
        rightFile = allFiles.find(f => f.id.includes(pair.target) || pair.target.includes(f.id) || (f.name && (f.name.includes(pair.target) || pair.target.includes(f.name))));
      }
    }

    if (!leftFile || !rightFile) {
      setLoading(false);
      const missing = [];
      if (!leftFile) missing.push(pair.source);
      if (!rightFile) missing.push(pair.target);
      setError(`Selected pair code files are not available: ${missing.join(', ')}`);
      return;
    }

    try {
      const res = await axios.post(`${CODEBERT_API}/diff`, {
        leftId: leftFile.id,
        rightId: rightFile.id,
        leftCode: leftFile.code,
        rightCode: rightFile.code,
      });
      setDiffData(res.data);
    } catch (err) {
      setError('Failed to generate diff. Make sure CodeBERT service is running on port 8090.');
    } finally {
      setLoading(false);
    }
  };

  if (!files || files.length < 2) {
    return (
      <div className="glass-card rounded-[2rem] border border-dashed border-cyan-100/30 p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-white">No Files Available For Diff</h3>
        <p className="mt-2 text-cyan-100/65">Run an analysis and semantic embedding step before opening pairwise diffs.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display flex items-center gap-3 text-2xl font-bold text-white">
            <GitCompareArrows className="text-orange-200" /> Pairwise Diff Explorer
          </h3>
          <p className="mt-1 text-sm text-cyan-100/70">Inspect high-similarity pairs to verify copied or transformed lines.</p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-[#30363d] shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#30363d] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-[#0d1117] scrollbar-thumb-[#484f58] hover:scrollbar-thumb-[#6e7681]">
          {candidatePairs.length === 0 && (
            <div className="col-span-full p-8 text-center text-sm text-[#8b949e] bg-[#0d1117]">
              No semantic links available yet. Generate embedding graph first.
            </div>
          )}
          {candidatePairs.map((pair) => (
            <button
              key={`${pair.source}-${pair.target}`}
              onClick={() => runDiff(pair)}
              className={`group flex flex-col p-5 text-left transition-all duration-200 ${
                selectedLocalPair?.source === pair.source && selectedLocalPair?.target === pair.target
                  ? 'bg-gradient-to-r from-[#58a6ff]/10 to-[#0d1117] shadow-[inset_3px_0_0_#58a6ff]'
                  : 'bg-[#0d1117] hover:bg-[#161b22]'
              }`}
            >
              <div className="mb-4 flex w-full items-center justify-between overflow-hidden">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black tracking-widest uppercase ${
                    pair.weight > 75 ? 'bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/20 shadow-[0_0_10px_rgba(248,81,73,0.1)]' 
                    : pair.weight >= 40 ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/20'
                    : 'bg-[#238636]/10 text-[#238636] border border-[#238636]/20'
                }`}>
                  {pair.weight}% MATCH
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#58a6ff] opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                  Inspect →
                </span>
              </div>
              <div className="flex w-full items-center justify-between gap-3">
                <p className="flex-1 truncate text-xs font-semibold text-[#e6edf3] transition-colors group-hover:text-white" title={pair.source.split('/').pop()}>
                  {pair.source.split('/').pop()}
                </p>
                <span className="text-[#8b949e] opacity-30 px-1 font-light">↔</span>
                <p className="flex-1 truncate text-right text-xs font-semibold text-[#e6edf3] transition-colors group-hover:text-white" title={pair.target.split('/').pop()}>
                  {pair.target.split('/').pop()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-cyan-950/70 px-4 py-3 text-sm text-cyan-100">
          <Loader2 className="animate-spin" size={16} /> Building diff view...
        </div>
      )}

      {error && <p className="mb-4 rounded-xl border border-rose-100/35 bg-rose-500/20 px-4 py-3 text-sm text-rose-100">{error}</p>}

      {diffData && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-2xl backdrop-blur-md">
            {/* Header Strip */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-4">
              <h4 className="font-display text-lg font-bold text-white flex items-center">
                {selectedLocalPair?.source.split('/').pop()} <span className="mx-3 text-white/20">↔</span> {selectedLocalPair?.target.split('/').pop()}
              </h4>
              <div className="flex items-center gap-3">
                {selectedLocalPair?.details?.featureImportance && Object.keys(selectedLocalPair.details.featureImportance).length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 border-r border-white/10 pr-3">
                    Top factor: {Object.entries(selectedLocalPair.details.featureImportance).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0]}
                  </span>
                )}
                {(selectedLocalPair?.details?.isAnomaly || selectedLocalPair?.details?.anomaly) && (
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300 border border-purple-500/40">⚠️ ISOLATION ANOMALY</span>
                )}
                {selectedLocalPair?.weight >= 75 ? (
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]">High Risk</span>
                ) : selectedLocalPair?.weight >= 40 ? (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30">Suspicious</span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30">Safe</span>
                )}
              </div>
            </div>

            {/* AI Deep Scan Module (Always Visible) */}
            <div className={`border-b border-white/10 px-6 py-4 transition-colors ${deepScanResult ? (deepScanResult.plagiarized ? 'bg-rose-500/10' : 'bg-emerald-500/10') : 'bg-purple-900/10'}`}>
              {deepScanResult ? (
                <div className="flex items-start gap-4">
                  <div className={`mt-1 rounded-full p-2 ${deepScanResult.plagiarized ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {deepScanResult.plagiarized ? <ShieldAlert size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className={`font-display text-lg font-bold ${deepScanResult.plagiarized ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {deepScanResult.plagiarized ? 'Comparison: Plagiarism Detected' : 'Comparison: Safe'}
                      </h5>
                      <button onClick={() => runDeepScan()} disabled={scanning} className="text-[10px] uppercase font-bold text-white/40 hover:text-white/80 transition-colors flex items-center gap-1">
                        {scanning ? <Loader2 className="animate-spin" size={12} /> : <Brain size={12} />}
                        {scanning ? 'Comparing...' : 'Compare Again'}
                      </button>
                    </div>
                    {deepScanResult.error ? (
                      <p className="mt-1 text-sm text-rose-200">{deepScanResult.error}</p>
                    ) : (
                      <p className="mt-1 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{deepScanResult.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-purple-500/20 p-2 text-purple-400">
                      <Brain size={20} />
                    </div>
                    <div>
                      <h5 className="font-display text-sm font-bold text-purple-300">Logic Comparison Available</h5>
                      <p className="mt-0.5 text-xs text-white/60">Analyze algorithmic logic and detect cross-language translations instantly.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => runDeepScan()} 
                    disabled={scanning}
                    className="flex items-center gap-2 rounded-lg bg-purple-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-purple-300 border border-purple-500/30 hover:bg-purple-500/40 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scanning ? <Loader2 className="animate-spin" size={14} /> : <Brain size={14} />}
                    {scanning ? 'Comparing...' : 'Compare Logic'}
                  </button>
                </div>
              )}
            </div>

            {/* 4 Metric Cards */}
            {selectedLocalPair?.details && (
              <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
                {/* Token */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    <FileText size={14} /> Token
                  </div>
                  <span className="font-display text-3xl font-bold text-white">
                    {selectedLocalPair.details.tokenScore?.toFixed(1) || 0}%
                  </span>
                </div>
                {/* Structural */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-400">
                    <GitMerge size={14} /> Structural
                  </div>
                  <span className="font-display text-3xl font-bold text-white">
                    {selectedLocalPair.details.structuralScore?.toFixed(1) || 0}%
                  </span>
                </div>
                {/* Semantic */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-white/5">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                    <Brain size={14} /> Semantic
                  </div>
                  <span className="font-display text-3xl font-bold text-white">
                    {selectedLocalPair.details.semanticScore?.toFixed(1) || 0}%
                  </span>
                </div>
                {/* Confidence */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-white/5">
                  <div className={`mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                      (selectedLocalPair.details.confidenceScore || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    <ShieldAlert size={14} /> Confidence
                  </div>
                  <span className="font-display text-3xl font-bold text-white">
                    {selectedLocalPair.details.confidenceScore?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            )}

            {/* Footer Summary Strip */}
            <div className="flex flex-wrap items-center justify-between border-t border-white/10 bg-black/40 px-6 py-3 text-xs text-white/70">
              <div>
                <span className="font-semibold text-white">Boilerplate ignored:</span> {selectedLocalPair?.details?.boilerplateRemovedCount || 0}
              </div>
              <div className="flex gap-4">
                <span><span className="font-semibold text-white">Overlap:</span> {diffData.summary.overlapPercent}%</span>
                <span><span className="font-semibold text-white">Changed:</span> {diffData.summary.changedLines}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 shadow-inner backdrop-blur-sm">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead>
                <tr className="bg-black/40 text-white/70 border-b border-white/10">
                  <th className="w-12 px-2 py-3 text-right font-semibold uppercase tracking-wider text-[10px] select-none">L#</th>
                  <th className="w-[calc(50%-48px)] px-4 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Original Snippet</th>
                  <th className="w-12 px-2 py-3 text-right font-semibold uppercase tracking-wider text-[10px] border-l border-white/5 select-none">R#</th>
                  <th className="w-[calc(50%-48px)] px-4 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Compared Snippet</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] leading-relaxed">
                {diffData.rows.map((row, idx) => {
                  const isBlankSame = row.type === 'same' && !(row.left || '').trim() && !(row.right || '').trim();
                  const rowBg = isBlankSame ? 'bg-transparent' : (rowClass[row.type] || rowClass.same);
                  const isSameText = row.type === 'same' && !isBlankSame;

                  return (
                    <tr key={`row-${idx}`} className={`${rowBg} hover:bg-white/5 transition-colors`}>
                      <td className="w-12 px-2 py-1 text-right text-white/30 select-none border-r border-white/5">{row.leftNo ?? ''}</td>
                      <td className={`px-4 py-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-6 ${
                        isSameText ? 'text-rose-200' : 'text-white/80'
                      } border-r border-white/5`}>
                        <CodeHighlight code={row.left} />
                      </td>
                      <td className="w-12 px-2 py-1.5 text-right text-white/30 select-none border-r border-white/5">{row.rightNo ?? ''}</td>
                      <td className={`px-4 py-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-6 ${
                        isSameText ? 'text-rose-200' : 'text-white/80'
                      }`}>
                        <CodeHighlight code={row.right} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
