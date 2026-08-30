import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, KeyRound, ChevronRight, ShieldCheck } from 'lucide-react';

const LoginView = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.response?.data || 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Subtle radial gradient accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(79, 70, 229, 0.08), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        {/* Branding */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-xl mb-5"
            style={{
              background: 'var(--accent-muted)',
              border: '1px solid var(--border-default)',
              color: 'var(--accent)',
            }}
          >
            <ShieldCheck size={28} />
          </motion.div>
          <h1 className="page-title text-[28px] mb-2 text-[var(--text-primary)] font-bold">
            PlagShield
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {isRegistering
              ? 'Create your account to get started.'
              : 'Sign in to your account.'}
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mb-5"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg text-sm bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] font-medium">
                  <Lock size={16} className="mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="section-label">Username</label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]"
                >
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-field pl-9"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="section-label">Password</label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]"
                >
                  <KeyRound size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pl-9"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="section-label">Confirm Password</label>
                <div className="relative">
                  <div
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]"
                  >
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={isRegistering}
                    className="input-field pl-9"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full justify-center py-3 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {isLoading ? (
                <div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
              ) : (
                <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-tertiary)] text-[13px]">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setConfirmPassword('');
            }}
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium transition-colors text-[var(--accent)] hover:text-[#4338ca] bg-transparent border-none cursor-pointer"
          >
            {isRegistering ? 'Sign in instead' : 'Create an account'}
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
