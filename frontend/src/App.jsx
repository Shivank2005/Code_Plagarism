import Home from './pages/public/Home';
import PublicNavbar from './components/public/PublicNavbar';
import About from './pages/public/About';
import FAQ from './pages/public/faq';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';



import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileCheck2,
  FileUp,
  GitCompareArrows,
  History,
  LayoutDashboard,
  LogOut,
  Network,
  Settings,
  ShieldCheck,
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
import EvaluationView from './components/views/EvaluationView';
import { useAuth } from './hooks/AuthContext';
import LoginView from './components/LoginView';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'graph', icon: Network, label: 'Reports' },
  { id: 'diff', icon: GitCompareArrows, label: 'Diff Viewer' },
  { id: 'rings', icon: Users, label: 'Rings' },
  { id: 'evaluation', icon: FileCheck2, label: 'Evaluation' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'preferences', icon: Settings, label: 'Settings' },
];

function DashboardApp()  {
  const { token, username, logout } = useAuth();

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
    evaluationResults,
    evaluateModel,
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
      case 'evaluation':
        return <EvaluationView activeBatch={activeBatch} evaluateModel={evaluateModel} evaluationResults={evaluationResults} />;
      case 'diff':
        return <DiffView batchFiles={batchFiles} results={results} semanticResults={semanticResults} selectedSuspiciousPair={selectedSuspiciousPair} />;
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

  
  const currentNav = NAV_ITEMS.find((n) => n.id === view) || NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* ─── Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-[var(--border-default)] bg-[var(--bg-secondary)] fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
            PlagShield
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent-muted)] text-[var(--accent-light)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <UserCircle2 size={20} className="text-[var(--text-tertiary)]" />
            <span className="text-[13px] font-medium text-[var(--text-secondary)] truncate">{username}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-secondary)] border-t border-[var(--border-default)] flex items-center justify-start overflow-x-auto px-2 py-2 gap-2 hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[64px] flex-shrink-0 ${
                isActive
                  ? 'text-[var(--accent-light)]'
                  : 'text-[var(--text-tertiary)]'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ─── Main content ─── */}
      <main className="flex-1 lg:ml-[240px] pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-[30] border-b border-[var(--border-subtle)]" style={{ background: 'rgba(10, 10, 11, 0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto">
            <div>
              <p className="section-label mb-0.5">{currentNav.label}</p>
              <h1 className="page-title">{currentNav.label === 'Dashboard' ? 'Workspace Overview' : currentNav.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchHistory();
                  showToast('Data refreshed.', 'success');
                }}
                className="btn-secondary"
              >
                Refresh
              </button>
              <button
                onClick={() => setView('dashboard')}
                className="btn-primary"
              >
                <FileUp size={16} />
                New Analysis
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-6 py-6 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-[9999] rounded-lg border-2 px-6 py-4 text-sm font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${
              toast.type === 'error'
                ? 'border-red-500 bg-[#450a0a] text-red-200'
                : toast.type === 'success'
                  ? 'border-green-500 bg-[#052e16] text-green-200'
                  : 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginRoute() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginView />;
}

function ProtectedRoute() {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardApp />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Website */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Existing Application */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute />}
        />

        {/* Temporary placeholders */}
        <Route path="/about" element={<About />} />

        <Route path="/how-it-works" element={<HowItWorks />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/faq" element={<FAQ />} />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
