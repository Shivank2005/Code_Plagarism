import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { GitCompareArrows, Loader2, FileText, GitMerge, Brain, ShieldAlert } from 'lucide-react';

const CODEBERT_BASE = import.meta.env.VITE_CODEBERT_API || 'http://localhost:8090';
const CODEBERT_API = `${CODEBERT_BASE}/api/embeddings`;

const rowClass = {
  same: 'bg-[var(--danger)]/10',
  replace: 'bg-transparent opacity-60',
  insert: 'bg-transparent opacity-60',
  delete: 'bg-transparent opacity-60',
};

const CodeHighlight = ({ code }) => {
  if (!code) return null;

  const spacedCode = code.replace(/([;{}])/g, '$1\u200B');

  const tokenRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*|\/\*[\s\S]*?\*\/|\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|def|False|True|None|and|as|async|await|del|elif|except|from|global|is|lambda|nonlocal|not|or|pass|raise|with|yield|function|let|var|export|struct|impl|mut|fn|match|loop|pub|use|go|chan|defer|fallthrough|type)\b|\b(?:String|Integer|Double|System|Math|Scanner|List|Map|Set|Dict|Array|Console|Object|Promise|Vector|HashMap|print|println|out|len|range)\b|\b\d+(?:\.\d+)?\b|[+\-*/=<>!&|%^~]+)/g;
  
  const parts = spacedCode.split(tokenRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (/^["']/.test(part)) return <span key={index} className="text-emerald-600">{part}</span>;
        if (/^\/\/|^\/\*/.test(part)) return <span key={index} className="text-[var(--text-tertiary)] italic">{part}</span>;
        if (/^[+\-*/=<>!&|%^~]+$/.test(part)) return <span key={index} className="text-[var(--text-tertiary)]">{part}</span>;
        if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|def|False|True|None|and|as|async|await|del|elif|except|from|global|is|lambda|nonlocal|not|or|pass|raise|with|yield|function|let|var|export|struct|impl|mut|fn|match|loop|pub|use|go|chan|defer|fallthrough|type)$/.test(part)) {
          return <span key={index} className="text-pink-600 font-semibold">{part}</span>;
        }
        if (/^(String|Integer|Double|System|Math|Scanner|List|Map|Set|Dict|Array|Console|Object|Promise|Vector|HashMap|print|println|out|len|range)$/.test(part)) {
          return <span key={index} className="text-purple-600">{part}</span>;
        }
        if (/^\d+(?:\.\d+)?$/.test(part)) return <span key={index} className="text-blue-600">{part}</span>;
        return <span key={index} className="text-[var(--text-primary)]">{part}</span>;
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
      if (res.data.error) toast.error(res.data.error);
      else toast.success("AI Logic Scan complete!");
    } catch (err) {
      toast.error(err.message || "Failed to connect to AI Deep Scan service.");
      setDeepScanResult({ error: err.message || "Failed to connect to AI Deep Scan service.", plagiarized: false, explanation: "Connection error." });
    } finally {
      setScanning(false);
    }
  };

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

    runDeepScan(pair);

    let leftFile = fileById.get(pair.source);
    let rightFile = fileById.get(pair.target);

    if (!leftFile || !rightFile) {
      const allFiles = Array.from(fileById.values());
      if (!leftFile) leftFile = allFiles.find(f => f.id.includes(pair.source) || pair.source.includes(f.id));
      if (!rightFile) rightFile = allFiles.find(f => f.id.includes(pair.target) || pair.target.includes(f.id));
    }

    if (!leftFile || !rightFile) {
      setLoading(false);
      setError(`Selected pair code files are not available.`);
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
      setError('Failed to generate diff. Service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (!files || files.length < 2) {
    return (
      <div className="card p-10 text-center flex flex-col items-center gap-2">
        <GitCompareArrows className="text-[var(--text-tertiary)]" size={32} />
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">No Files Available</h3>
        <p className="text-sm text-[var(--text-secondary)]">Run an analysis to explore pairwise diffs.</p>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-2">
        <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GitCompareArrows className="text-[var(--accent)]" size={20} /> Pairwise Diff Explorer
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">Inspect high-similarity pairs to verify copied or transformed lines.</p>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border-default)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[var(--border-default)] max-h-[300px] overflow-y-auto">
          {candidatePairs.length === 0 && (
            <div className="col-span-full p-8 text-center text-sm text-[var(--text-tertiary)] bg-[var(--bg-primary)]">
              No matching pairs available.
            </div>
          )}
          {candidatePairs.map((pair) => (
            <button
              key={`${pair.source}-${pair.target}`}
              onClick={() => runDiff(pair)}
              className={`group flex flex-col p-4 text-left transition-all ${
                selectedLocalPair?.source === pair.source && selectedLocalPair?.target === pair.target
                  ? 'bg-[var(--accent-muted)] shadow-[inset_3px_0_0_var(--accent)]'
                  : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <div className="mb-3 flex w-full items-center justify-between">
                <span className={`badge ${
                    pair.weight > 75 ? 'badge-danger' 
                    : pair.weight >= 40 ? 'badge-warning'
                    : 'badge-success'
                }`}>
                  {pair.weight}% MATCH
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  Inspect &rarr;
                </span>
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <p className="flex-1 truncate text-xs font-medium text-[var(--text-primary)]" title={pair.source.split('/').pop()}>
                  {pair.source.split('/').pop()}
                </p>
                <span className="text-[var(--text-tertiary)] text-[10px] font-light">&harr;</span>
                <p className="flex-1 truncate text-right text-xs font-medium text-[var(--text-primary)]" title={pair.target.split('/').pop()}>
                  {pair.target.split('/').pop()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)] font-medium">
          <Loader2 className="animate-spin" size={16} /> Building diff view...
        </div>
      )}

      {error && <p className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">{error}</p>}

      {diffData && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm">
            {/* Header Strip */}
            <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center">
                {selectedLocalPair?.source.split('/').pop()} <span className="mx-2 text-[var(--text-tertiary)] text-xs">&harr;</span> {selectedLocalPair?.target.split('/').pop()}
              </h4>
              <div className="flex items-center gap-2">
                {selectedLocalPair?.details?.featureImportance && Object.keys(selectedLocalPair.details.featureImportance).length > 0 && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] border-r border-[var(--border-default)] pr-2">
                    Key Factor: {Object.entries(selectedLocalPair.details.featureImportance).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0]}
                  </span>
                )}
                {(selectedLocalPair?.details?.isAnomaly || selectedLocalPair?.details?.anomaly) && (
                  <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>&#9888; ANOMALY</span>
                )}
                <span className={`badge ${selectedLocalPair?.weight >= 75 ? 'badge-danger' : selectedLocalPair?.weight >= 40 ? 'badge-warning' : 'badge-success'}`}>
                  {selectedLocalPair?.weight >= 75 ? 'High Risk' : selectedLocalPair?.weight >= 40 ? 'Suspicious' : 'Safe'}
                </span>
              </div>
            </div>

            {/* AI Deep Scan Module */}
            <div className={`border-b border-[var(--border-default)] px-5 py-4 ${deepScanResult ? (deepScanResult.plagiarized ? 'bg-[var(--danger)]/5' : 'bg-[var(--success)]/5') : 'bg-[var(--bg-elevated)]'}`}>
              {deepScanResult ? (
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 rounded-lg p-2 ${deepScanResult.plagiarized ? 'bg-[var(--danger)]/10 text-[var(--danger)]' : 'bg-[var(--success)]/10 text-[var(--success)]'}`}>
                    {deepScanResult.plagiarized ? <ShieldAlert size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className={`text-sm font-bold ${deepScanResult.plagiarized ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                        {deepScanResult.plagiarized ? 'AI Assessment: Plagiarism Detected' : 'AI Assessment: Safe'}
                      </h5>
                      <button onClick={() => runDeepScan()} disabled={scanning} className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                        {scanning ? <Loader2 className="animate-spin" size={12} /> : <Brain size={12} />}
                        {scanning ? 'Scanning...' : 'Rescan'}
                      </button>
                    </div>
                    {deepScanResult.error ? (
                      <p className="mt-1 text-xs text-[var(--danger)]">{deepScanResult.error}</p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{deepScanResult.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
                      <Brain size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-purple-700">AI Deep Scan Available</h5>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Analyze algorithmic logic using embedding models.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => runDeepScan()} 
                    disabled={scanning}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {scanning ? <Loader2 className="animate-spin" size={14} /> : <Brain size={14} />}
                    {scanning ? 'Scanning...' : 'Deep Scan'}
                  </button>
                </div>
              )}
            </div>

            {/* Metrics Cards */}
            {selectedLocalPair?.details && (
              <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border-default)] sm:grid-cols-4 sm:divide-y-0 bg-[var(--bg-secondary)]">
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
                    <FileText size={12} /> Token
                  </div>
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    {selectedLocalPair.details.tokenScore?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
                    <GitMerge size={12} /> Structural
                  </div>
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    {selectedLocalPair.details.structuralScore?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
                    <Brain size={12} /> Semantic
                  </div>
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    {selectedLocalPair.details.semanticScore?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">
                    <ShieldAlert size={12} /> Confidence
                  </div>
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    {selectedLocalPair.details.confidenceScore?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            )}

            {/* Footer Summary Strip */}
            <div className="flex flex-wrap items-center justify-between border-t border-[var(--border-default)] bg-[var(--bg-elevated)] px-5 py-2.5 text-xs text-[var(--text-secondary)]">
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Boilerplate ignored:</span> {selectedLocalPair?.details?.boilerplateRemovedCount || 0}
              </div>
              <div className="flex gap-4">
                <span><span className="font-semibold text-[var(--text-primary)]">Overlap:</span> {diffData.summary.overlapPercent}%</span>
                <span><span className="font-semibold text-[var(--text-primary)]">Changed:</span> {diffData.summary.changedLines}</span>
              </div>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-[var(--border-default)] scrollbar-track-transparent rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-inner">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
                  <th className="w-10 px-2 py-2 text-right font-semibold text-[var(--text-secondary)] select-none border-r border-[var(--border-default)]">#</th>
                  <th className="w-[calc(50%-40px)] px-4 py-2 text-left font-semibold text-[var(--text-secondary)]">Original Snippet</th>
                  <th className="w-10 px-2 py-2 text-right font-semibold text-[var(--text-secondary)] select-none border-x border-[var(--border-default)]">#</th>
                  <th className="w-[calc(50%-40px)] px-4 py-2 text-left font-semibold text-[var(--text-secondary)]">Compared Snippet</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] leading-relaxed">
                {diffData.rows.map((row, idx) => {
                  const isBlankSame = row.type === 'same' && !(row.left || '').trim() && !(row.right || '').trim();
                  const rowBg = isBlankSame ? 'bg-transparent' : (rowClass[row.type] || rowClass.same);
                  const isSameText = row.type === 'same' && !isBlankSame;

                  return (
                    <tr key={`row-${idx}`} className={`${rowBg} hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-default)]/30`}>
                      <td className="w-10 px-2 py-1.5 text-right text-[var(--text-tertiary)] select-none border-r border-[var(--border-default)]">{row.leftNo ?? ''}</td>
                      <td className={`px-4 py-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed ${
                        isSameText ? 'font-medium text-[var(--danger)]' : 'text-[var(--text-primary)]'
                      } border-r border-[var(--border-default)]`}>
                        <CodeHighlight code={row.left} />
                      </td>
                      <td className="w-10 px-2 py-1.5 text-right text-[var(--text-tertiary)] select-none border-r border-[var(--border-default)]">{row.rightNo ?? ''}</td>
                      <td className={`px-4 py-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed ${
                        isSameText ? 'font-medium text-[var(--danger)]' : 'text-[var(--text-primary)]'
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
