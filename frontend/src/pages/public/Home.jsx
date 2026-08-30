import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import { useAuth } from '../../hooks/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handlePrimaryAction = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <PublicNavbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 15%, rgba(99,102,241,0.20), transparent 45%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">

          {/* ================= HERO CONTENT ================= */}
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7"
              style={{
                background: 'var(--accent-muted)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: 'var(--accent-light)',
              }}
            >
              <ShieldCheck size={15} />

              Intelligent Source Code Plagiarism Detection
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
            >
              Detect Code Similarity.
              <br />

              <span style={{ color: 'var(--accent-light)' }}>
                Protect Originality.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-7 text-lg md:text-xl max-w-2xl mx-auto leading-8"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              PlagShield analyzes source code from multiple perspectives
              to identify potentially similar submissions and provide
              clear similarity insights.
            </motion.p>

            {/* ================= PRIMARY BUTTON ================= */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mt-9"
            >
              <button
                onClick={handlePrimaryAction}
                className="btn-primary"
                style={{
                  padding: '13px 26px',
                }}
              >
                {token ? 'Start Analysis' : 'Login'}

                <ArrowRight size={17} />
              </button>
            </motion.div>

          </div>

          {/* ================= ANALYSIS OVERVIEW ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
            }}
            className="max-w-5xl mx-auto mt-20"
          >
            <div
              className="rounded-2xl border p-2 shadow-2xl"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-default)',
              }}
            >

              <div
                className="rounded-xl p-6 md:p-8"
                style={{
                  background: 'var(--bg-elevated)',
                }}
              >

                {/* Header */}
                <div className="flex items-center justify-between mb-7">

                  <div>

                    <p
                      className="text-xs uppercase tracking-wider"
                      style={{
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      Analysis Overview
                    </p>

                    <h3 className="text-xl font-bold mt-1">
                      PlagShield Dashboard
                    </h3>

                  </div>

                  <div
                    className="px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: 'rgba(34,197,94,0.10)',
                      color: 'var(--success)',
                    }}
                  >
                    Analysis Ready
                  </div>

                </div>

                {/* Metrics */}
                <div className="grid md:grid-cols-3 gap-4">

                  <PreviewMetric
                    title="Submissions"
                    value="Multiple"
                  />

                  <PreviewMetric
                    title="Similarity"
                    value="0 – 100%"
                  />

                  <PreviewMetric
                    title="Analysis"
                    value="Multi-Approach"
                  />

                </div>

                {/* Progress */}
                <div className="mt-5 h-2 rounded-full overflow-hidden bg-black/20">

                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '78%',
                      background: 'var(--accent)',
                    }}
                  />

                </div>

                {/* Description */}
                <p
                  className="text-xs mt-3"
                  style={{
                    color: 'var(--text-tertiary)',
                  }}
                >
                  Visualize similarity relationships between submissions.
                </p>

              </div>

            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
};


/* ================= PREVIEW METRIC ================= */

const PreviewMetric = ({
  title,
  value,
}) => {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}
    >

      <p
        className="text-xs"
        style={{
          color: 'var(--text-tertiary)',
        }}
      >
        {title}
      </p>

      <p className="text-lg font-semibold mt-2">
        {value}
      </p>

    </div>
  );
};


export default Home;