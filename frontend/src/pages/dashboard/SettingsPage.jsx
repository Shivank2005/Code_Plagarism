import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { Settings, Sliders, Layout, Shield, RotateCcw, User } from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
  <button 
    type="button" 
    onClick={onChange} 
    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${
      checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-default)]'
    }`}
  >
    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-1 ring-black/5 transition duration-300 ease-in-out ${
      checked ? 'translate-x-5' : 'translate-x-0'
    }`} />
  </button>
);

export default function SettingsPage() {
  const { preferenceProfile, setPreferenceProfile, preferences, updatePreference, resetPreferences } = usePlagShield();

  const handleProfileChange = (e) => {
    setPreferenceProfile(e.target.value);
  };

  const handleToggle = (key) => {
    updatePreference(key, !preferences[key]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
            <Settings className="text-[var(--accent)]" size={28} /> Control Center
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Fine-tune the PlagShield AI engine and dashboard behaviors.</p>
        </div>
        <button 
          onClick={resetPreferences}
          className="btn-secondary py-2.5 px-5 hover:!text-[var(--danger)] hover:!border-[var(--danger)]/40"
        >
          <RotateCcw size={16} /> Factory Reset
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-default)] shadow-sm overflow-hidden">

        <div className="p-0">
          
          {/* Section 1: Global Profile */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/60">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Global Configuration</h3>
                <p className="text-sm text-[var(--text-secondary)]">Select a pre-tuned threshold profile</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm hover:border-[var(--accent)]/40 transition-all gap-4">
              <div className="flex-1 pr-4">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Active Profile</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Determines the strictness of the plagiarism detection engine globally.</p>
              </div>
              <div className="w-full sm:w-72 shrink-0">
                <select 
                  value={preferenceProfile} 
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg px-4 py-3 text-sm font-semibold text-[var(--text-primary)] focus:bg-[var(--bg-primary)] focus:ring-4 focus:ring-[var(--accent-muted)] focus:border-[var(--accent)] outline-none transition-all cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%234f46e5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem' }}
                >
                  <option value="balanced">Balanced (Default)</option>
                  <option value="strict">Strict - High Sensitivity</option>
                  <option value="lenient">Lenient - Low Sensitivity</option>
                  <option value="custom">Custom Overrides</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Engine Settings */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Detection Engine</h3>
                <p className="text-sm text-[var(--text-secondary)]">Configure core AI analysis behaviors</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm hover:border-[var(--accent)]/40 transition-all cursor-pointer" onClick={() => handleToggle('deepSemanticCheck')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Deep Semantic Inspection</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Utilize CodeBERT embeddings for logic matching. Disabling this runs a purely AST-based check for extreme speed.</p>
                </div>
                <Toggle checked={preferences.deepSemanticCheck} onChange={() => handleToggle('deepSemanticCheck')} />
              </div>
              
              <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm hover:border-[var(--accent)]/40 transition-all cursor-pointer" onClick={() => handleToggle('ignoreBoilerplate')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Ignore Boilerplate & Frameworks</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Automatically exclude standard framework templates, generic getters/setters, and common boilerplate from scoring.</p>
                </div>
                <Toggle checked={preferences.ignoreBoilerplate} onChange={() => handleToggle('ignoreBoilerplate')} />
              </div>
            </div>
          </div>

          {/* Section 3: Interface */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/60">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                <Layout size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Interface & Behavior</h3>
                <p className="text-sm text-[var(--text-secondary)]">Customize dashboard visuals</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm hover:border-[var(--accent)]/40 transition-all cursor-pointer" onClick={() => handleToggle('autoSaveHistory')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Auto-Save History</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Automatically store analysis batches in your local investigation library.</p>
                </div>
                <Toggle checked={preferences.autoSaveHistory} onChange={() => handleToggle('autoSaveHistory')} />
              </div>

              <div className="flex items-center justify-between p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm hover:border-[var(--accent)]/40 transition-all cursor-pointer" onClick={() => handleToggle('animateHeatmap')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Animate Similarity Matrix</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">Show smooth entry transitions when rendering similarity matrices.</p>
                </div>
                <Toggle checked={preferences.animateHeatmap} onChange={() => handleToggle('animateHeatmap')} />
              </div>
            </div>
          </div>

          {/* Section 4: Account & Security */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Account & Security</h3>
                <p className="text-sm text-[var(--text-secondary)]">Manage your personal credentials</p>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Display Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-[var(--border-default)]">
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
