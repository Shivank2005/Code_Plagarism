import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Cpu, Network, FileCode2, SearchCode, GitCompareArrows } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PublicNavbar from '../../components/public/PublicNavbar';
import Contact from './Contact';
import { useAuth } from '../../hooks/AuthContext';

const comparisonData = [
  { name: 'PlagShield', value: 91 },
  { name: 'Traditional Tools', value: 58 },
  { name: 'Manual Review', value: 47 },
];

const LANGUAGE_LOGOS = [
  { name: 'C#', src: '/logo/cHash.png' },
  { name: 'C', src: '/logo/c.png' },
  { name: 'C++', src: '/logo/c++.png' },
  { name: 'Go', src: '/logo/go.png' },
  { name: 'Java', src: '/logo/java.png' },
  { name: 'JavaScript', src: '/logo/javascript.png' },
  { name: 'JSX', src: '/logo/JSX.png' },
  { name: 'Kotlin', src: '/logo/Kotlin.png' },
  { name: 'PHP', src: '/logo/php.png' },
  { name: 'Python', src: '/logo/python.png' },
  { name: 'R', src: '/logo/R.jpg' },
  { name: 'Ruby', src: '/logo/ruby.png' },
  { name: 'Rust', src: '/logo/rust.png' },
  { name: 'Scala', src: '/logo/scala.png' },
  { name: 'Swift', src: '/logo/swift.png' },
  { name: 'TXT', src: '/logo/text.png' },
  { name: 'TypeScript', src: '/logo/typescript.png' },
  { name: 'ZIP', src: '/logo/zip.png' },
];

const GithubLogo = ({ size = 23 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M12 .297a12 12 0 0 0-3.79 23.387c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.73.084-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6.006 0c2.291-1.552 3.297-1.23 3.297-1.23.647 1.653.24 2.873.118 3.176.765.84 1.232 1.91 1.232 3.22 0 4.61-2.805 5.624-5.475 5.921.43.372.823 1.103.823 2.222v3.293c0 .32.217.694.825.576A12 12 0 0 0 12 .297Z" />
  </svg>
);

const GitlabLogo = ({ size = 23 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="#FC6D26" d="m12 21.5 3.55-10.92H8.45L12 21.5Z" />
    <path fill="#E24329" d="M12 21.5 8.45 10.58H3.02L12 21.5Z" />
    <path fill="#FC6D26" d="M12 21.5 20.98 10.58h-5.43L12 21.5Z" />
    <path fill="#FCA326" d="m3.02 10.58 1.8-5.53a.61.61 0 0 1 1.16 0l2.47 7.6H3.62a.62.62 0 0 1-.6-.82Z" />
    <path fill="#FCA326" d="m20.98 10.58-1.8-5.53a.61.61 0 0 0-1.16 0l-2.47 7.6h4.83a.62.62 0 0 0 .6-.82Z" />
    <path fill="#E24329" d="M12 21.5 8.45 10.58h7.1L12 21.5Z" />
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [showAskBox, setShowAskBox] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  const handlePrimaryAction = () => {
    if (token) navigate('/dashboard');
    else navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-white">
      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--danger)] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 z-10 text-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
            
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] backdrop-blur-md">
              <ShieldCheck size={16} />
              <span className="text-sm font-bold uppercase tracking-widest">Enterprise-Grade Code Integrity</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8 drop-shadow-sm">
              Detect Evasion.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--danger)]">
                Protect Originality.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-[var(--text-secondary)] mb-10">
              PlagShield leverages <strong>CodeBERT Machine Learning</strong> and <strong>Abstract Syntax Tree (AST)</strong> structural parsing to detect sophisticated code obfuscation that defeats standard text-based plagiarism checkers.
            </motion.p>
          </div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handlePrimaryAction} className="btn-primary py-4 px-8 text-base shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 transition-all group w-full sm:w-auto flex items-center justify-center gap-2">
                {token ? 'Launch Dashboard' : 'Start Engine Analysis'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          STATS BAND — dark navy strip with headline numbers
      ===================================================== */}
      <section className="bg-[#0A1F44]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <StatCounter value="3" label="Analysis techniques" eyebrow="Combines" dark />
          <StatCounter value="10+" label="Languages supported" eyebrow="Covers" dark />
          <StatCounter value="Multi" label="File & folder uploads" eyebrow="Accepts" dark />
          <StatCounter value="100%" label="Private by default" eyebrow="Stays" dark />
        </div>
      </section>

      {/* =====================================================
          WHY IS PLAGSHIELD BETTER — copy + comparison chart
      ===================================================== */}
      <section id="about" className="bg-[#F8FBFF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">WHY PLAGSHIELD</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Why PlagShield beats a plain text diff
            </h2>
            <p className="mt-4 text-lg leading-7 text-[#64748B]">
              Renamed variables and reordered functions can fool a simple
              string comparison. PlagShield looks deeper.
            </p>
          </motion.div>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
            <motion.div {...fadeUp} className="space-y-5">
              <WhyRow
                icon={Code2}
                title="Industry-grade token analysis"
                text="JPlag-based comparison normalizes source code before matching, so it isn't fooled by renamed identifiers or reformatting."
              />
              <WhyRow
                icon={GitBranch}
                title="Structural comparison"
                text="Looks at control flow and code structure to catch submissions that were logically copied and lightly rewritten."
              />
              <WhyRow
                icon={Brain}
                title="Semantic similarity with CodeBERT"
                text="Flags code that solves the problem the same way, even when the syntax looks different on the surface."
              />
            </motion.div>

            {/* Visual: comparison bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-[#DBEAFE] bg-white p-6 shadow-[0_24px_70px_rgba(37,99,235,0.10)] sm:p-8"
            >
              <p className="text-center text-sm font-bold uppercase tracking-wider text-[#475569]">
                % Similarity Correctly Flagged
              </p>

              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#EEF2F7" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#F8FBFF' }}
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                      contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                      {comparisonData.map((entry) => (
                        <Cell key={entry.name} fill={entry.name === 'PlagShield' ? '#2563EB' : '#CBD5E1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#475569]">
                <LockKeyhole size={15} className="flex-shrink-0 text-[#2563EB]" />
                Multi-method analysis catches far more disguised copying than a plain diff.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= ARCHITECTURE / FEATURES SECTION ================= */}
      <section className="py-24 bg-[var(--bg-secondary)]/50 border-y border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Powered by AI</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">Advanced Detection Architecture</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div whileHover={{ y: -5 }} className="card p-8 border border-[var(--border-default)] hover:border-[var(--accent)]/50 transition-colors bg-[var(--bg-primary)] shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
                <FileCode2 size={24} />
              </div>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3">AST Structural Parsing</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                Transforms raw source code into Abstract Syntax Trees. Identifies identical logic structures even when variable names, comments, and formatting are completely changed.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ y: -5 }} className="card p-8 border border-[var(--border-default)] hover:border-[var(--danger)]/50 transition-colors bg-[var(--bg-primary)] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--danger)]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="h-12 w-12 rounded-2xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mb-6 relative z-10">
                <Cpu size={24} />
              </div>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3 relative z-10">CodeBERT ML Engine</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm relative z-10">
                Utilizes a state-of-the-art transformer model to generate semantic embeddings. Understands the underlying intent of the code to catch cross-language translations and logic rewrites.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ y: -5 }} className="card p-8 border border-[var(--border-default)] hover:border-[var(--warning)]/50 transition-colors bg-[var(--bg-primary)] shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-[var(--warning)]/10 text-[var(--warning)] flex items-center justify-center mb-6">
                <Network size={24} />
              </div>
              <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3">Collusion Graph Intelligence</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                Visualizes complex cheating rings. Identifies "patient zero" source files and maps out entire coordinated academic dishonesty networks automatically.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FLOATING DASHBOARD PREVIEW ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-16">Enterprise Analytics Dashboard</h2>
          
          <div className="relative mx-auto max-w-5xl perspective-[2000px]">
            {/* Glow behind dashboard */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/20 to-transparent blur-3xl -z-10 rounded-full opacity-50"></div>
            
            <motion.div 
              initial={{ rotateX: 20, y: 50, opacity: 0 }}
              whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-2 shadow-2xl"
            >
              <div className="rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] overflow-hidden flex flex-col h-[500px]">
                {/* Fake Browser Top */}
                <div className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <div className="ml-4 h-6 w-64 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-md"></div>
                </div>
                {/* Fake Dashboard Body */}
                <div className="flex-1 p-8 bg-[var(--bg-surface)] flex gap-6">
                  {/* Sidebar mock */}
                  <div className="w-48 hidden md:flex flex-col gap-3">
                    <div className="h-8 w-full rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20"></div>
                    <div className="h-8 w-3/4 rounded-md bg-[var(--bg-secondary)]"></div>
                    <div className="h-8 w-5/6 rounded-md bg-[var(--bg-secondary)]"></div>
                    <div className="h-8 w-4/6 rounded-md bg-[var(--bg-secondary)]"></div>
                  </div>
                  {/* Content mock */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-48 rounded-md bg-[var(--bg-secondary)]"></div>
                      <div className="h-8 w-24 rounded-md bg-[var(--accent)]/20"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm flex flex-col justify-center p-4">
                        <div className="h-3 w-16 bg-[var(--text-tertiary)]/20 rounded mb-3"></div>
                        <div className="h-8 w-20 bg-[var(--text-primary)]/20 rounded"></div>
                      </div>
                      <div className="h-24 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 shadow-sm flex flex-col justify-center p-4">
                        <div className="h-3 w-16 bg-[var(--danger)]/40 rounded mb-3"></div>
                        <div className="h-8 w-20 bg-[var(--danger)]/40 rounded"></div>
                      </div>
                      <div className="h-24 rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/5 shadow-sm flex flex-col justify-center p-4">
                        <div className="h-3 w-16 bg-[var(--warning)]/40 rounded mb-3"></div>
                        <div className="h-8 w-20 bg-[var(--warning)]/40 rounded"></div>
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] flex items-center justify-center shadow-sm relative overflow-hidden">
                       <Network className="text-[var(--accent)]/10 w-64 h-64 absolute" />
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-dashed border-[var(--accent)]/30 rounded-full animate-spin-slow"></div>
                       <div className="w-12 h-12 rounded-full bg-[var(--danger)] z-10 shadow-lg shadow-[var(--danger)]/50 absolute top-[40%] left-[40%]"></div>
                       <div className="w-8 h-8 rounded-full bg-[var(--warning)] z-10 shadow-lg absolute top-[60%] left-[55%]"></div>
                       <div className="w-10 h-10 rounded-full bg-[var(--accent)] z-10 shadow-lg absolute top-[30%] left-[60%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#163A70] bg-[#071A3A]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
                  <ShieldCheck size={17} />
                </div>
                <span className="text-base font-bold text-white">PlagShield</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#9FB6D6]">
                Source-code similarity analysis platform for students,
                educators and institutions.
              </p>
            </div>

            <FooterColumn title="Product" links={[
              { label: 'How It Works', action: handleLearnMore },
              { label: 'Get Started', action: goToApp },
            ]} />
            <FooterColumn title="Company" links={[
              { label: 'About', action: () => navigate('/how-it-works') },
              { label: 'Contact', action: () => navigate('/contact') },
            ]} />
            <FooterColumn title="Resources" links={[
              { label: 'FAQ', action: () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) },
            ]} />
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#244B80] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#9FB6D6]">
              &copy; {new Date().getFullYear()} PlagShield. All rights reserved.
            </p>
            <p className="text-sm text-[#9FB6D6]">
              Source-code similarity analysis platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;