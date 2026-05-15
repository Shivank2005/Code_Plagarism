import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronRight,
  FileUp,
  Filter,
  GitCompareArrows,
  History,
  LayoutDashboard,
  Network,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
} from 'lucide-react';
import { usePlagShieldDashboard } from './hooks/usePlagShieldDashboard';
import DashboardView from './components/views/DashboardView';
import DiffView from './components/views/DiffView';
import GraphView from './components/views/GraphView';
import HistoryView from './components/views/HistoryView';
import PreferencesView from './components/views/PreferencesView';
import RingsView from './components/views/RingsView';

function App() {
  const {
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
    fetchHistory,
    fetchResults,
    handleUploadSuccess,
    handlePairSelection,
    exportHistoryCsv,
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
  } = usePlagShieldDashboard();

  const renderView = () => {
    switch (view) {
      case 'history':
        return (
          <HistoryView
            filteredHistory={filteredHistory}
            onExport={exportHistoryCsv}
            onClear={clearHistory}
            onOpenBatch={(batchId) => {
              fetchResults(batchId);
              setView('dashboard');
            }}
          />
        );
      case 'rings':
        return (
          <RingsView
            results={results}
            normalizedRings={normalizedRings}
            getPairScore={getPairScore}
            riskThreshold={riskThreshold}
            suspiciousThreshold={suspiciousThreshold}
          />
        );
      case 'preferences':
        return (
          <PreferencesView
            preferenceProfile={preferenceProfile}
            setPreferenceProfile={setPreferenceProfile}
            preferences={preferences}
            updatePreference={updatePreference}
            onReset={resetPreferences}
          />
        );
      case 'graph':
        return <GraphView semanticResults={semanticResults} isSemanticLoading={isSemanticLoading} />;
      case 'diff':
        return <DiffView batchFiles={batchFiles} semanticResults={semanticResults} selectedSuspiciousPair={selectedSuspiciousPair} />;
      default:
        return (
          <DashboardView
            batchFiles={batchFiles}
            isAnalyzing={isAnalyzing}
            results={results}
            handleUploadSuccess={handleUploadSuccess}
            highRiskPairs={highRiskPairs}
            suspiciousPairs={suspiciousPairs}
            riskThreshold={riskThreshold}
            suspiciousThreshold={suspiciousThreshold}
            preferences={preferences}
            handlePairSelection={handlePairSelection}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            summaryTiles={summaryTiles}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e5e7eb] selection:bg-[#3b82f6]/30 selection:text-white">
      <div className="border-b border-[#1f2937] bg-[#0f172a]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1f2937] bg-[#111827] text-[#3b82f6]">
              <BarChart3 size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">PlagShield</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#94a3b8]">Code Analysis Platform</p>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            <TopNavItem icon={<FileUp size={16} />} label="Upload" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <TopNavItem icon={<LayoutDashboard size={16} />} label="Reports" active={view === 'graph'} onClick={() => setView('graph')} />
            <TopNavItem icon={<History size={16} />} label="History" active={view === 'history'} onClick={() => setView('history')} />
            <TopNavItem icon={<Settings size={16} />} label="Settings" active={view === 'preferences'} onClick={() => setView('preferences')} />
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="hidden items-center gap-2 rounded-full border border-[#1f2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50 hover:text-white sm:inline-flex"
            >
              <Sparkles size={14} /> New analysis
            </button>
            <button
              onClick={() => {
                fetchHistory();
                showToast('History refreshed from backend.', 'success');
              }}
              className="hidden rounded-full border border-[#1f2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50 hover:text-white md:inline-flex"
            >
              Reports
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1f2937] bg-[#111827] text-[#cbd5e1]">
              <UserCircle2 size={20} />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#1f2937] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">{view === 'dashboard' ? 'Overview' : view}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Plagiarism detection workspace</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#94a3b8]">{renderHeaderSubtitle()}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setView('dashboard')}
              className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50"
            >
              <Sparkles size={14} /> Overview
            </button>
            <button
              onClick={() => {
                fetchHistory();
                showToast('History refreshed from backend.', 'success');
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#111827] px-4 py-2 text-sm font-medium text-[#e5e7eb] transition-colors hover:border-[#3b82f6]/50"
            >
              <Filter size={14} /> Refresh
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

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

const TopNavItem = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-[#111827] text-white' : 'text-[#94a3b8] hover:bg-[#111827] hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
