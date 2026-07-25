import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Settings } from 'lucide-react';

const PreferenceCard = ({ title, subtitle, children }) => (
  <div className="card-flat p-5">
    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
    <p className="mb-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>
    {children}
  </div>
);

const ToggleOption = ({ label, checked, onChange }) => (
  <label className="mb-3 flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm cursor-pointer"
    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="h-6 w-11 rounded-full p-0.5 transition-colors"
      style={{ background: checked ? 'var(--accent)' : 'var(--border-default)' }}
    >
      <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </label>
);

const PreferencesView = ({ preferenceProfile, setPreferenceProfile, preferences, updatePreference, onReset }) => {
  return (
    <motion.div
      key="preferences"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="card p-6 sm:p-8"
    >
      <div className="mb-8 flex items-center gap-3">
        <Settings className="shrink-0" size={20} style={{ color: 'var(--text-tertiary)' }} />
        <h3 className="page-title">Settings</h3>
      </div>

      <div className="card-flat mb-5 p-4">
        <p className="section-label mb-2">Preference Profile</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={preferenceProfile}
            onChange={(event) => setPreferenceProfile(event.target.value || 'default')}
            placeholder="Enter profile name"
            className="input-field"
          />
          <span className="badge badge-neutral whitespace-nowrap">
            Active: {preferenceProfile}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PreferenceCard title="Risk Threshold" subtitle="Similarity score to classify high risk pairs.">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>High Risk Threshold</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{preferences.highRiskThreshold}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            value={preferences.highRiskThreshold}
            onChange={(event) => updatePreference('highRiskThreshold', Number(event.target.value))}
            className="w-full"
          />
        </PreferenceCard>

        <PreferenceCard title="Suspicious Threshold" subtitle="Lower bound for suspicious similarity.">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Suspicious Threshold</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{preferences.suspiciousThreshold}%</span>
          </div>
          <input
            type="range"
            min="15"
            max={Math.max(20, preferences.highRiskThreshold - 5)}
            value={preferences.suspiciousThreshold}
            onChange={(event) => updatePreference('suspiciousThreshold', Number(event.target.value))}
            className="w-full"
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
          <button onClick={onReset} className="btn-secondary mt-3">
            <Sparkles size={14} /> Reset Defaults
          </button>
        </PreferenceCard>
      </div>
    </motion.div>
  );
};

export default PreferencesView;