import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, SlidersHorizontal, UserCircle, LayoutDashboard, RotateCcw, KeyRound, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/AuthContext';

const ToggleOption = ({ label, checked, onChange, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-[#30363d]/30 last:border-0" onClick={() => onChange(!checked)}>
    <div className="flex flex-col cursor-pointer pr-4">
      <span className="text-sm font-semibold text-[#c9d1d9]">{label}</span>
      {description && <span className="text-xs text-[#8b949e] mt-1">{description}</span>}
    </div>
    <button
      type="button"
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#58a6ff]' : 'bg-[#30363d]'}`}
    >
      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SettingsSection = ({ title, description, icon: Icon, children, footer, message }) => (
  <div className="py-10 flex flex-col lg:flex-row gap-8 lg:gap-16 border-b border-[#30363d]/40 last:border-0">
    <div className="lg:w-1/3 shrink-0">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#e6edf3] flex items-center gap-2 mb-2">
        {Icon && <Icon size={18} className="text-[#8b949e]" />} {title}
      </h3>
      <p className="text-sm text-[#8b949e] leading-relaxed pr-4">
        {description}
      </p>
    </div>
    <div className="lg:w-2/3 w-full max-w-3xl">
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${
          message.type === 'success' ? 'bg-[#238636]/10 text-[#7ee787] border-[#238636]/30' : 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          {message.text}
        </div>
      )}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 space-y-6">
          {children}
        </div>
        {footer && (
          <div className="bg-[#0d1117] border-t border-[#30363d] px-6 py-4 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    </div>
  </div>
);

const PreferencesView = ({ preferenceProfile, setPreferenceProfile, preferences, updatePreference, onReset }) => {
  const { username } = useAuth();
  const [newUsername, setNewUsername] = useState(username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountMessage, setAccountMessage] = useState(null);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  useEffect(() => {
    if (username) setNewUsername(username);
  }, [username]);

  const handleUpdateAccount = async () => {
    setAccountMessage(null);
    if (newPassword && newPassword !== confirmPassword) {
      setAccountMessage({ type: 'error', text: "Passwords do not match." });
      return;
    }
    
    setIsUpdatingAccount(true);
    try {
      const payload = {};
      if (newUsername !== username && newUsername.trim() !== '') payload.username = newUsername.trim();
      if (newPassword.trim() !== '') payload.password = newPassword.trim();

      if (Object.keys(payload).length === 0) {
        setAccountMessage({ type: 'error', text: "No changes provided." });
        setIsUpdatingAccount(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8082';
      const res = await axios.put(`${API_BASE}/api/auth/update`, payload);
      
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        setAccountMessage({ type: 'success', text: "Account updated! Reloading..." });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setAccountMessage({ type: 'error', text: err.response?.data || "Failed to update account." });
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  return (
    <motion.div
      key="preferences"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto pb-24 w-full px-4 sm:px-8 pt-8"
    >
      {/* Header */}
      <div className="pb-8 mb-4 border-b border-[#30363d]/40 relative">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-[#58a6ff]/10 blur-[80px] pointer-events-none"></div>
        <h2 className="font-display text-4xl font-black text-[#e6edf3] mb-4 flex items-center gap-3 tracking-tight">
          <Settings className="text-[#58a6ff]" size={32}/> 
          Application Settings
        </h2>
        <p className="text-[#8b949e] max-w-2xl leading-relaxed text-base">
          Customize your dashboard experience, adjust analysis thresholds, and manage your account credentials.
        </p>
      </div>

      <div className="flex flex-col">
        {/* Account Security */}
        <SettingsSection
          title="Account Security"
          description="Update your username and secure your account with a new password."
          icon={KeyRound}
          message={accountMessage}
          footer={
            <>
              <p className="text-xs text-[#8b949e] flex items-center gap-2">
                <Info size={14} /> You will be required to log in again after changing credentials.
              </p>
              <button
                onClick={handleUpdateAccount}
                disabled={isUpdatingAccount}
                className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all shadow-sm ${
                  isUpdatingAccount 
                    ? 'bg-[#21262d] text-[#8b949e] border border-[#30363d] cursor-not-allowed' 
                    : 'bg-[#e6edf3] text-black hover:bg-white'
                }`}
              >
                {isUpdatingAccount ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e] ml-1">Username</label>
            <div className="relative">
              <UserCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#484f58]" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] pl-11 pr-5 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] transition-all focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e] ml-1">New Password</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#484f58]" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep"
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] pl-11 pr-5 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] transition-all focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e] ml-1">Confirm Password</label>
              <div className="relative">
                <ShieldAlert size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#484f58]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] pl-11 pr-5 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] transition-all focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Preference Profile */}
        <SettingsSection
          title="Preference Profile"
          description="Save your thresholds and layout configurations under a distinct profile name to easily switch between them."
          icon={UserCircle}
          footer={
            <p className="text-xs text-[#8b949e]">
              Your preferences are automatically saved to this profile.
            </p>
          }
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e] ml-1">Profile Name</label>
              <input
                type="text"
                value={preferenceProfile}
                onChange={(event) => setPreferenceProfile(event.target.value)}
                placeholder="e.g. strict-mode"
                className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] px-5 py-3 text-sm text-[#e6edf3] placeholder-[#484f58] transition-all focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
              />
            </div>
            <div className="shrink-0 flex items-end">
              <span className="w-full sm:w-auto justify-center rounded-xl bg-[#58a6ff]/10 px-6 py-3 text-sm font-bold text-[#58a6ff] border border-[#58a6ff]/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse"></span>
                Active: {preferenceProfile || 'default'}
              </span>
            </div>
          </div>
        </SettingsSection>

        {/* Thresholds */}
        <SettingsSection
          title="Analysis Thresholds"
          description="Configure the sensitivity of the plagiarism detection engine. These values dynamically determine how pairs are flagged."
          icon={SlidersHorizontal}
        >
          <div className="space-y-6">
            <div className="group">
              <label className="mb-3 flex items-center justify-between text-sm font-semibold text-[#e6edf3]">
                <span className="flex flex-col">
                  High Risk Threshold
                  <span className="text-xs font-normal text-[#8b949e] mt-1">Scores above this are flagged as confirmed plagiarism.</span>
                </span>
                <span className="rounded-lg bg-[#f85149]/10 px-3 py-1 text-[#f85149] font-bold border border-[#f85149]/20">{preferences.highRiskThreshold}%</span>
              </label>
              <input
                type="range"
                min="60"
                max="95"
                value={preferences.highRiskThreshold}
                onChange={(event) => updatePreference('highRiskThreshold', Number(event.target.value))}
                className="w-full accent-[#f85149] cursor-pointer"
              />
            </div>

            <div className="group pt-4 border-t border-[#30363d]/40">
              <label className="mb-3 flex items-center justify-between text-sm font-semibold text-[#e6edf3]">
                <span className="flex flex-col">
                  Suspicious Threshold
                  <span className="text-xs font-normal text-[#8b949e] mt-1">Lower bound for investigating potential similarities.</span>
                </span>
                <span className="rounded-lg bg-[#d29922]/10 px-3 py-1 text-[#d29922] font-bold border border-[#d29922]/20">{preferences.suspiciousThreshold}%</span>
              </label>
              <input
                type="range"
                min="15"
                max={Math.max(20, preferences.highRiskThreshold - 5)}
                value={preferences.suspiciousThreshold}
                onChange={(event) => updatePreference('suspiciousThreshold', Number(event.target.value))}
                className="w-full accent-[#d29922] cursor-pointer"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Behavior */}
        <SettingsSection
          title="Behavior & Layout"
          description="Customize the look, feel, and automation behavior of your dashboard interface."
          icon={LayoutDashboard}
          footer={
            <div className="w-full flex justify-end">
              <button 
                onClick={onReset} 
                className="flex items-center gap-2 rounded-lg bg-[#21262d] hover:bg-[#f85149]/10 text-[#8b949e] hover:text-[#f85149] px-6 py-2.5 text-sm font-bold transition-all border border-[#30363d] hover:border-[#f85149]/30"
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>
            </div>
          }
        >
          <div className="flex flex-col">
            <ToggleOption
              label="Auto-refresh History"
              description="Automatically fetch new reports when an analysis completes."
              checked={preferences.autoRefreshHistory}
              onChange={(value) => updatePreference('autoRefreshHistory', value)}
            />
            <ToggleOption
              label="Animate Heatmaps"
              description="Show sequential loading animations on matrix cells."
              checked={preferences.animateHeatmap}
              onChange={(value) => updatePreference('animateHeatmap', value)}
            />
            <ToggleOption
              label="Compact Mode"
              description="Reduce padding and spacing to fit more data on screen."
              checked={preferences.compactMode}
              onChange={(value) => updatePreference('compactMode', value)}
            />
          </div>
        </SettingsSection>
      </div>
    </motion.div>
  );
};

export default PreferencesView;