import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

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

const PreferencesView = ({ preferenceProfile, setPreferenceProfile, preferences, updatePreference, onReset }) => {
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
            onClick={onReset}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-100/20 bg-cyan-950/70 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-900/80"
          >
            <Sparkles size={14} /> Reset Defaults
          </button>
        </PreferenceCard>
      </div>
    </motion.div>
  );
};

export default PreferencesView;