import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import About from './pages/public/About';
import FAQ from './pages/public/faq';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import { useAuth } from './hooks/AuthContext';
import LoginView from './components/LoginView';
import { PlagShieldProvider } from './hooks/PlagShieldContext';
import AppShell from './components/layout/AppShell';

// Page Shells
import OverviewPage from './pages/dashboard/OverviewPage';
import NewAnalysisPage from './pages/dashboard/NewAnalysisPage';
import AnalysesPage from './pages/dashboard/AnalysesPage';
import ResultsPage from './pages/dashboard/ResultsPage';
import PairsPage from './pages/dashboard/PairsPage';
import ComparePage from './pages/dashboard/ComparePage';
import EvaluationPage from './pages/dashboard/EvaluationPage';
import SettingsPage from './pages/dashboard/SettingsPage';

function LoginRoute() {
  const { token } = useAuth();
  if (token) return <Navigate to="/overview" replace />;
  return <LoginView />;
}

function ProtectedRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;

  return (
    <PlagShieldProvider>
      <AppShell />
    </PlagShieldProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Application Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/analysis/new" element={<NewAnalysisPage />} />
          <Route path="/analyses" element={<AnalysesPage />} />
          <Route path="/analyses/:analysisId/results" element={<ResultsPage />} />
          <Route path="/analyses/:analysisId/pairs" element={<PairsPage />} />
          <Route path="/analyses/:analysisId/compare" element={<ComparePage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
