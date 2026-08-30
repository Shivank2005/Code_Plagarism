import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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

  const spacedCode = code.replace(/([;{}])/g, '$1\u200B');

  // Advanced syntax highlighting regex covering Java, Python, JS, C++, Go, Rust, and comments
  const tokenRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*|\/\*[\s\S]*?\*\/|\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|def|False|True|None|and|as|async|await|del|elif|except|from|global|is|lambda|nonlocal|not|or|pass|raise|with|yield|function|let|var|export|struct|impl|mut|fn|match|loop|pub|use|go|chan|defer|fallthrough|type)\b|\b(?:String|Integer|Double|System|Math|Scanner|List|Map|Set|Dict|Array|Console|Object|Promise|Vector|HashMap|print|println|out|len|range)\b|\b\d+(?:\.\d+)?\b|[+\-*/=<>!&|%^~]+)/g;
  
  const parts = spacedCode.split(tokenRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (/^["']/.test(part)) return <span key={index} className="text-[#1D4ED8]">{part}</span>;
        if (/^\/\/|^\/\*/.test(part)) return <span key={index} className="text-[#64748B] italic">{part}</span>;
        if (/^[+\-*/=<>!&|%^~]+$/.test(part)) return <span key={index} className="text-[#DC2626]">{part}</span>;
        if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|def|False|True|None|and|as|async|await|del|elif|except|from|global|is|lambda|nonlocal|not|or|pass|raise|with|yield|function|let|var|export|struct|impl|mut|fn|match|loop|pub|use|go|chan|defer|fallthrough|type)$/.test(part)) {
          return <span key={index} className="text-[#DC2626] font-semibold">{part}</span>;
        }
        if (/^(String|Integer|Double|System|Math|Scanner|List|Map|Set|Dict|Array|Console|Object|Promise|Vector|HashMap|print|println|out|len|range)$/.test(part)) {
          return <span key={index} className="text-[#1D4ED8]">{part}</span>;
        }
        if (/^\d+(?:\.\d+)?$/.test(part)) return <span key={index} className="text-[#1D4ED8]">{part}</span>;
        return <span key={index} className="text-[#0F172A]">{part}</span>;
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
      if (res.data.error) toast.error(res.data.error);
      else toast.success("AI Logic Scan complete!");
    } catch (err) {
      toast.error(err.message || "Failed to connect to AI Deep Scan service.");
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
      <div className="glass-card rounded-[2rem] border border-dashed border-[#E2E8F0] p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-[#0F172A]">No Files Available For Diff</h3>
        <p className="mt-2 text-[#64748B]">Run an analysis and semantic embedding step before opening pairwise diffs.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display flex items-center gap-3 text-2xl font-bold text-[#0F172A]">
            <GitCompareArrows className="text-[#2563EB]" /> Pairwise Diff Explorer
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">Inspect high-similarity pairs to verify copied or transformed lines.</p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-[#E2E8F0] shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[#E2E8F0] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-[#FFFFFF] scrollbar-thumb-[#94A3B8] hover:scrollbar-thumb-[#64748B]">
          {candidatePairs.length === 0 && (
            <div className="col-span-full p-8 text-center text-sm text-[#64748B] bg-[#FFFFFF]">
              No semantic links available yet. Generate embedding graph first.
            </div>
          )}
          {candidatePairs.map((pair) => (
            <button
              key={`${pair.source}-${pair.target}`}
              onClick={() => runDiff(pair)}
              className={`group flex flex-col p-5 text-left transition-all duration-200 ${
                selectedLocalPair?.source === pair.source && selectedLocalPair?.target === pair.target
                  ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#FFFFFF] shadow-[inset_3px_0_0_#2563EB]'
                  : 'bg-[#FFFFFF] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="mb-4 flex w-full items-center justify-between overflow-hidden">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black tracking-widest uppercase ${
                    pair.weight > 75 ? 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 shadow-[0_0_10px_rgba(248,81,73,0.1)]' 
                    : pair.weight >= 40 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    : 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                }`}>
                  {pair.weight}% MATCH
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                  Inspect →
                </span>
              </div>
              <div className="flex w-full items-center justify-between gap-3">
                <p className="flex-1 truncate text-xs font-semibold text-[#0F172A] transition-colors group-hover:text-[#2563EB]" title={pair.source.split('/').pop()}>
                  {pair.source.split('/').pop()}
                </p>
                <span className="text-[#64748B] opacity-30 px-1 font-light">↔</span>
                <p className="flex-1 truncate text-right text-xs font-semibold text-[#0F172A] transition-colors group-hover:text-[#2563EB]" title={pair.target.split('/').pop()}>
                  {pair.target.split('/').pop()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#2563EB]">
          <Loader2 className="animate-spin" size={16} /> Building diff view...
        </div>
      )}

      {error && <p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">{error}</p>}

      {diffData && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-lg">
            {/* Header Strip */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
              <h4 className="font-display text-lg font-bold text-[#0F172A] flex items-center">
                {selectedLocalPair?.source.split('/').pop()} <span className="mx-3 text-[#94A3B8]">↔</span> {selectedLocalPair?.target.split('/').pop()}
              </h4>
              <div className="flex items-center gap-3">
                {selectedLocalPair?.details?.featureImportance && Object.keys(selectedLocalPair.details.featureImportance).length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] border-r border-[#E2E8F0] pr-3">
                    Top factor: {Object.entries(selectedLocalPair.details.featureImportance).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))[0][0]}
                  </span>
                )}
                {(selectedLocalPair?.details?.isAnomaly || selectedLocalPair?.details?.anomaly) && (
                  <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2563EB] border border-[#C4B5FD]">⚠️ ISOLATION ANOMALY</span>
                )}
                {selectedLocalPair?.weight >= 75 ? (
                  <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#DC2626] border border-[#FECACA] shadow-[0_0_15px_rgba(220,38,38,0.10)]">High Risk</span>
                ) : selectedLocalPair?.weight >= 40 ? (
                  <span className="rounded-full bg-[#FFFBEB] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#B45309] border border-[#FCD34D]">Suspicious</span>
                ) : (
                  <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#16A34A] border border-[#BBF7D0]">Safe</span>
                )}
              </div>
            </div>

            {/* AI Deep Scan Module (Always Visible) */}
            <div className={`border-b border-[#E2E8F0] px-6 py-4 transition-colors ${deepScanResult ? (deepScanResult.plagiarized ? 'bg-[#FEF2F2]' : 'bg-[#F0FDF4]') : 'bg-[#EFF6FF]'}`}>
              {deepScanResult ? (
                <div className="flex items-start gap-4">
                  <div className={`mt-1 rounded-full p-2 ${deepScanResult.plagiarized ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
                    {deepScanResult.plagiarized ? <ShieldAlert size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className={`font-display text-lg font-bold ${deepScanResult.plagiarized ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                        {deepScanResult.plagiarized ? 'Comparison: Plagiarism Detected' : 'Comparison: Safe'}
                      </h5>
                      <button onClick={() => runDeepScan()} disabled={scanning} className="text-[10px] uppercase font-bold text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center gap-1">
                        {scanning ? <Loader2 className="animate-spin" size={12} /> : <Brain size={12} />}
                        {scanning ? 'Comparing...' : 'Compare Again'}
                      </button>
                    </div>
                    {deepScanResult.error ? (
                      <p className="mt-1 text-sm text-[#BE123C]">{deepScanResult.error}</p>
                    ) : (
                      <p className="mt-1 text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{deepScanResult.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-[#EFF6FF] p-2 text-[#2563EB]">
                      <Brain size={20} />
                    </div>
                    <div>
                      <h5 className="font-display text-sm font-bold text-[#2563EB]">Logic Comparison Available</h5>
                      <p className="mt-0.5 text-xs text-[#64748B]">Analyze algorithmic logic and detect cross-language translations instantly.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => runDeepScan()} 
                    disabled={scanning}
                    className="flex items-center gap-2 rounded-lg bg-[#EFF6FF] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#2563EB] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {scanning ? <Loader2 className="animate-spin" size={14} /> : <Brain size={14} />}
                    {scanning ? 'Comparing...' : 'Compare Logic'}
                  </button>
                </div>
              )}
            </div>

            {/* 4 Metric Cards */}
            {selectedLocalPair?.details && (
              <div className="grid grid-cols-2 divide-x divide-y divide-[#E2E8F0] sm:grid-cols-4 sm:divide-y-0">
                {/* Token */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-[#F8FAFC]">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0891B2]">
                    <FileText size={14} /> Token
                  </div>
                  <span className="font-display text-3xl font-bold text-[#0F172A]">
                    {selectedLocalPair.details.tokenScore?.toFixed(1) || 0}%
                  </span>
                </div>
                {/* Structural */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-[#F8FAFC]">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">
                    <GitMerge size={14} /> Structural
                  </div>
                  <span className="font-display text-3xl font-bold text-[#0F172A]">
                    {selectedLocalPair.details.structuralScore?.toFixed(1) || 0}%
                  </span>
                </div>
                {/* Semantic */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-[#F8FAFC]">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">
                    <Brain size={14} /> Semantic
                  </div>
                  <span className="font-display text-3xl font-bold text-[#0F172A]">
                    {selectedLocalPair.details.semanticScore?.toFixed(1) || 0}%
                  </span>
                </div>
                {/* Confidence */}
                <div className="flex flex-col items-center justify-center p-6 transition-colors hover:bg-[#F8FAFC]">
                  <div className={`mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                      (selectedLocalPair.details.confidenceScore || 0) >= 80 ? 'text-[#16A34A]' : 'text-[#B45309]'
                  }`}>
                    <ShieldAlert size={14} /> Confidence
                  </div>
                  <span className="font-display text-3xl font-bold text-[#0F172A]">
                    {selectedLocalPair.details.confidenceScore?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            )}

            {/* Footer Summary Strip */}
            <div className="flex flex-wrap items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3 text-xs text-[#64748B]">
              <div>
                <span className="font-semibold text-[#0F172A]">Boilerplate ignored:</span> {selectedLocalPair?.details?.boilerplateRemovedCount || 0}
              </div>
              <div className="flex gap-4">
                <span><span className="font-semibold text-[#0F172A]">Overlap:</span> {diffData.summary.overlapPercent}%</span>
                <span><span className="font-semibold text-[#0F172A]">Changed:</span> {diffData.summary.changedLines}</span>
              </div>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-[#CBD5E1] scrollbar-track-transparent rounded-2xl border border-[#E2E8F0] bg-white shadow-inner">
            <table className="w-full border-collapse text-xs table-fixed">
              <thead className="sticky top-0 z-0 shadow-md">
                <tr className="bg-[#F8FAFC] backdrop-blur-md text-[#64748B]">
                  <th className="w-12 px-2 py-3 text-right font-semibold uppercase tracking-wider text-[10px] select-none border-b border-[#E2E8F0]">L#</th>
                  <th className="w-[calc(50%-48px)] px-4 py-3 text-left font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0]">Original Snippet</th>
                  <th className="w-12 px-2 py-3 text-right font-semibold uppercase tracking-wider text-[10px] border-l border-b border-[#E2E8F0] select-none">R#</th>
                  <th className="w-[calc(50%-48px)] px-4 py-3 text-left font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0]">Compared Snippet</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] leading-relaxed">
                {diffData.rows.map((row, idx) => {
                  const isBlankSame = row.type === 'same' && !(row.left || '').trim() && !(row.right || '').trim();
                  const rowBg = isBlankSame ? 'bg-transparent' : (rowClass[row.type] || rowClass.same);
                  const isSameText = row.type === 'same' && !isBlankSame;

                  return (
                    <tr key={`row-${idx}`} className={`${rowBg} hover:bg-[#F8FAFC] transition-colors`}>
                      <td className="w-12 px-2 py-1 text-right text-[#94A3B8] select-none border-r border-[#E2E8F0]">{row.leftNo ?? ''}</td>
                      <td className={`px-4 py-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-6 ${
                        isSameText ? 'text-[#BE123C]' : 'text-[#334155]'
                      } border-r border-[#E2E8F0]`}>
                        <CodeHighlight code={row.left} />
                      </td>
                      <td className="w-12 px-2 py-1.5 text-right text-[#94A3B8] select-none border-r border-[#E2E8F0]">{row.rightNo ?? ''}</td>
                      <td className={`px-4 py-1.5 whitespace-pre-wrap break-words font-mono text-[11px] leading-6 ${
                        isSameText ? 'text-[#BE123C]' : 'text-[#334155]'
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
