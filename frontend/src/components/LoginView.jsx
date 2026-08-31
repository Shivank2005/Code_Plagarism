import React, { useState } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, KeyRound, ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[#F8FBFF]">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#2563EB]/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#3B82F6]/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Branding */}
        <div className="mb-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] shadow-[0_8px_16px_rgba(37,99,235,0.25)] mb-6"
          >
            <ShieldCheck size={32} className="text-white" strokeWidth={2.2} />
          </motion.div>
          <h1 className="text-[28px] tracking-tight text-[#0F172A] font-extrabold mb-2">
            Welcome to PlagShield
          </h1>
          <p className="text-[#64748B] text-[15px]">
            {isRegistering
              ? 'Create your account to get started.'
              : 'Sign in to access your dashboard.'}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.06)] relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[14px] text-[#DC2626] font-medium">
                  <Lock size={16} className="flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors">
                  <User size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pr-4 text-[15px] font-medium text-[#0F172A] transition-all hover:bg-white focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 placeholder:text-[#94A3B8] placeholder:font-normal"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors">
                  <KeyRound size={18} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pr-4 text-[15px] font-medium text-[#0F172A] transition-all hover:bg-white focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 placeholder:text-[#94A3B8] placeholder:font-normal"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pb-1">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] ml-1">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors">
                        <KeyRound size={18} strokeWidth={2} />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isRegistering}
                        style={{ paddingLeft: '2.5rem' }}
                        className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pr-4 text-[15px] font-medium text-[#0F172A] transition-all hover:bg-white focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 placeholder:text-[#94A3B8] placeholder:font-normal"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 ${
                isLoading ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <div className="mt-8 text-center">
          <p className="text-[#64748B] text-[14px] mb-2">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setConfirmPassword('');
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8] focus:outline-none"
          >
            {isRegistering ? 'Sign in instead' : 'Create an account'}
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
