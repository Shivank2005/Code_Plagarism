import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCircle2, LogOut, LayoutDashboard, FileUp, Library, FileCheck2, Settings, Network, GitCompareArrows, Users, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { usePlagShield } from '../../hooks/PlagShieldContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Page crash caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-8 m-4 border-[var(--danger)]/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-[var(--danger)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
          </div>
          <pre className="text-sm text-[var(--danger)] bg-[var(--bg-secondary)] p-4 rounded-lg overflow-auto max-h-[300px] font-mono">
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/overview'; }}
            className="btn-primary mt-4"
          >
            Return to Overview
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppShell() {
  const { username, logout } = useAuth();
  const { activeBatch } = usePlagShield();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'Main',
      items: [
        { id: '/overview', icon: LayoutDashboard, label: 'Overview' },
        { id: '/analysis/new', icon: FileUp, label: 'New Analysis' },
        { id: '/analyses', icon: Library, label: 'Analysis Library' },
      ],
    },
    {
      label: 'Investigation',
      items: [
        { id: `/analyses/${activeBatch || 'latest'}/results`, icon: Network, label: 'Results Summary', disabled: !activeBatch },
        { id: `/analyses/${activeBatch || 'latest'}/pairs`, icon: Users, label: 'Pair Explorer', disabled: !activeBatch },
        { id: `/analyses/${activeBatch || 'latest'}/compare`, icon: GitCompareArrows, label: 'Code Comparison', disabled: !activeBatch },
      ],
    },
    {
      label: 'System',
      items: [
        { id: '/evaluation', icon: ShieldCheck, label: 'Model Evaluation' },
        { id: '/settings', icon: Settings, label: 'Settings' },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-[var(--border-default)] bg-[var(--bg-secondary)] fixed inset-y-0 left-0 z-40 transition-all duration-300 print:hidden ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors z-50 shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`flex items-center px-6 py-6 border-b border-[var(--border-subtle)] h-[81px] ${isCollapsed ? 'justify-center px-0' : 'gap-3'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <ShieldCheck size={18} />
          </div>
          {!isCollapsed && (
            <span className="text-[16px] font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap overflow-hidden">
              PlagShield
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 space-y-8 overflow-y-auto overflow-x-hidden">
          {navGroups.map((group, idx) => (
            <div key={idx} className="px-4">
              {!isCollapsed ? (
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-2 whitespace-nowrap">
                  {group.label}
                </h4>
              ) : (
                <div className="h-4 mb-3 border-b border-[var(--border-subtle)] w-8 mx-auto"></div>
              )}
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.id.split('/latest')[0]);
                  const Icon = item.icon;
                  if (item.disabled) {
                    return (
                      <div key={item.id} className={`flex items-center rounded-lg text-[13px] font-medium text-[var(--text-tertiary)] opacity-50 cursor-not-allowed ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'}`} title={isCollapsed ? item.label : undefined}>
                        <Icon size={18} className="shrink-0" />
                        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      </div>
                    );
                  }
                  return (
                    <NavLink
                      key={item.id}
                      to={item.id}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive: exactActive }) =>
                        `w-full flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} ${
                          isActive || exactActive
                            ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                        }`
                      }
                    >
                      <Icon size={18} className="shrink-0" />
                      {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--border-subtle)] p-4 space-y-2">
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                <UserCircle2 size={24} className="text-[var(--text-tertiary)] shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{username}</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] truncate">Analyst</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} className="shrink-0" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)]" title={username}>
                <UserCircle2 size={20} className="text-[var(--text-tertiary)]" />
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center justify-center p-2 rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 pb-20 lg:pb-0 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'} print:ml-0 print:pb-0`}>
        <div className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full print:max-w-none print:p-0">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
