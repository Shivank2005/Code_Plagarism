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
    return pairs.sort((a, b) => b.weight - a.weight).slice(0, 24);
  }, [results]);

  const [selectedLocalPair, setSelectedLocalPair] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileById = useMemo(() => {
    return new Map((files || []).map((item) => [item.id, item]));
  }, [files]);

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

      <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {candidatePairs.length === 0 && (
          <p className="text-sm text-cyan-100/65">No semantic links available yet. Generate embedding graph first.</p>
        )}
        {candidatePairs.map((pair) => (
          <button
            key={`${pair.source}-${pair.target}`}
            onClick={() => runDiff(pair)}
            className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
              selectedLocalPair?.source === pair.source && selectedLocalPair?.target === pair.target
                ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-50 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                : 'border-white/10 bg-white/5 text-cyan-100/70 hover:bg-white/10 hover:text-cyan-50'
            }`}
          >
            <p className="font-semibold">{pair.source.split('/').pop()} ↔ {pair.target.split('/').pop()}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em]">Similarity {pair.weight}%</p>
          </button>
        ))}
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
              {selectedLocalPair?.weight >= 75 ? (
                <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]">High Risk</span>
              ) : selectedLocalPair?.weight >= 40 ? (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30">Suspicious</span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30">Safe</span>
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
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-black/40 text-white/70 border-b border-white/10">
                  <th className="w-12 px-2 py-3 text-right font-semibold uppercase tracking-wider text-[10px] select-none">L#</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Original Snippet</th>
                  <th className="w-12 px-2 py-3 text-right font-semibold uppercase tracking-wider text-[10px] border-l border-white/5 select-none">R#</th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[10px]">Compared Snippet</th>
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
                      <td className={`px-4 py-1 whitespace-pre-wrap break-all ${
                        isSameText ? 'text-rose-200' : 'text-white/60'
                      } border-r border-white/5`}>
                        {row.left}
                      </td>
                      <td className="w-12 px-2 py-1 text-right text-white/30 select-none border-r border-white/5">{row.rightNo ?? ''}</td>
                      <td className={`px-4 py-1 whitespace-pre-wrap break-all ${
                        isSameText ? 'text-rose-200' : 'text-white/60'
                      }`}>
                        {row.right}
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
