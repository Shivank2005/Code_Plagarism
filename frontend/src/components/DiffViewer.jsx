import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { GitCompareArrows, Loader2 } from 'lucide-react';

const CODEBERT_API = 'http://localhost:8090/api/embeddings';

const rowClass = {
  same: 'bg-[#031926]',
  replace: 'bg-amber-500/10',
  insert: 'bg-emerald-500/12',
  delete: 'bg-rose-500/12',
};

const DiffViewer = ({ files, semanticData, selectedPair }) => {
  const candidatePairs = useMemo(() => {
    if (!semanticData || !Array.isArray(semanticData.links)) {
      return [];
    }
    return semanticData.links.slice(0, 24);
  }, [semanticData]);

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

    const leftFile = fileById.get(pair.source);
    const rightFile = fileById.get(pair.target);

    if (!leftFile || !rightFile) {
      setLoading(false);
      setError('Selected pair code files are not available.');
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
                ? 'border-cyan-200/45 bg-cyan-500/20 text-cyan-50'
                : 'border-cyan-100/20 bg-cyan-950/60 text-cyan-100/80 hover:bg-cyan-900/70'
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
        <div>
          <div className="mb-4 rounded-xl border border-cyan-100/15 bg-cyan-950/60 px-4 py-3 text-sm text-cyan-100/85">
            <span className="font-semibold">Overlap:</span> {diffData.summary.overlapPercent}%
            <span className="mx-3 text-cyan-100/35">|</span>
            <span className="font-semibold">Changed lines:</span> {diffData.summary.changedLines}
          </div>

          <div className="overflow-auto rounded-2xl border border-cyan-100/15">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#031420] text-cyan-100/75">
                  <th className="w-16 px-2 py-2 text-right">L#</th>
                  <th className="px-3 py-2 text-left">Left</th>
                  <th className="w-16 px-2 py-2 text-right">R#</th>
                  <th className="px-3 py-2 text-left">Right</th>
                </tr>
              </thead>
              <tbody>
                {diffData.rows.map((row, idx) => (
                  <tr key={`row-${idx}`} className={`${rowClass[row.type] || rowClass.same} border-t border-cyan-100/8`}>
                    <td className="px-2 py-1.5 text-right text-cyan-100/60">{row.leftNo ?? ''}</td>
                    <td className="px-3 py-1.5 font-mono text-cyan-100/90">{row.left}</td>
                    <td className="px-2 py-1.5 text-right text-cyan-100/60">{row.rightNo ?? ''}</td>
                    <td className="px-3 py-1.5 font-mono text-cyan-100/90">{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
