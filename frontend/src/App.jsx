import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  GitCompareArrows,
  History,
  LayoutDashboard,
  Loader2,
  Menu,
  Network,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import UploadZone from './components/UploadZone';
import SimilarityHeatmap from './components/SimilarityHeatmap';
import SuspiciousPairsList from './components/SuspiciousPairsList';
import SimilarityGraph from './components/SimilarityGraph';
import DiffViewer from './components/DiffViewer';

const API_BASE = 'http://localhost:8082/api';
const CODEBERT_API = 'http://localhost:8090/api/embeddings';
const DEFAULT_PREFERENCES = {
  highRiskThreshold: 75,
  suspiciousThreshold: 40,
  autoRefreshHistory: true,
  compactMode: false,
  animateHeatmap: true,
};

function App() {
  const [activeBatch, setActiveBatch] = useState('');
  const [results, setResults] = useState(null);
  const [semanticResults, setSemanticResults] = useState(null);
  const [batchFiles, setBatchFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const [view, setView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [preferenceProfile, setPreferenceProfile] = useState('default');
  const [selectedSuspiciousPair, setSelectedSuspiciousPair] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    setPreferencesLoaded(false);

    const loadPreferences = async () => {
      const storageKey = `plagshield.preferences.${preferenceProfile}`;
      try {
        const res = await axios.get(`${API_BASE}/preferences`, { params: { user: preferenceProfile } });
        setPreferences({ ...DEFAULT_PREFERENCES, ...res.data });
      } catch (err) {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          try {
            setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
          } catch (parseErr) {
            console.error('Failed to parse local preferences:', parseErr);
          }
        }
      } finally {
        setPreferencesLoaded(true);
      }
    };

    loadPreferences();
  }, [preferenceProfile]);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    const storageKey = `plagshield.preferences.${preferenceProfile}`;
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));

    axios.put(`${API_BASE}/preferences`, { ...preferences }, { params: { user: preferenceProfile } }).catch((err) => {
      console.error('Failed to persist preferences to backend:', err);
    });
  }, [preferences, preferencesLoaded, preferenceProfile]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2400);
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analysis/history`);
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleUploadSuccess = async (data) => {
    setActiveBatch(data.batchId);
    if (Array.isArray(data.files) && data.files.length > 0) {
      setBatchFiles(data.files);
      await fetchSemanticEmbeddings(data.files);
      setResults(buildLocalResults(data.files, preferences));
    }
    setIsAnalyzing(true);
    startAnalysis(data.batchId);
  };

  const startAnalysis = async (batchId) => {
    try {
      await axios.post(`${API_BASE}/analysis/${batchId}/start`);
      pollStatus(batchId);
    } catch (err) {
      console.error('Error starting analysis:', err);
      setIsAnalyzing(false);
    }
  };

  const pollStatus = (batchId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/analysis/${batchId}/status`);
        if (res.data.status === 'COMPLETED') {
          clearInterval(interval);
          fetchResults(batchId);
          if (preferences.autoRefreshHistory) {
            fetchHistory();
          }
        } else if (res.data.status === 'FAILED') {
          clearInterval(interval);
          setIsAnalyzing(false);
          showToast('Analysis failed for this batch.', 'error');
        }
      } catch (err) {
        clearInterval(interval);
        setIsAnalyzing(false);
      }
    }, 2000);
  };

  const fetchResults = async (batchId) => {
    try {
      const res = await axios.get(`${API_BASE}/analysis/${batchId}/results`);
      if (res.data && Array.isArray(res.data.students) && res.data.students.length > 0) {
        setResults(res.data);
      } else if (batchFiles.length > 0) {
        setResults(buildLocalResults(batchFiles, preferences));
      }
      await fetchBatchFiles(batchId);
      setIsAnalyzing(false);
      if (preferences.autoRefreshHistory) {
        fetchHistory();
      }
      showToast('Analysis completed and matrix generated.', 'success');
    } catch (err) {
      console.error('Error fetching results:', err);
      if (batchFiles.length > 0) {
        setResults(buildLocalResults(batchFiles, preferences));
      }
      setIsAnalyzing(false);
    }
  };

  const fetchBatchFiles = async (batchId) => {
    try {
      const res = await axios.get(`${API_BASE}/analysis/${batchId}/files`);
      const files = Array.isArray(res.data.files) ? res.data.files : [];
      setBatchFiles(files);

      if (files.length >= 2) {
        await fetchSemanticEmbeddings(files);
      } else {
        setSemanticResults(null);
      }
    } catch (err) {
      console.error('Error fetching batch files:', err);
      setBatchFiles([]);
      setSemanticResults(null);
    }
  };

  const fetchSemanticEmbeddings = async (files) => {
    setIsSemanticLoading(true);
    try {
      const res = await axios.post(`${CODEBERT_API}/similarity-matrix`, {
        submissions: files,
      });
      setSemanticResults(res.data);
    } catch (err) {
      console.error('Error fetching CodeBERT similarity matrix:', err);
      setSemanticResults(null);
      showToast('CodeBERT service not reachable on port 8090. Graph and diff views are offline.', 'error');
    } finally {
      setIsSemanticLoading(false);
    }
  };

  const buildLocalResults = (files, currentPreferences) => {
    const students = files.map((file) => file.id);
    const matrix = files.map((leftFile, leftIndex) => {
      return files.map((rightFile, rightIndex) => {
        if (leftIndex === rightIndex) {
          return 100;
        }

        const leftText = (leftFile.code || '').replace(/\s+/g, ' ').trim();
        const rightText = (rightFile.code || '').replace(/\s+/g, ' ').trim();
        if (!leftText || !rightText) {
          return 0;
        }

        const leftTokens = new Set(leftText.split(/\W+/).filter(Boolean));
        const rightTokens = new Set(rightText.split(/\W+/).filter(Boolean));
        const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
        const union = new Set([...leftTokens, ...rightTokens]).size || 1;
        const tokenScore = (intersection / union) * 100;

        const maxLength = Math.max(leftText.length, rightText.length) || 1;
        const charScore = (1 - Math.abs(leftText.length - rightText.length) / maxLength) * 100;

        return Math.max(0, Math.round((tokenScore * 0.7 + charScore * 0.3) * 100) / 100);
      });
    });

    const riskThreshold = currentPreferences.highRiskThreshold ?? DEFAULT_PREFERENCES.highRiskThreshold;
    const adjacency = new Map(students.map((student) => [student, new Set()]));

    for (let i = 0; i < students.length; i += 1) {
      for (let j = i + 1; j < students.length; j += 1) {
        if (matrix[i][j] >= riskThreshold) {
          adjacency.get(students[i]).add(students[j]);
          adjacency.get(students[j]).add(students[i]);
        }
      }
    }

    const rings = [];
    const visited = new Set();
    students.forEach((student) => {
      if (visited.has(student) || adjacency.get(student).size === 0) {
        return;
      }
      const stack = [student];
      const cluster = [];
      visited.add(student);
      while (stack.length > 0) {
        const current = stack.pop();
        cluster.push(current);
        adjacency.get(current).forEach((neighbor) => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            stack.push(neighbor);
          }
        });
      }
      if (cluster.length > 1) {
        rings.push(cluster);
      }
    });

    return {
      students,
      matrix,
      rings,
      status: 'COMPLETED',
    };
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handlePairSelection = (pair) => {
    setSelectedSuspiciousPair(pair);
    setView('diff');
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) {
      return history;
    }

    const query = searchTerm.toLowerCase();
    return history.filter((batch) => {
      return (
        batch.id.toLowerCase().includes(query) ||
        batch.status.toLowerCase().includes(query) ||
        new Date(batch.createdAt).toLocaleString().toLowerCase().includes(query)
      );
    });
  }, [history, searchTerm]);

  const normalizedRings = useMemo(() => {
    if (!results || !Array.isArray(results.rings)) {
      return [];
    }
    return results.rings.map((ring) => Array.from(ring));
  }, [results]);

  const studentsIndex = useMemo(() => {
    if (!results) {
      return new Map();
    }

    return new Map(results.students.map((student, index) => [student, index]));
  }, [results]);

  const getPairScore = (studentA, studentB) => {
    if (!results) {
      return 0;
    }
    const a = studentsIndex.get(studentA);
    const b = studentsIndex.get(studentB);
    if (a === undefined || b === undefined) {
      return 0;
    }
    return results.matrix[a][b] ?? 0;
  };

  const exportHistoryCsv = () => {
    if (filteredHistory.length === 0) {
      showToast('No history rows to export.', 'error');
      return;
    }

    const csvRows = [
      'batchId,status,createdAt',
      ...filteredHistory.map((batch) => `${batch.id},${batch.status},${new Date(batch.createdAt).toISOString()}`),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagshield-history-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    showToast('History exported as CSV.', 'success');
  };

  const clearHistory = async () => {
    try {
      await axios.delete(`${API_BASE}/analysis/history`);
      setHistory([]);
      setResults(null);
      setSemanticResults(null);
      setBatchFiles([]);
      setActiveBatch('');
      showToast('History cleared from backend and dashboard.', 'success');
    } catch (err) {
      showToast('Failed to clear history from backend.', 'error');
    }
  };

  const riskThreshold = preferences.highRiskThreshold;
  const suspiciousThreshold = preferences.suspiciousThreshold;

  const highRiskPairs = results
    ? Math.round(results.matrix.flat().filter((score) => score > riskThreshold && score < 100).length / 2)
    : 0;

  const suspiciousPairs = results
    ? Math.round(
        results.matrix
          .flat()
          .filter((score) => score >= suspiciousThreshold && score <= riskThreshold)
          .length / 2,
      )
    : 0;

  const summaryTiles = [
    {
      label: 'Active Batch',
      value: activeBatch ? `${activeBatch.substring(0, 8)}...` : 'None',
      tone: 'from-cyan-500/25 to-transparent border-cyan-300/30',
    },
    {
      label: 'High Risk Pairs',
      value: highRiskPairs,
      tone: 'from-amber-500/25 to-transparent border-amber-300/30',
    },
    {
      label: 'Rings Found',
      value: results ? results.rings.length : 0,
      tone: 'from-rose-500/25 to-transparent border-rose-300/30',
    },
    {
      label: 'Suspicious Pairs',
      value: suspiciousPairs,
      tone: 'from-orange-500/25 to-transparent border-orange-300/30',
    },
  ];

  const renderHeaderSubtitle = () => {
    if (view === 'history') {
      return 'Inspect, filter, and export prior analysis runs.';
    }
    if (view === 'rings') {
      return 'Review suspected collaboration groups and pair-level evidence.';
    }
    if (view === 'preferences') {
      return 'Tune scoring thresholds and dashboard behavior.';
    }
    if (view === 'graph') {
      return 'Explore semantic clusters generated from CodeBERT embeddings.';
    }
    if (view === 'diff') {
      return 'Inspect suspicious pairs in a side-by-side semantic diff viewer.';
    }
    return 'Upload source bundles, compute fingerprints, and reveal structural similarities.';
  };

  const renderView = () => {
    if (view === 'history') {
      return (
        <motion.div
          key="history"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-2xl font-bold text-white">Analysis History</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportHistoryCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-100/20 bg-cyan-950/60 px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-900/80"
              >
                <Download size={15} /> Export CSV
              </button>
              <button
                onClick={clearHistory}
                className="inline-flex items-center gap-2 rounded-xl border border-orange-100/20 bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-100 transition-colors hover:bg-orange-500/30"
              >
                <Trash2 size={15} /> Clear History
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 && (
            <div className="rounded-2xl border border-cyan-100/10 bg-cyan-500/5 p-8 text-center">
              <p className="font-display text-xl text-white">No matching analysis records</p>
              <p className="mt-2 text-sm text-cyan-100/60">Try a different search phrase or run a new analysis batch.</p>
            </div>
          )}

          <div className="space-y-3">
            {filteredHistory.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group cursor-pointer rounded-2xl border border-cyan-100/15 bg-[#062333]/60 p-5 transition-all hover:bg-[#072b40]/80"
                onClick={() => {
                  fetchResults(batch.id);
                  setView('dashboard');
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : batch.status === 'FAILED'
                            ? 'bg-rose-500/20 text-rose-200'
                            : 'bg-cyan-500/20 text-cyan-100'
                      }`}
                    >
                      {batch.status === 'COMPLETED' ? <CheckCircle2 size={24} /> : <BarChart3 size={24} />}
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-white transition-colors group-hover:text-cyan-100">
                        {batch.id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-cyan-100/60">{new Date(batch.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        batch.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-100'
                          : batch.status === 'FAILED'
                            ? 'bg-rose-500/20 text-rose-100'
                            : 'bg-cyan-500/20 text-cyan-100'
                      }`}
                    >
                      {batch.status}
                    </span>
                    <ChevronRight className="text-cyan-100/50 transition-colors group-hover:text-cyan-50" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (view === 'rings') {
      return (
        <motion.div
          key="rings"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-2xl font-bold text-white">Plagiarism Rings</h3>
            <span className="rounded-full border border-cyan-100/20 bg-cyan-950/60 px-3 py-1 text-xs uppercase tracking-[0.14em] text-cyan-100/80">
              {normalizedRings.length} clusters
            </span>
          </div>

          {!results && (
            <div className="rounded-2xl border border-cyan-100/10 bg-cyan-500/5 p-8 text-center">
              <p className="font-display text-xl text-white">No ring data available yet</p>
              <p className="mt-2 text-sm text-cyan-100/60">Run an analysis in Overview to populate ring intelligence.</p>
            </div>
          )}

          {results && normalizedRings.length === 0 && (
            <div className="rounded-2xl border border-emerald-100/20 bg-emerald-500/10 p-8 text-center">
              <p className="font-display text-xl text-white">No collaboration rings detected</p>
              <p className="mt-2 text-sm text-emerald-100/70">Current dataset does not contain suspicious collaborative clusters.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {normalizedRings.map((ring, ringIndex) => {
              const peakScore = ring.reduce((max, studentA, i) => {
                for (let j = i + 1; j < ring.length; j += 1) {
                  max = Math.max(max, getPairScore(studentA, ring[j]));
                }
                return max;
              }, 0);

              const severityLabel =
                peakScore > riskThreshold ? 'High Risk' : peakScore >= suspiciousThreshold ? 'Suspicious' : 'Low';

              return (
                <div key={`ring-${ringIndex}`} className="rounded-2xl border border-cyan-100/15 bg-[#062333]/70 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-display text-lg text-white">Cluster #{ringIndex + 1}</p>
                    <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs uppercase tracking-[0.12em] text-rose-100">
                      {severityLabel}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {ring.map((student) => (
                      <span key={student} className="rounded-md border border-cyan-100/15 bg-cyan-500/15 px-2.5 py-1 text-xs text-cyan-100">
                        {student.split('.')[0]}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-xl border border-cyan-100/15 bg-cyan-950/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-100/65">Peak Pair Similarity</p>
                    <p className="mt-1 font-display text-2xl font-bold text-white">{peakScore.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    if (view === 'preferences') {
      return (
        <motion.div
          key="preferences"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="mb-8 flex items-center gap-3">
            <SlidersHorizontal className="text-cyan-200" size={22} />
            <h3 className="font-display text-2xl font-bold text-white">Preferences</h3>
          </div>

          <div className="mb-5 rounded-2xl border border-cyan-100/15 bg-[#062333]/70 p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-cyan-100/65">Preference Profile</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={preferenceProfile}
                onChange={(event) => setPreferenceProfile(event.target.value || 'default')}
                placeholder="Enter profile name"
                className="w-full rounded-lg border border-cyan-100/20 bg-cyan-950/70 px-3 py-2 text-sm text-cyan-50 outline-none focus:border-cyan-100/45"
              />
              <span className="rounded-full border border-cyan-100/20 bg-cyan-900/50 px-3 py-1 text-xs text-cyan-100/85">
                Active: {preferenceProfile}
              </span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PreferenceCard title="Risk Threshold" subtitle="Similarity score to classify high risk pairs.">
              <div className="mb-2 flex items-center justify-between text-sm text-cyan-100/80">
                <span>High Risk Threshold</span>
                <span className="font-display text-white">{preferences.highRiskThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={preferences.highRiskThreshold}
                onChange={(event) => updatePreference('highRiskThreshold', Number(event.target.value))}
                className="w-full accent-cyan-300"
              />
            </PreferenceCard>

            <PreferenceCard title="Suspicious Threshold" subtitle="Lower bound for suspicious similarity.">
              <div className="mb-2 flex items-center justify-between text-sm text-cyan-100/80">
                <span>Suspicious Threshold</span>
                <span className="font-display text-white">{preferences.suspiciousThreshold}%</span>
              </div>
              <input
                type="range"
                min="15"
                max={Math.max(20, preferences.highRiskThreshold - 5)}
                value={preferences.suspiciousThreshold}
                onChange={(event) => updatePreference('suspiciousThreshold', Number(event.target.value))}
                className="w-full accent-cyan-300"
              />
            </PreferenceCard>

            <PreferenceCard title="Automation" subtitle="Control dashboard refresh behavior.">
              <ToggleOption
                label="Auto refresh history after analysis"
                checked={preferences.autoRefreshHistory}
                onChange={(value) => updatePreference('autoRefreshHistory', value)}
              />
              <ToggleOption
                label="Animate heatmap cells"
                checked={preferences.animateHeatmap}
                onChange={(value) => updatePreference('animateHeatmap', value)}
              />
            </PreferenceCard>

            <PreferenceCard title="Layout" subtitle="Adjust dashboard density and spacing.">
              <ToggleOption
                label="Compact mode"
                checked={preferences.compactMode}
                onChange={(value) => updatePreference('compactMode', value)}
              />
              <button
                onClick={() => {
                  setPreferences(DEFAULT_PREFERENCES);
                  showToast(`Preferences reset for profile ${preferenceProfile}.`, 'success');
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-100/20 bg-cyan-950/70 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-900/80"
              >
                <Sparkles size={14} /> Reset Defaults
              </button>
            </PreferenceCard>
          </div>
        </motion.div>
      );
    }

    if (view === 'graph') {
      return (
        <motion.div
          key="graph"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {isSemanticLoading && (
            <div className="glass-card rounded-2xl border-cyan-300/30 p-4 text-sm text-cyan-100">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-cyan-300" size={16} /> Generating CodeBERT embeddings and graph topology...
              </div>
            </div>
          )}
          <SimilarityGraph data={semanticResults} />
        </motion.div>
      );
    }

    if (view === 'diff') {
      return (
        <motion.div
          key="diff"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <DiffViewer files={batchFiles} semanticData={semanticResults} selectedPair={selectedSuspiciousPair} />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className={`grid grid-cols-1 gap-6 xl:grid-cols-12 ${preferences.compactMode ? 'xl:gap-4' : ''}`}
      >
        <div className="xl:col-span-5 flex flex-col gap-6">
          <UploadZone onUploadSuccess={handleUploadSuccess} />

          {batchFiles.length > 0 && (
            <div className="glass-card rounded-[2rem] border-cyan-200/20 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/60">Uploaded Files</p>
              <div className="mt-3 max-h-52 space-y-2 overflow-auto pr-1">
                {batchFiles.map((file) => (
                  <div key={file.id} className="rounded-xl border border-cyan-100/10 bg-cyan-950/50 px-3 py-2 text-sm text-cyan-50">
                    {file.id}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-card rounded-[2rem] border-cyan-300/30 p-8 text-center">
              <div className="relative">
                <Loader2 className="mx-auto animate-spin text-cyan-300" size={48} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 -z-10 bg-cyan-400 blur-2xl"
                />
              </div>
              <h4 className="mt-4 font-display text-lg font-bold text-white">Analysis in Progress</h4>
              <p className="mt-1 text-sm text-cyan-100/70">Generating structural fingerprints and cluster maps...</p>
            </div>
          )}

          {!isAnalyzing && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[2rem] border-emerald-200/30 p-7"
            >
              <div className="mb-5 flex items-center gap-4">
                <CheckCircle2 className="text-emerald-300" size={30} />
                <div>
                  <h4 className="font-display text-lg font-bold text-white">Analysis Complete</h4>
                  <p className="text-sm text-emerald-100/70">Processed {results.students.length} submissions</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-100/15 bg-emerald-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-100/70">High Risk Pairs</p>
                  <p className="font-display text-2xl font-black text-white">{highRiskPairs}</p>
                </div>
                <div className="rounded-2xl border border-orange-100/20 bg-orange-500/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-orange-100/70">Suspicious Pairs</p>
                  <p className="font-display text-2xl font-black text-white">{suspiciousPairs}</p>
                </div>
              </div>
            </motion.div>
          )}

          {results && (
            <SuspiciousPairsList
              data={results}
              thresholds={{ highRisk: riskThreshold, suspicious: suspiciousThreshold }}
              onPairClick={handlePairSelection}
            />
          )}
        </div>

        <div className="xl:col-span-7">
          <SimilarityHeatmap
            data={results}
            thresholds={{ highRisk: riskThreshold, suspicious: suspiciousThreshold }}
            animateCells={preferences.animateHeatmap}
            onPairSelect={(pair) => {
              setSelectedSuspiciousPair(pair);
              setView('diff');
            }}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-sky-50 selection:bg-cyan-400/30 selection:text-cyan-50">
      <div className="pointer-events-none absolute -left-16 top-12 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 top-36 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1700px] px-4 py-4 md:px-6 lg:px-8">
        <aside className="glass-card soft-grid hidden w-72 shrink-0 rounded-3xl p-7 lg:flex lg:flex-col lg:gap-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-700 shadow-xl shadow-cyan-900/40">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-white">PlagShield</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200/80">Core v2.1</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            <NavItem icon={<LayoutDashboard />} label="Overview" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavItem icon={<History />} label="Analytics History" active={view === 'history'} onClick={() => setView('history')} />
            <NavItem icon={<Users />} label="Plagiarism Rings" active={view === 'rings'} onClick={() => setView('rings')} />
            <NavItem icon={<Network />} label="Embedding Graph" active={view === 'graph'} onClick={() => setView('graph')} />
            <NavItem icon={<GitCompareArrows />} label="Diff View" active={view === 'diff'} onClick={() => setView('diff')} />
            <div className="my-3 border-t border-cyan-100/10" />
            <NavItem icon={<Settings />} label="Preferences" active={view === 'preferences'} onClick={() => setView('preferences')} />
          </nav>

          <div className="rounded-2xl border border-cyan-100/20 bg-cyan-500/10 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500" />
              <div>
                <p className="text-xs font-bold text-white">System Status</p>
                <p className="text-[10px] font-mono uppercase text-emerald-200">All Systems Nominal</p>
              </div>
            </div>
            <button
              onClick={() => showToast('Log stream is available in backend terminal output.', 'info')}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-900/60 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-800/70"
            >
              View Logs <ChevronRight size={14} />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-2 pb-8 pt-4 sm:px-4 lg:px-10">
            <header className="glass-card mb-8 rounded-3xl px-5 py-6 sm:px-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 lg:hidden">
                  <button
                    onClick={() => setIsMobileNavOpen((prev) => !prev)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-100"
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <p className="font-display text-lg font-semibold text-white">PlagShield</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">Analysis Console</p>
                  </div>
                </div>

                <div className="hidden items-center gap-4 sm:ml-auto sm:flex">
                  <div className="group relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/70 transition-colors group-focus-within:text-cyan-200" size={18} />
                    <input
                      type="text"
                      placeholder="Search by id, status, date..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-60 rounded-full border border-cyan-200/20 bg-[#062333]/80 py-2.5 pl-10 pr-5 text-sm text-cyan-50 placeholder:text-cyan-200/45 outline-none ring-cyan-300/25 transition-all focus:border-cyan-200/40 focus:ring-4"
                    />
                  </div>
                  <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cyan-100/25 bg-[#052235] text-cyan-200 transition-colors hover:text-white">
                    <Bell size={19} />
                    <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-orange-400" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
                  >
                    PlagShield Intelligence Console
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-2 max-w-2xl text-sm text-cyan-100/70 sm:text-base"
                  >
                    {renderHeaderSubtitle()}
                  </motion.p>
                </div>

                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 lg:max-w-xl lg:grid-cols-2">
                  {summaryTiles.map((tile) => (
                    <div key={tile.label} className={`rounded-2xl border bg-gradient-to-br p-4 ${tile.tone}`}>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/65">{tile.label}</p>
                      <p className="mt-2 font-display text-2xl font-bold text-white">{tile.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </header>

            {isMobileNavOpen && (
              <div className="glass-card mb-6 rounded-2xl p-3 lg:hidden">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Navigation</p>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="rounded-md border border-cyan-100/20 px-2 py-1 text-xs text-cyan-100/80"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NavItem icon={<LayoutDashboard />} label="Overview" compact active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsMobileNavOpen(false); }} />
                  <NavItem icon={<History />} label="History" compact active={view === 'history'} onClick={() => { setView('history'); setIsMobileNavOpen(false); }} />
                  <NavItem icon={<Users />} label="Rings" compact active={view === 'rings'} onClick={() => { setView('rings'); setIsMobileNavOpen(false); }} />
                  <NavItem icon={<Network />} label="Graph" compact active={view === 'graph'} onClick={() => { setView('graph'); setIsMobileNavOpen(false); }} />
                  <NavItem icon={<GitCompareArrows />} label="Diff" compact active={view === 'diff'} onClick={() => { setView('diff'); setIsMobileNavOpen(false); }} />
                  <NavItem icon={<Settings />} label="Settings" compact active={view === 'preferences'} onClick={() => { setView('preferences'); setIsMobileNavOpen(false); }} />
                </div>
              </div>
            )}

            <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
              <NavItem icon={<LayoutDashboard />} label="Overview" compact active={view === 'dashboard'} onClick={() => setView('dashboard')} />
              <NavItem icon={<History />} label="History" compact active={view === 'history'} onClick={() => setView('history')} />
              <NavItem icon={<Users />} label="Rings" compact active={view === 'rings'} onClick={() => setView('rings')} />
              <NavItem icon={<Network />} label="Graph" compact active={view === 'graph'} onClick={() => setView('graph')} />
              <NavItem icon={<GitCompareArrows />} label="Diff" compact active={view === 'diff'} onClick={() => setView('diff')} />
              <NavItem icon={<Settings />} label="Settings" compact active={view === 'preferences'} onClick={() => setView('preferences')} />
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-100/20 bg-cyan-950/60 px-3 py-2 text-xs uppercase tracking-[0.1em] text-cyan-100/90 hover:bg-cyan-900/80"
              >
                <Sparkles size={14} /> New Analysis
              </button>
              <button
                onClick={() => {
                  fetchHistory();
                  showToast('History refreshed from backend.', 'success');
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-100/20 bg-cyan-950/60 px-3 py-2 text-xs uppercase tracking-[0.1em] text-cyan-100/90 hover:bg-cyan-900/80"
              >
                <Filter size={14} /> Refresh History
              </button>
            </div>

            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-30 rounded-xl border px-4 py-3 text-sm shadow-2xl ${
              toast.type === 'error'
                ? 'border-rose-100/35 bg-rose-500/30 text-rose-100'
                : toast.type === 'success'
                  ? 'border-emerald-100/30 bg-emerald-500/25 text-emerald-100'
                  : 'border-cyan-100/25 bg-cyan-900/80 text-cyan-100'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavItem = ({ icon, label, active = false, onClick, compact = false }) => (
  <button
    onClick={onClick}
    className={`${compact ? 'shrink-0 rounded-xl px-4 py-2.5 text-sm' : 'w-full rounded-2xl px-5 py-3.5'} flex items-center gap-3 font-semibold transition-all duration-300 ${
      active
        ? 'bg-cyan-500/25 text-white shadow-lg shadow-cyan-900/30'
        : 'text-cyan-100/70 hover:bg-cyan-500/10 hover:text-cyan-50'
    }`}
  >
    <span className={`${active ? 'text-cyan-50' : 'text-cyan-100/70'} transition-colors`}>
      {React.cloneElement(icon, { size: compact ? 18 : 20 })}
    </span>
    {label}
  </button>
);

export default App;

const PreferenceCard = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-cyan-100/15 bg-[#062333]/70 p-5">
    <p className="font-display text-lg text-white">{title}</p>
    <p className="mb-4 text-sm text-cyan-100/65">{subtitle}</p>
    {children}
  </div>
);

const ToggleOption = ({ label, checked, onChange }) => (
  <label className="mb-3 flex items-center justify-between gap-4 rounded-lg border border-cyan-100/15 bg-cyan-950/60 px-3 py-2.5 text-sm text-cyan-100/85">
    <span>{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${checked ? 'bg-cyan-400/70' : 'bg-cyan-950/90'}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </label>
);
