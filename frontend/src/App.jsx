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
  X,
  CheckCircle2,
  AlertCircle,
  Info,
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
    hideToast,
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
        return <EvaluationView activeBatch={activeBatch} evaluateModel={evaluateModel} evaluationResults={evaluationResults} results={results} />;
      case 'diff':
        return <DiffView batchFiles={batchFiles} results={results} semanticResults={semanticResults} selectedSuspiciousPair={selectedSuspiciousPair} />;
      default:
        return (
          <DashboardView
            batchId={activeBatch}
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
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent)] text-white shadow-[0_2px_6px_rgba(37,99,235,0.35)]">
            <div className="absolute inset-0 rounded-[10px] bg-white/15" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)' }} />
            <ShieldCheck size={18} className="relative" strokeWidth={2.25} />
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
            PlagShield
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative w-full flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent-muted)] text-[var(--accent-light)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-[var(--accent)]" />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.25 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
              <UserCircle2 size={18} />
            </div>
            <span className="text-[13px] font-medium text-[var(--text-secondary)] truncate">{username}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── Mobile bottom nav ─── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur border-t border-[var(--border-default)] flex items-center justify-start overflow-x-auto px-2 py-2 gap-1 hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[64px] flex-shrink-0 ${
                isActive
                  ? 'text-[var(--accent-light)] bg-[var(--accent-muted)]'
                  : 'text-[var(--text-tertiary)]'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ─── Main content ─── */}
      <main className="flex-1 lg:ml-[240px] pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-[30] border-b border-[var(--border-subtle)]" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto">
            <div>
              <p className="section-label mb-1">{currentNav.label}</p>
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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed top-24 right-8 z-[9999] flex items-center gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium shadow-[0_16px_40px_rgba(15,23,42,0.10)] min-w-[280px] max-w-[400px] ${
              toast.type === 'error'
                ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                : toast.type === 'success'
                  ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
            }`}
          >
            <div className={`flex items-center justify-center rounded-full p-1 shrink-0 ${
              toast.type === 'error' ? 'bg-[#FEE2E2] text-[#DC2626]' :
              toast.type === 'success' ? 'bg-[#DCFCE7] text-[#16A34A]' :
              'bg-[#E2E8F0] text-[#2563EB]'
            }`}>
              {toast.type === 'error' ? <AlertCircle size={16} strokeWidth={2.5} /> :
               toast.type === 'success' ? <CheckCircle2 size={16} strokeWidth={2.5} /> :
               <Info size={16} strokeWidth={2.5} />}
            </div>
            
            <span className="mr-2 leading-relaxed flex-1">{toast.message}</span>
            
            <button 
              onClick={hideToast} 
              className="shrink-0 rounded-md p-1.5 opacity-50 hover:opacity-100 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X size={14} strokeWidth={3} />
            </button>
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
