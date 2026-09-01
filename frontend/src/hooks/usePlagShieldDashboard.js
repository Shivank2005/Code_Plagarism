import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8082';
const CODEBERT_BASE = import.meta.env.VITE_CODEBERT_API || 'http://localhost:8090';
const API_BASE = `${API_BASE_URL}/api`;
const CODEBERT_API = `${CODEBERT_BASE}/api/embeddings`;

const DEFAULT_PREFERENCES = {
  highRiskThreshold: 75,
  suspiciousThreshold: 40,
  autoRefreshHistory: true,
  compactMode: false,
  animateHeatmap: true,
};

export function usePlagShieldDashboard() {
  const { token } = useAuth();
  const [activeBatch, setActiveBatch] = useState('');
  const [evaluationResults, setEvaluationResults] = useState(null);
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

  const toastTimerRef = useRef(null);
  const statusIntervalRef = useRef(null);

  const clearStatusInterval = useCallback(() => {
    if (statusIntervalRef.current) {
      window.clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => hideToast(), 2400);
  }, [hideToast]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/analysis/history`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setPreferencesLoaded(false);

    const loadPreferences = async () => {
      const storageKey = `plagshield.preferences.${preferenceProfile}`;
      try {
        const res = await axios.get(`${API_BASE}/preferences`, { params: { user: preferenceProfile } });
        setPreferences({ ...DEFAULT_PREFERENCES, ...res.data });
      } catch (err) {
          let stored = null;
          try {
            stored = window.localStorage.getItem(storageKey);
          } catch (storageErr) {
            stored = null;
          }
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

  useEffect(() => {
    return () => {
      clearStatusInterval();
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [clearStatusInterval]);

  const fetchSemanticEmbeddings = useCallback(
    async (files) => {
      setIsSemanticLoading(true);
      try {
        const res = await axios.post(`${CODEBERT_API}/similarity-matrix`, {
          submissions: files,
        });
        const normalized = res.data && Array.isArray(res.data.students) && Array.isArray(res.data.matrix)
          ? res.data
          : null;
        setSemanticResults(normalized);
      } catch (err) {
        console.error('Error fetching CodeBERT similarity matrix:', err);
        setSemanticResults(null);
        showToast('CodeBERT service not reachable on port 8090. Graph and diff views are offline.', 'error');
      } finally {
        setIsSemanticLoading(false);
      }
    },
    [showToast],
  );

  const buildLocalResults = useCallback(
    (files, currentPreferences) => {
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
    },
    [],
  );

  const fetchBatchFiles = useCallback(
    async (batchId) => {
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
    },
    [fetchSemanticEmbeddings],
  );

  const fetchResults = useCallback(
  async (batchId) => {
    try {
      // Get the actual analysis results first
      const res = await axios.get(`${API_BASE}/analysis/${batchId}/results`);

      if (
        res.data &&
        Array.isArray(res.data.students) &&
        res.data.students.length > 0
      ) {
        // Show the results immediately
        setResults(res.data);

        // Analysis is genuinely complete
        setIsAnalyzing(false);

        // Show completion message immediately
        showToast('Analysis completed and matrix generated.', 'success');

        // Refresh history
        fetchHistory();

        // Fetch additional file/semantic information in the background.
        // DO NOT block the results screen.
        fetchBatchFiles(batchId).catch((err) => {
          console.error('Background file/semantic loading error:', err);
        });
      } else {
        setResults(null);
        setIsAnalyzing(false);

        showToast(
          'No valid results found in the backend response.',
          'error'
        );
      }
    } catch (err) {
      console.error('Error fetching results:', err);

      setResults(null);
      setIsAnalyzing(false);

      showToast(
        'Failed to fetch analysis results. ' +
          (err.response?.data?.message || err.message),
        'error'
      );

      fetchHistory();
    }
  },
  [fetchBatchFiles, fetchHistory, showToast]
);

  const startAnalysis = useCallback(
  async (batchId) => {
    try {
      await axios.post(`${API_BASE}/analysis/${batchId}/start`);

      clearStatusInterval();

      statusIntervalRef.current = window.setInterval(async () => {
        try {
          const res = await axios.get(
            `${API_BASE}/analysis/${batchId}/status`
          );

          if (res.data.status === 'COMPLETED') {
            clearStatusInterval();

            // Wait for the actual results to be fetched
            // before marking analysis as finished.
            await fetchResults(batchId);

            if (preferences.autoRefreshHistory) {
              fetchHistory();
            }

          } else if (res.data.status === 'FAILED') {
            clearStatusInterval();

            setIsAnalyzing(false);

            showToast(
              'Analysis failed for this batch.',
              'error'
            );
          }

        } catch (err) {
          console.error(
            'Error checking analysis status:',
            err
          );

          clearStatusInterval();
          setIsAnalyzing(false);

          showToast(
            'Unable to check analysis status.',
            'error'
          );
        }
      }, 2000);

    } catch (err) {
      console.error(
        'Error starting analysis:',
        err
      );

      setIsAnalyzing(false);

      showToast(
        'Failed to start analysis.',
        'error'
      );
    }
  },
  [
    clearStatusInterval,
    fetchHistory,
    fetchResults,
    preferences.autoRefreshHistory,
    showToast,
  ],
);

  const handleUploadSuccess = useCallback(
  async (data) => {
    setActiveBatch(data.batchId);

    if (Array.isArray(data.files) && data.files.length > 0) {
      // Show uploaded files immediately
      setBatchFiles(data.files);

      // Start semantic processing in background.
      // DO NOT wait for it before starting the main analysis.
      fetchSemanticEmbeddings(data.files).catch((err) => {
        console.error('Background semantic processing error:', err);
      });
    }

    // Refresh history
    fetchHistory();

    // Start the actual analysis immediately
    setIsAnalyzing(true);
    startAnalysis(data.batchId);
  },
  [
    fetchHistory,
    fetchSemanticEmbeddings,
    startAnalysis,
  ]
);
  const updatePreference = useCallback((key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    showToast(`Preferences reset for profile ${preferenceProfile}.`, 'success');
  }, [preferenceProfile, showToast]);

  const handlePairSelection = useCallback((pair) => {
    setSelectedSuspiciousPair(pair);
    setView('diff');
  }, []);

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

  const getPairScore = useCallback(
    (studentA, studentB) => {
      if (!results) {
        return 0;
      }
      const a = studentsIndex.get(studentA);
      const b = studentsIndex.get(studentB);
      if (a === undefined || b === undefined) {
        return 0;
      }
      return results.matrix[a][b] ?? 0;
    },
    [results, studentsIndex],
  );

  const exportHistoryPdf = useCallback(() => {
    if (filteredHistory.length === 0) {
      showToast('No history rows to export.', 'error');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('PlagShield — Analysis Library', 14, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${filteredHistory.length} batches · generated ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Batch ID', 'Status', 'Created At']],
      body: filteredHistory.map((batch) => [
        batch.id,
        batch.status,
        new Date(batch.createdAt).toLocaleString(),
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      theme: 'striped',
    });

    doc.save(`plagshield-history-${Date.now()}.pdf`);
    showToast('History exported as PDF.', 'success');
  }, [filteredHistory, showToast]);

  const clearHistory = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE}/analysis/history`);
      setHistory([]);
      setResults(null);
      setSemanticResults(null);
      setBatchFiles([]);
      setActiveBatch('');
      setSelectedSuspiciousPair(null);
      showToast('History cleared from backend and dashboard.', 'success');
    } catch (err) {
      showToast('Failed to clear history from backend.', 'error');
    }
  }, [showToast]);

  const riskThreshold = preferences.highRiskThreshold;
  const suspiciousThreshold = preferences.suspiciousThreshold;

  const highRiskPairs = useMemo(() => {
    if (!results) {
      return 0;
    }
    if (!Array.isArray(results.matrix)) {
      return 0;
    }
    return Math.round(results.matrix.flat().filter((score) => score > riskThreshold && score < 100).length / 2);
  }, [results, riskThreshold]);

  const suspiciousPairs = useMemo(() => {
    if (!results) {
      return 0;
    }
    if (!Array.isArray(results.matrix)) {
      return 0;
    }
    return Math.round(
      results.matrix
        .flat()
        .filter((score) => score >= suspiciousThreshold && score <= riskThreshold)
        .length / 2,
    );
  }, [results, riskThreshold, suspiciousThreshold]);

  const summaryTiles = useMemo(
    () => [
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
    ],
    [activeBatch, highRiskPairs, results, suspiciousPairs],
  );

  const renderHeaderSubtitle = useCallback(() => {
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
  }, [view]);

  const evaluateModel = useCallback(async (batchId, threshold, groundTruthList) => {
    try {
      const res = await axios.post(`${API_BASE}/analysis/${batchId}/evaluate`, {
        threshold: threshold,
        groundTruth: groundTruthList
      });
      setEvaluationResults(res.data);
      showToast('Evaluation completed successfully.', 'success');
    } catch (err) {
      console.error('Evaluation error:', err);
      const errMsg = err.response?.data?.error || err.message;
      showToast(`Evaluation failed: ${errMsg}`, 'error');
    }
  }, [showToast]);

  return {
    activeBatch,
    results,
    semanticResults,
    batchFiles,
    history,
    isAnalyzing,
    isSemanticLoading,
    view,
    searchTerm,
    isMobileNavOpen,
    toast,
    preferences,
    preferenceProfile,
    selectedSuspiciousPair,
    setView,
    setSearchTerm,
    setIsMobileNavOpen,
    setPreferenceProfile,
    showToast,
    hideToast,
    fetchHistory,
    fetchResults,
    handleUploadSuccess,
    handlePairSelection,
    exportHistoryPdf,
    clearHistory,
    updatePreference,
    resetPreferences,
    filteredHistory,
    normalizedRings,
    getPairScore,
    riskThreshold,
    suspiciousThreshold,
    highRiskPairs,
    suspiciousPairs,
    summaryTiles,
    renderHeaderSubtitle,
    evaluationResults,
    evaluateModel,
  };
}