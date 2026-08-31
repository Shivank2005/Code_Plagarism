import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import { Settings, Sliders, Layout, Shield, RotateCcw, User } from 'lucide-react';

const Toggle = ({ checked, onChange }) => (
  <button 
    type="button" 
    onClick={onChange} 
    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner ${
      checked ? 'bg-indigo-600' : 'bg-gray-200'
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
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
            <Settings className="text-indigo-600" size={32} /> Control Center
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] font-medium">Fine-tune the PlagShield AI engine and dashboard behaviors.</p>
        </div>
        <button 
          onClick={resetPreferences}
          className="btn-secondary bg-white shadow-sm border border-gray-200 py-2.5 px-5 text-sm font-bold text-gray-700 hover:!text-red-600 hover:!border-red-200 transition-all rounded-xl flex items-center gap-2"
        >
          <RotateCcw size={16} /> Factory Reset
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden relative">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="p-0">
          
          {/* Section 1: Global Profile */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/50">
                <Sliders size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Global Configuration</h3>
                <p className="text-sm text-gray-500 font-medium">Select a pre-tuned threshold profile</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all gap-4">
              <div className="flex-1 pr-4">
                <h4 className="text-sm font-bold text-gray-900">Active Profile</h4>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Determines the strictness of the plagiarism detection engine globally.</p>
              </div>
              <div className="w-full sm:w-72 shrink-0">
                <select 
                  value={preferenceProfile} 
                  onChange={handleProfileChange}
                  className="w-full bg-gray-50 border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-indigo-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
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
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm border border-purple-200/50">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Detection Engine</h3>
                <p className="text-sm text-gray-500 font-medium">Configure core AI analysis behaviors</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => handleToggle('deepSemanticCheck')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-gray-900">Deep Semantic Inspection</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Utilize CodeBERT embeddings for logic matching. Disabling this runs a purely AST-based check for extreme speed.</p>
                </div>
                <Toggle checked={preferences.deepSemanticCheck} onChange={() => handleToggle('deepSemanticCheck')} />
              </div>
              
              <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => handleToggle('ignoreBoilerplate')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-gray-900">Ignore Boilerplate & Frameworks</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Automatically exclude standard framework templates, generic getters/setters, and common boilerplate from scoring.</p>
                </div>
                <Toggle checked={preferences.ignoreBoilerplate} onChange={() => handleToggle('ignoreBoilerplate')} />
              </div>
            </div>
          </div>

          {/* Section 3: Interface */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm border border-pink-200/50">
                <Layout size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Interface & Behavior</h3>
                <p className="text-sm text-gray-500 font-medium">Customize dashboard visuals</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => handleToggle('autoSaveHistory')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-gray-900">Auto-Save History</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Automatically store analysis batches in your local investigation library.</p>
                </div>
                <Toggle checked={preferences.autoSaveHistory} onChange={() => handleToggle('autoSaveHistory')} />
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group" onClick={() => handleToggle('animateHeatmap')}>
                <div className="pr-6">
                  <h4 className="text-sm font-bold text-gray-900">Render Neural Animations</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Show smooth entry transitions and particle effects for similarity matrices.</p>
                </div>
                <Toggle checked={preferences.animateHeatmap} onChange={() => handleToggle('animateHeatmap')} />
              </div>
            </div>
          </div>

          {/* Section 4: Account & Security */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Account & Security</h3>
                <p className="text-sm text-gray-500 font-medium">Manage your personal credentials</p>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
                <button className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-md shadow-blue-500/30 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all text-sm">
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
