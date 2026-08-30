import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { Settings, Sliders, Layout, Shield, Paintbrush, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { preferenceProfile, setPreferenceProfile, preferences, updatePreference, resetPreferences } = usePlagShield();

  const handleProfileChange = (e) => {
    setPreferenceProfile(e.target.value);
  };

  const handleToggle = (key) => {
    updatePreference(key, !preferences[key]);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Settings className="text-[var(--accent)]" size={24} /> System Preferences
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Customize analysis behavior and dashboard layout.</p>
        </div>
        <button 
          onClick={resetPreferences}
          className="btn-secondary py-2 text-sm hover:!text-[var(--danger)] hover:!border-[var(--danger)]/50"
        >
          <RotateCcw size={16} /> Reset Defaults
        </button>
      </div>

      <div className="card p-8">
        <div className="mb-8">
          <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block flex items-center gap-2">
            <Sliders size={16} className="text-[var(--text-tertiary)]" /> Global Configuration Profile
          </label>
          <select 
            value={preferenceProfile} 
            onChange={handleProfileChange}
            className="w-full sm:w-1/2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
          >
            <option value="balanced">Balanced (Default) - Standard academic thresholds</option>
            <option value="strict">Strict - High sensitivity, catches minor similarities</option>
            <option value="lenient">Lenient - Low sensitivity, ignores boilerplate</option>
            <option value="custom">Custom - User defined overrides</option>
          </select>
        </div>

        <div className="space-y-8">
          {/* Analysis Settings */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-default)] pb-2 mb-4 flex items-center gap-2">
              <Shield size={16} /> Detection Engine
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
                <div className="mt-0.5 relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={preferences.deepSemanticCheck} onChange={() => handleToggle('deepSemanticCheck')} />
                  <div className={`w-5 h-5 rounded border ${preferences.deepSemanticCheck ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--text-tertiary)] group-hover:border-[var(--accent)]'}`}></div>
                  {preferences.deepSemanticCheck && <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--text-primary)]">Deep Semantic Inspection</span>
                  <span className="block text-xs text-[var(--text-secondary)] mt-1">Utilize CodeBERT embeddings for logic matching. Disable for faster processing.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
                <div className="mt-0.5 relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={preferences.ignoreBoilerplate} onChange={() => handleToggle('ignoreBoilerplate')} />
                  <div className={`w-5 h-5 rounded border ${preferences.ignoreBoilerplate ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--text-tertiary)] group-hover:border-[var(--accent)]'}`}></div>
                  {preferences.ignoreBoilerplate && <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--text-primary)]">Ignore Boilerplate</span>
                  <span className="block text-xs text-[var(--text-secondary)] mt-1">Automatically exclude standard framework templates and getters/setters.</span>
                </div>
              </label>
            </div>
          </div>

          {/* UI Settings */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-default)] pb-2 mb-4 flex items-center gap-2">
              <Layout size={16} /> Interface & Behavior
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
                <div className="mt-0.5 relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={preferences.autoSaveHistory} onChange={() => handleToggle('autoSaveHistory')} />
                  <div className={`w-5 h-5 rounded border ${preferences.autoSaveHistory ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--text-tertiary)] group-hover:border-[var(--accent)]'}`}></div>
                  {preferences.autoSaveHistory && <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--text-primary)]">Auto-Save History</span>
                  <span className="block text-xs text-[var(--text-secondary)] mt-1">Store analysis batches automatically in the local investigation library.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
                <div className="mt-0.5 relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only" checked={preferences.animateHeatmap} onChange={() => handleToggle('animateHeatmap')} />
                  <div className={`w-5 h-5 rounded border ${preferences.animateHeatmap ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--text-tertiary)] group-hover:border-[var(--accent)]'}`}></div>
                  {preferences.animateHeatmap && <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div>
                  <span className="block text-sm font-bold text-[var(--text-primary)]">Render Animations</span>
                  <span className="block text-xs text-[var(--text-secondary)] mt-1">Show smooth entry transitions for similarity matrices and charts.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
