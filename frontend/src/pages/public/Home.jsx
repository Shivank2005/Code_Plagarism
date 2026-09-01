import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Code2,
  GitBranch,
  Brain,
  FileSearch,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  LockKeyhole,
  UploadCloud,
  Archive,
  X,
  Network,
  FileText,
  ListChecks,
  Quote,
  Sparkles,
  SearchCode,
  GitCompareArrows,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import PublicNavbar from '../../components/public/PublicNavbar';
import Contact from './Contact';
import { useAuth } from '../../hooks/AuthContext';

const LANGUAGE_LOGOS = [
  { name: 'Java', src: '/logo/java.png' },
  { name: 'Python', src: '/logo/python.png' },
  { name: 'JavaScript', src: '/logo/javascript.png' },
  { name: 'JSX', src: '/logo/JSX.png' },
  { name: 'TypeScript', src: '/logo/typescript.png' },
  { name: 'C++', src: '/logo/c++.png' },
  { name: 'C', src: '/logo/c.png' },
  { name: 'C#', src: '/logo/cHash.png' },
  { name: 'Ruby', src: '/logo/ruby.png' },
  { name: 'PHP', src: '/logo/php.png' },
  { name: 'Kotlin', src: '/logo/Kotlin.png' },
  { name: 'Go', src: '/logo/go.png' },
  { name: 'Rust', src: '/logo/rust.png' },
  { name: 'Swift', src: '/logo/swift.png' },
  { name: 'Scala', src: '/logo/scala.png' },
  { name: 'TXT', src: '/logo/text.png' },
  { name: 'ZIP', src: '/logo/zip.png' },
];

const GithubLogo = ({ size = 24 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M12 .297a12 12 0 0 0-3.79 23.387c.6.111.82-.26.82-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.73.084-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6.006 0c2.291-1.552 3.297-1.23 3.297-1.23.647 1.653.24 2.873.118 3.176.765.84 1.232 1.91 1.232 3.22 0 4.61-2.805 5.624-5.475 5.921.43.372.823 1.103.823 2.222v3.293c0 .32.217.694.825.576A12 12 0 0 0 12 .297Z" />
  </svg>
);

const GitlabLogo = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="#FC6D26" d="m12 21.5 3.55-10.92H8.45L12 21.5Z" />
    <path fill="#E24329" d="M12 21.5 8.45 10.58H3.02L12 21.5Z" />
    <path fill="#FC6D26" d="M12 21.5 20.98 10.58h-5.43L12 21.5Z" />
    <path
      fill="#FCA326"
      d="m3.02 10.58 1.8-5.53a.61.61 0 0 1 1.16 0l2.47 7.6H3.62a.62.62 0 0 1-.6-.82Z"
    />
    <path
      fill="#FCA326"
      d="m20.98 10.58-1.8-5.53a.61.61 0 0 0-1.16 0l-2.47 7.6h4.83a.62.62 0 0 0 .6-.82Z"
    />
    <path fill="#E24329" d="M12 21.5 8.45 10.58h7.1L12 21.5Z" />
  </svg>
);

const comparisonData = [
  { name: 'PlagShield', value: 91 },
  { name: 'Basic Diff Tools', value: 58 },
  { name: 'Manual Review', value: 47 },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [showAskBox, setShowAskBox] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  const goToApp = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLearnMore = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDropZoneInteract = (e) => {
    e.preventDefault();
    setIsDragging(false);
    goToApp();
  };

  const handleAskQuestionClick = () => {
    setShowAskBox((prev) => !prev);
    setQuestionSent(false);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();

    if (!questionText.trim()) {
      return;
    }

    setQuestionSent(true);
    setQuestionText('');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#0F172A]">
      <PublicNavbar />

      {/* ============================================================
          HERO
      ============================================================ */}
      <section
        id="home"
        className="relative overflow-hidden border-b border-[#EEF2F7]"
      >
        {/* Soft blue / purple glow */}
        <div className="pointer-events-none absolute left-[8%] top-[-180px] h-[620px] w-[620px] rounded-full bg-[#DDD6FE]/45 blur-[110px]" />

        {/* Soft pink glow */}
        <div className="pointer-events-none absolute right-[5%] top-[-120px] h-[560px] w-[560px] rounded-full bg-[#FBCFE8]/35 blur-[110px]" />

        {/* Center glow */}
        <div className="pointer-events-none absolute left-1/2 top-[90px] h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#EEF2FF]/70 blur-[100px]" />

        {/* Very subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              'linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            maskImage:
              'linear-gradient(to bottom, black 0%, transparent 75%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, transparent 75%)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#C4B5FD] bg-white/80 px-5 py-2.5 text-xs font-bold tracking-[0.16em] text-[#4F46E5] shadow-sm backdrop-blur-sm sm:text-sm"
            >
              <ShieldCheck size={16} />
              ENTERPRISE-GRADE CODE INTEGRITY
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-8 text-5xl font-bold leading-[1.05] tracking-[-0.035em] text-[#0B1020] sm:text-6xl md:text-7xl"
            >
              Detect Evasion.
              <br />
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#A855A8] to-[#EF4444] bg-clip-text text-transparent">
                Protect Originality.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-7 max-w-3xl text-base leading-7 text-[#475569] sm:text-lg sm:leading-8"
            >
              PlagShield leverages{' '}
              <strong className="font-bold text-[#334155]">
                CodeBERT Machine Learning
              </strong>{' '}
              and{' '}
              <strong className="font-bold text-[#334155]">
                Abstract Syntax Tree (AST)
              </strong>{' '}
              structural parsing to detect sophisticated code obfuscation
              that defeats standard text-based plagiarism checkers.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={goToApp}
                className="group inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_14px_30px_rgba(79,70,229,0.30)]"
              >
                Launch Dashboard
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={handleLearnMore}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/90 px-7 py-3.5 text-sm font-semibold text-[#334155] shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md"
              >
                Explore How It Works
              </button>
            </motion.div>
          </div>

          {/* ============================================================
              ANALYTICS DASHBOARD PREVIEW
          ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.38 }}
            className="mx-auto mt-16 max-w-6xl"
          >
            <div className="relative">
              {/* Glow behind dashboard */}
              <div className="pointer-events-none absolute -inset-8 rounded-[32px] bg-gradient-to-r from-[#6366F1]/10 via-[#A855F7]/10 to-[#F43F5E]/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[22px] border border-[#DDE3EC] bg-[#F8FAFC] shadow-[0_30px_80px_rgba(15,23,42,0.13)]">
                {/* Browser bar */}
                <div className="flex h-12 items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5">
                  <span className="h-3 w-3 rounded-full bg-[#F87171]" />
                  <span className="h-3 w-3 rounded-full bg-[#FBBF24]" />
                  <span className="h-3 w-3 rounded-full bg-[#34D399]" />

                  <div className="ml-5 h-7 w-64 rounded-md border border-[#E2E8F0] bg-white sm:w-80" />

                  <div className="ml-auto hidden h-7 w-24 rounded-md bg-[#EEF2FF] sm:block" />
                </div>

                {/* Dashboard */}
                <div className="grid min-h-[420px] grid-cols-[170px_1fr] bg-[#F1F5F9] sm:grid-cols-[200px_1fr]">
                  {/* Sidebar */}
                  <div className="hidden border-r border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:block">
                    <div className="mb-8 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-white">
                        <ShieldCheck size={17} />
                      </div>
                      <span className="text-sm font-bold text-[#0F172A]">
                        PlagShield
                      </span>
                    </div>

                    <div className="space-y-2">
                      <MiniNav active icon={BarChart3} text="Overview" />
                      <MiniNav icon={FileSearch} text="Analyses" />
                      <MiniNav icon={Network} text="Similarity" />
                      <MiniNav icon={GitCompareArrows} text="Compare" />
                    </div>

                    <div className="mt-10">
                      <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-[#94A3B8]">
                        SYSTEM
                      </p>
                      <MiniNav icon={SearchCode} text="Evaluation" />
                      <MiniNav icon={ShieldCheck} text="Settings" />
                    </div>
                  </div>

                  {/* Main dashboard */}
                  <div className="p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                          ENTERPRISE ANALYTICS
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-[#0F172A] sm:text-xl">
                          Similarity Overview
                        </h3>
                      </div>

                      <div className="hidden rounded-lg border border-[#DCE4F0] bg-white px-3 py-2 text-[10px] font-semibold text-[#64748B] sm:block">
                        Latest Analysis
                      </div>
                    </div>

                    {/* Metric cards */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <PreviewCard
                        title="Files Analyzed"
                        value="128"
                        detail="+18 this week"
                        icon={FileText}
                        iconClass="bg-[#EEF2FF] text-[#4F46E5]"
                      />

                      <PreviewCard
                        title="Avg. Similarity"
                        value="31.8%"
                        detail="Across all submissions"
                        icon={BarChart3}
                        iconClass="bg-[#FFF1F2] text-[#E11D48]"
                      />

                      <PreviewCard
                        title="High-Risk Pairs"
                        value="14"
                        detail="Require review"
                        icon={Network}
                        iconClass="bg-[#FFF7ED] text-[#EA580C]"
                      />
                    </div>

                    {/* Lower analytics area */}
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                      {/* Similarity graph */}
                      <div className="relative min-h-[245px] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">
                              Similarity Network
                            </p>
                            <p className="mt-1 text-[10px] text-[#94A3B8]">
                              Submission relationship analysis
                            </p>
                          </div>

                          <div className="rounded-md bg-[#F8FAFC] px-2 py-1 text-[9px] font-semibold text-[#64748B]">
                            128 nodes
                          </div>
                        </div>

                        <div className="relative mt-3 h-[175px] overflow-hidden rounded-lg bg-[#FCFDFF]">
                          <svg
                            className="absolute inset-0 h-full w-full"
                            viewBox="0 0 760 230"
                            preserveAspectRatio="xMidYMid meet"
                            role="img"
                            aria-label="Similarity network showing relationships between code submissions"
                          >
                            <g fill="none" strokeLinecap="round">
                              <line x1="390" y1="38" x2="535" y2="72" stroke="#DC2626" strokeWidth="5" />
                              <line x1="390" y1="38" x2="390" y2="188" stroke="#DC2626" strokeWidth="4" />
                              <line x1="535" y1="72" x2="535" y2="158" stroke="#DC2626" strokeWidth="4" />
                              <line x1="225" y1="100" x2="285" y2="50" stroke="#DC2626" strokeWidth="4" />

                              <line x1="390" y1="38" x2="620" y2="118" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="535" y1="72" x2="620" y2="118" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="620" y1="118" x2="535" y2="158" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="535" y1="158" x2="390" y2="188" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="620" y1="118" x2="390" y2="188" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="225" y1="100" x2="175" y2="172" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="225" y1="100" x2="390" y2="188" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="175" y1="172" x2="390" y2="188" stroke="#F59E0B" strokeWidth="2.5" />
                              <line x1="285" y1="50" x2="390" y2="188" stroke="#F59E0B" strokeWidth="2.5" />

                              <line x1="390" y1="38" x2="225" y2="100" stroke="#6D28D9" strokeWidth="2" />
                              <line x1="225" y1="100" x2="175" y2="172" stroke="#6D28D9" strokeWidth="2" />
                              <line x1="535" y1="72" x2="390" y2="188" stroke="#6D28D9" strokeWidth="2" />
                            </g>

                            <circle
                              cx="390"
                              cy="113"
                              r="47"
                              fill="none"
                              stroke="#C4B5FD"
                              strokeWidth="1.5"
                              strokeDasharray="5 5"
                            />

                            <g stroke="#FFFFFF" strokeWidth="2">
                              <circle cx="390" cy="38" r="16" fill="#EF1D25" />
                              <circle cx="535" cy="72" r="14" fill="#EF1D25" />
                              <circle cx="620" cy="118" r="13" fill="#F59E0B" />
                              <circle cx="535" cy="158" r="14" fill="#EF1D25" />
                              <circle cx="390" cy="188" r="16" fill="#EF1D25" />
                              <circle cx="175" cy="172" r="12" fill="#EF1D25" />
                              <circle cx="225" cy="100" r="14" fill="#EF1D25" />
                              <circle cx="285" cy="50" r="13" fill="#EF1D25" />
                            </g>

                            <g
                              fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                              fontWeight="700"
                              fill="#111827"
                            >
                              <text x="390" y="18" textAnchor="middle" fontSize="10">01_Base_Djk</text>
                              <text x="551" y="66" fontSize="9">02_Dijkstra_</text>
                              <text x="635" y="121" fontSize="9">03_Dijkstra_</text>
                              <text x="551" y="174" fontSize="9">05_AStar_Sea</text>
                              <text x="390" y="215" textAnchor="middle" fontSize="9">07_Prim_MST</text>
                              <text x="162" y="190" textAnchor="end" fontSize="9">11_UserCont</text>
                              <text x="210" y="91" textAnchor="end" fontSize="9">12_ProductCo</text>
                              <text x="285" y="31" textAnchor="middle" fontSize="9">13_OrderCont</text>
                            </g>

                            <g transform="translate(520 210)" fontFamily="Inter, ui-sans-serif, system-ui, sans-serif">
                              <line x1="0" y1="0" x2="13" y2="0" stroke="#DC2626" strokeWidth="3" />
                              <text x="18" y="3" fontSize="7" fill="#64748B">High</text>
                              <line x1="50" y1="0" x2="63" y2="0" stroke="#F59E0B" strokeWidth="2" />
                              <text x="68" y="3" fontSize="7" fill="#64748B">Medium</text>
                              <line x1="115" y1="0" x2="128" y2="0" stroke="#6D28D9" strokeWidth="2" />
                              <text x="133" y="3" fontSize="7" fill="#64748B">Low</text>
                            </g>
                          </svg>
                        </div>
                      </div>

                      {/* Risk distribution */}
                      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">
                              Risk Distribution
                            </p>
                            <p className="mt-1 text-[10px] text-[#94A3B8]">
                              Detected similarity levels
                            </p>
                          </div>

                          <BarChart3 size={17} className="text-[#94A3B8]" />
                        </div>

                        <div className="mt-7 space-y-5">
                          <RiskBar
                            label="Low"
                            value="52%"
                            width="52%"
                            tone="green"
                          />
                          <RiskBar
                            label="Medium"
                            value="29%"
                            width="29%"
                            tone="amber"
                          />
                          <RiskBar
                            label="High"
                            value="19%"
                            width="19%"
                            tone="red"
                          />
                        </div>

                        <div className="mt-7 rounded-lg bg-[#F8FAFC] p-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={15} className="text-[#4F46E5]" />
                            <span className="text-[10px] font-bold text-[#334155]">
                              Multi-method detection active
                            </span>
                          </div>
                          <p className="mt-1 text-[9px] leading-4 text-[#94A3B8]">
                            Token, structural and semantic signals combined.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          STATS
      ============================================================ */}
      <section className="bg-[#0A1F44]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <StatCounter
            value="3"
            label="Analysis techniques"
            eyebrow="Combines"
            dark
          />
          <StatCounter
            value="10+"
            label="Languages supported"
            eyebrow="Covers"
            dark
          />
          <StatCounter
            value="Multi"
            label="File & folder uploads"
            eyebrow="Accepts"
            dark
          />
          <StatCounter
            value="100%"
            label="Private by default"
            eyebrow="Stays"
            dark
          />
        </div>
      </section>

      {/* ============================================================
          WHY PLAGSHIELD
      ============================================================ */}
      <section id="about" className="scroll-mt-20 bg-[#F8FBFF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
              WHY PLAGSHIELD
            </p>

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
                  <BarChart
                    data={comparisonData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#EEF2F7"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: '#475569',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                      axisLine={{
                        stroke: '#E2E8F0',
                      }}
                      tickLine={false}
                    />

                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{
                        fill: '#94A3B8',
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{
                        fill: '#F8FBFF',
                      }}
                      formatter={(value) => [
                        `${value}%`,
                        'Accuracy',
                      ]}
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        fontSize: 13,
                      }}
                    />

                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={64}
                    >
                      {comparisonData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            entry.name === 'PlagShield'
                              ? '#2563EB'
                              : '#CBD5E1'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#475569]">
                <LockKeyhole
                  size={15}
                  className="flex-shrink-0 text-[#2563EB]"
                />
                Multi-method analysis catches far more disguised copying than
                a plain diff.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRY IT CTA
      ============================================================ */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Try PlagShield's Code Similarity Checker
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
              Sign in, upload a set of submissions, and get a full similarity
              breakdown with top matching sources.
            </p>

            <button
              type="button"
              onClick={goToApp}
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-lg"
            >
              Get Started
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
      ============================================================ */}
      <section
        id="how-it-works"
        className="border-y border-[#E2E8F0] bg-white scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Review submissions with{' '}
              <span className="text-[#2563EB]">
                intelligent analysis
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-7 text-[#64748B]">
              Move from upload to actionable similarity insights in a few
              simple steps.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StepCard
              step="1"
              color="blue"
              icon={UploadCloud}
              title="Sign in & upload"
              text="Submit source-code files or an entire project folder from your dashboard."
            />

            <StepCard
              step="2"
              color="violet"
              icon={FileSearch}
              title="Analyze submissions"
              text="Multiple analysis methods examine token, structural and semantic similarity."
            />

            <StepCard
              step="3"
              color="amber"
              icon={GitBranch}
              title="Inspect matches"
              text="Use the diff viewer, heatmap and similarity graph to investigate results."
            />

            <StepCard
              step="4"
              color="green"
              icon={ListChecks}
              title="Take action"
              text="Review suspicious pairs and export a report for academic records."
            />
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={goToApp}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow-lg"
            >
              Start an Analysis
              <ArrowRight size={17} />
            </button>

            <p className="text-sm text-[#64748B]">
              Web-based analysis with support for multiple files and zipped
              projects
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPARISON
      ============================================================ */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
              BUILT FOR CODE
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Maintain academic integrity with confidence
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mt-10 overflow-hidden rounded-2xl border border-[#E2E8F0] shadow-sm"
          >
            <ComparisonRow
              icon={BarChart3}
              label="Analyzes"
              value="Similarity across token, structural & semantic layers"
            />

            <ComparisonRow
              icon={FileText}
              label="Provides"
              value="Detailed reports with overall similarity scores"
            />

            <ComparisonRow
              icon={ShieldCheck}
              label="Accuracy"
              value="Multi-method analysis reduces false positives"
            />

            <ComparisonRow
              icon={UploadCloud}
              label="Uploads"
              value="Multiple files or a full project folder per scan"
              last
            />
          </motion.div>
        </div>
      </section>

      {/* ============================================================
    FLEXIBLE SUBMISSIONS
============================================================ */}
      <section className="border-t border-[#E2E8F0] bg-[#EEF4FF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-[#2563EB]">
              FLEXIBLE SUBMISSIONS
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              Works with how you already
              <br className="hidden sm:block" />
              submit code
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#52709D] sm:text-lg">
              Bring individual source files, complete ZIP projects, or repository code
              into PlagShield without changing your workflow.
            </p>
          </motion.div>

          {/* Submission methods */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <IntegrationCard
              icon={UploadCloud}
              title="File Upload"
              text="Upload individual source-code files directly from your computer."
              accent="blue"
            />

            <IntegrationCard
              icon={Archive}
              title="ZIP Projects"
              text="Submit a complete project as a ZIP archive for batch analysis."
              accent="violet"
            />

            <IntegrationCard
              icon={GithubLogo}
              title="GitHub"
              text="Bring repository-based source code into your review workflow."
              accent="github"
            />

            <IntegrationCard
              icon={GitlabLogo}
              title="GitLab"
              text="Keep repository submissions organized and ready for analysis."
              accent="gitlab"
            />

          </div>

          {/* Supported languages */}
          <motion.div
            {...fadeUp}
            className="mt-10 overflow-hidden rounded-2xl border border-[#CFE0FA] bg-white shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:px-6">

              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Code2 size={18} />
              </div>

              <div className="text-left">
                <p className="text-sm font-bold tracking-[0.16em] text-[#2563EB]">
                  SUPPORTED LANGUAGES & FORMATS
                </p>

                <p className="mt-0.5 text-sm text-[#52709D]">
                  One workspace for your source files and project archives.
                </p>
              </div>

            </div>

            {/* Continuous Language Marquee */}
            <div className="language-marquee">
              <div className="language-marquee-track">
                {[...LANGUAGE_LOGOS, ...LANGUAGE_LOGOS].map(
                  (language, index) => (
                    <div
                      key={`${language.name}-${index}`}
                      className="language-logo"
                      title={language.name}
                    >
                      <img
                        src={language.src}
                        alt={language.name}
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <style>{`
  .language-marquee {
    width: 100%;
    overflow: hidden;
    padding: 24px 0;
  }

  .language-marquee-track {
    display: flex;
    align-items: center;
    width: max-content;
    gap: 42px;
    animation: language-marquee-scroll 55s linear infinite;
    will-change: transform;
  }

  .language-marquee:hover .language-marquee-track {
    animation-play-state: paused;
  }

  .language-logo {
    width: 62px;
    height: 55px;
    flex: 0 0 62px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .language-logo img {
    max-width: 52px;
    max-height: 48px;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .language-logo:hover {
    transform: scale(1.08);
  }

  @keyframes language-marquee-scroll {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .language-marquee-track {
      animation: none;
    }
  }
`}</style>
          </motion.div>

          {/* Security message */}
          <motion.div
            {...fadeUp}
            className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-[#CFE0FA] bg-white px-5 py-4 text-center shadow-sm"
          >
            <ShieldCheck
              size={17}
              className="flex-shrink-0 text-[#2563EB]"
            />

            <p className="text-sm font-medium text-[#1E467A] sm:text-base">
              All analysis starts securely from your PlagShield workspace after sign in.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ============================================================
          WHO IT'S FOR
      ============================================================ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
              BUILT FOR EVERYONE
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Who Does{' '}
              <span className="text-[#2563EB]">
                PlagShield
              </span>{' '}
              Help?
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <AudiencePhotoCard
              photo="/images/audience/student.jpg"
              title="Students"
              text="Check your own submission before you turn it in and understand where it overlaps with other work."
              items={[
                'Assignments',
                'Lab Exercises',
                'Capstone Projects',
              ]}
            />

            <AudiencePhotoCard
              photo="/images/audience/educator.avif"
              title="Educators"
              text="Screen a whole cohort's submissions in one batch and focus your review time on what matters."
              items={[
                'Class Assignments',
                'Coding Exams',
                'Group Projects',
              ]}
            />

            <AudiencePhotoCard
              photo="/images/audience/institution.avif"
              title="Institutions"
              text="Support consistent, structured integrity checks across departments and cohorts at scale."
              items={[
                'Course-wide Audits',
                'Plagiarism Records',
                'Bulk Reports',
              ]}
            />
          </div>

          <motion.div
            {...fadeUp}
            className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6"
          >
            <p className="text-sm font-bold tracking-[0.18em] text-[#94A3B8]">
              PLAGSHIELD IS NOT FOR
            </p>

            <div className="mt-3 space-y-2">
              <NotForItem text="Checking natural-language text or essays for plagiarism" />
              <NotForItem text="Masking or disguising copied code to avoid detection" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          MORE THAN A SCORE
      ============================================================ */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FBFF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
              ANALYSIS TOOLKIT
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              PlagShield Offers{' '}
              <span className="text-[#2563EB]">
                More Than a Similarity Score
              </span>
            </h2>

            <p className="mt-4 text-lg leading-7 text-[#64748B]">
              Investigate why submissions are similar instead of relying on a
              single number.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard
              color="rose"
              icon={Network}
              title="Similarity Graph"
              text="Visualize clusters of related submissions at a glance."
              onClick={goToApp}
            />

            <ToolCard
              color="violet"
              icon={GitBranch}
              title="Diff Viewer"
              text="Line-by-line, side-by-side comparison of any two files."
              onClick={goToApp}
            />

            <ToolCard
              color="green"
              icon={BarChart3}
              title="Similarity Heatmap"
              text="Spot hotspots of overlap across an entire batch at once."
              onClick={goToApp}
            />

            <ToolCard
              color="blue"
              icon={ListChecks}
              title="Suspicious Pairs"
              text="A ranked list of submission pairs that need a closer look."
              onClick={goToApp}
            />

            <ToolCard
              color="amber"
              icon={FileText}
              title="PDF Reports"
              text="Export a shareable report for records or academic review."
              onClick={goToApp}
            />

            <ToolCard
              color="teal"
              icon={Code2}
              title="Multi-Language Support"
              text="Analyze submissions across common programming languages."
              onClick={goToApp}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTACT
      ============================================================ */}
      <section
        id="contact"
        className="border-t border-[#E2E8F0] bg-[#F8FBFF] scroll-mt-20"
      >
        <div className="mx-auto max-w-2xl px-5 pt-20 text-center sm:px-6 md:pt-24 lg:px-8">
          <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
            CONTACT & FEEDBACK
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
            Have questions about PlagShield?
          </h2>

          <p className="mt-4 text-lg leading-8 text-[#64748B] sm:text-xl">
            Reach out to the team, report a bug, or share your feedback.
          </p>
        </div>

        <Contact embedded />
      </section>

      {/* ============================================================
          FAQ
      ============================================================ */}
      <section
        id="faq"
        className="scroll-mt-20 bg-white"
      >
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              Frequently asked questions
            </h2>

            <p className="mt-4 text-lg text-[#64748B] sm:text-xl">
              A few things you may want to know about PlagShield.
            </p>
          </motion.div>

          <div className="mt-10 space-y-3">
            <FaqItem
              question="What is PlagShield?"
              answer="PlagShield is a source-code similarity analysis platform that uses token-based, structural and semantic analysis techniques."
            />

            <FaqItem
              question="Where do I upload my source code?"
              answer="Source-code uploads and analysis are available after signing in through the PlagShield dashboard."
            />

            <FaqItem
              question="Which analysis approaches does PlagShield use?"
              answer="PlagShield combines token-based analysis using JPlag, structural analysis and semantic analysis using CodeBERT."
            />

            <FaqItem
              question="Does PlagShield only catch identical code?"
              answer="No. The platform also looks at structural and semantic similarity, so renamed variables or restructured logic can still be flagged."
            />

            <FaqItem
              question="Is my code kept private?"
              answer="Yes. Uploaded submissions are tied to your account and are not used to train any external models."
            />
          </div>

          {/* Ask a question */}
          <motion.div
            {...fadeUp}
            className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#DBEAFE] bg-[#F8FBFF] p-6 text-center sm:p-8"
          >
            <p className="text-lg font-bold text-[#0F172A] sm:text-xl">
              Still have a question?
            </p>

            <p className="mt-2 text-base leading-7 text-[#64748B] sm:text-lg">
              Didn't find what you were looking for? Ask us directly.
            </p>

            <button
              type="button"
              onClick={handleAskQuestionClick}
              className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md"
            >
              {showAskBox ? 'Close' : 'Ask a Question'}

              <ArrowRight
                size={16}
                className={`transition-transform duration-200 ${showAskBox
                  ? 'rotate-90'
                  : 'group-hover:translate-x-0.5'
                  }`}
              />
            </button>

            {showAskBox && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                onSubmit={handleQuestionSubmit}
                className="mx-auto mt-6 max-w-xl text-left"
              >
                <label
                  htmlFor="faq-question"
                  className="text-sm font-semibold text-[#0F172A]"
                >
                  Type your question
                </label>

                <textarea
                  id="faq-question"
                  value={questionText}
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                    setQuestionSent(false);
                  }}
                  rows={4}
                  placeholder="e.g. Does PlagShield support Python and Java in the same scan?"
                  className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-base text-[#0F172A] shadow-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                />

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8]"
                  >
                    Submit Question
                  </button>

                  {questionSent && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#16A34A]">
                      <CheckCircle2 size={16} />
                      Thanks! We'll get back to you soon.
                    </span>
                  )}
                </div>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
      ============================================================ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-2xl border border-[#C7D2FE] bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] px-6 py-12 text-center shadow-sm sm:px-10 md:py-14"
          >
            <div className="pointer-events-none absolute left-1/2 top-[-150px] h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-white opacity-80 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-sm">
                <ShieldCheck size={24} />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Ready to analyze your code?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
                Start scanning submissions with PlagShield's multi-method
                similarity analysis.
              </p>

              <button
                type="button"
                onClick={goToApp}
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-md"
              >
                Start Analysis
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="border-t border-[#1E4770] bg-[#0B2A4A]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            {/* BRAND */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white">
                  <ShieldCheck size={18} />
                </div>

                <span className="text-lg font-bold text-white">
                  PlagShield
                </span>
              </div>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[#B8C9DC]">
                Source-code similarity analysis platform for students,
                educators and institutions.
              </p>
            </div>

            {/* PRODUCT */}
            <FooterColumn
              title="Product"
              links={[
                {
                  label: 'How It Works',
                  action: handleLearnMore,
                },
                {
                  label: 'Get Started',
                  action: goToApp,
                },
              ]}
            />

            {/* COMPANY */}
            <FooterColumn
              title="Company"
              links={[
                {
                  label: 'About',
                  action: () =>
                    document
                      .getElementById('about')
                      ?.scrollIntoView({ behavior: 'smooth' }),
                },
                {
                  label: 'Contact',
                  action: () =>
                    document
                      .getElementById('contact')
                      ?.scrollIntoView({ behavior: 'smooth' }),
                },
              ]}
            />

            {/* RESOURCES */}
            <FooterColumn
              title="Resources"
              links={[
                {
                  label: 'FAQ',
                  action: () =>
                    document
                      .getElementById('faq')
                      ?.scrollIntoView({ behavior: 'smooth' }),
                },
              ]}
            />

          </div>

          {/* BOTTOM BAR */}
          <div className="mt-10 flex flex-col gap-3 border-t border-[#1E4770] pt-6 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-[#9FB5CC]">
              &copy; {new Date().getFullYear()} PlagShield. All rights reserved.
            </p>

            <p className="text-sm text-[#9FB5CC]">
              Source-code similarity analysis platform.
            </p>

          </div>

        </div>
      </footer>
    </div>
  );
};
/* ================================================================
   COMPONENTS
================================================================ */

const StatCounter = ({ value, label, eyebrow, dark }) => (
  <div className="text-center">
    {eyebrow && (
      <p
        className={`text-sm font-semibold ${dark ? 'text-[#60A5FA]' : 'text-[#2563EB]'
          }`}
      >
        {eyebrow}
      </p>
    )}

    <p
      className={`mt-1 text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-[#0F172A]'
        }`}
    >
      {value}
    </p>

    <p
      className={`mt-1 text-sm ${dark ? 'text-[#CBD5E1]' : 'text-[#64748B]'
        }`}
    >
      {label}
    </p>
  </div>
);

const WhyRow = ({ icon: Icon, title, text }) => (
  <div className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md">
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
      <Icon size={20} />
    </div>

    <div>
      <p className="text-base font-bold text-[#0F172A]">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-[#64748B]">
        {text}
      </p>
    </div>
  </div>
);

const STEP_COLORS = {
  blue: {
    bg: '#EFF6FF',
    text: '#2563EB',
  },
  violet: {
    bg: '#F1EEFF',
    text: '#7C3AED',
  },
  amber: {
    bg: '#FFF7E6',
    text: '#D97706',
  },
  green: {
    bg: '#EFFDF4',
    text: '#16A34A',
  },
};

const StepCard = ({
  step,
  color,
  icon: Icon,
  title,
  text,
}) => {
  const palette =
    STEP_COLORS[color] || STEP_COLORS.blue;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: palette.bg,
            color: palette.text,
          }}
        >
          <Icon size={22} />
        </div>

        <span className="text-sm font-semibold text-[#94A3B8]">
          Step {step}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#64748B]">
        {text}
      </p>
    </motion.div>
  );
};

const ComparisonRow = ({
  icon: Icon,
  label,
  value,
  last,
}) => (
  <div
    className={`flex items-center gap-4 bg-white px-5 py-4 sm:px-7 ${!last ? 'border-b border-[#E2E8F0]' : ''
      }`}
  >
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
      <Icon size={17} />
    </div>

    <p className="w-28 flex-shrink-0 text-sm font-bold text-[#0F172A] sm:w-36 sm:text-base">
      {label}
    </p>

    <p className="text-sm text-[#64748B] sm:text-base">
      {value}
    </p>
  </div>
);

const IntegrationBadge = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-base font-semibold text-[#0F172A] shadow-sm">
    <Icon size={20} />
    {label}
  </div>
);

const IntegrationCard = ({
  icon: Icon,
  title,
  text,
  accent = 'blue',
}) => {
  const accents = {
    blue: {
      bg: '#EFF6FF',
      text: '#2563EB',
      border: '#DBEAFE',
    },

    violet: {
      bg: '#F5F3FF',
      text: '#7C3AED',
      border: '#EDE9FE',
    },

    github: {
      bg: '#F8FAFC',
      text: '#111827',
      border: '#E2E8F0',
    },

    gitlab: {
      bg: '#FFF7ED',
      text: '#EA580C',
      border: '#FFEDD5',
    },
  };

  const palette = accents[accent] || accents.blue;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-[#DCE6F2] bg-white p-6 text-left shadow-[0_6px_20px_rgba(15,23,42,0.05)] transition-all duration-200 hover:border-[#BFD7FF] hover:shadow-[0_16px_36px_rgba(37,99,235,0.10)]"
    >

      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
          borderColor: palette.border,
        }}
      >
        <Icon size={23} strokeWidth={2} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#64748B]">
        {text}
      </p>

    </motion.div>
  );
};

const AudiencePhotoCard = ({
  photo,
  title,
  text,
  items,
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:border-[#BFDBFE] hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)]"
  >
    <div className="h-56 w-full overflow-hidden bg-[#F1F5F9]">
      <img
        src={photo}
        alt={title}
        className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
      />
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-2 text-base leading-6 text-[#64748B]">
        {text}
      </p>

      {items && (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-3 py-1 text-sm font-medium text-[#475569]"
            >
              <CheckCircle2
                size={12}
                className="text-[#2563EB]"
              />
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

const NotForItem = ({ text }) => (
  <div className="flex items-center gap-2 text-base text-[#64748B]">
    <X
      size={15}
      className="flex-shrink-0 text-[#DC2626]"
    />
    {text}
  </div>
);

const ToolCard = ({
  icon: Icon,
  title,
  text,
  onClick,
  color,
}) => {
  const TOOL_COLORS = {
    rose: {
      bg: '#FDECEE',
      text: '#E11D48',
    },
    violet: {
      bg: '#F1EEFF',
      text: '#7C3AED',
    },
    green: {
      bg: '#EFFDF4',
      text: '#16A34A',
    },
    blue: {
      bg: '#EFF6FF',
      text: '#2563EB',
    },
    amber: {
      bg: '#FFF7E6',
      text: '#D97706',
    },
    teal: {
      bg: '#E9FBF8',
      text: '#0D9488',
    },
  };

  const palette =
    TOOL_COLORS[color] || TOOL_COLORS.blue;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[#E2E8F0] bg-white p-6 text-left shadow-sm transition-shadow duration-200 hover:border-[#BFDBFE] hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)]"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: palette.bg,
          color: palette.text,
        }}
      >
        <Icon size={20} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-2 text-base leading-6 text-[#64748B]">
        {text}
      </p>
    </motion.button>
  );
};

const FaqItem = ({
  question,
  answer,
}) => (
  <details className="group rounded-xl border border-[#E2E8F0] bg-white transition-colors duration-200 hover:border-[#BFDBFE]">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
      <span>{question}</span>

      <ChevronDown
        size={18}
        className="flex-shrink-0 text-[#64748B] transition-transform duration-200 group-open:rotate-180"
      />
    </summary>

    <div className="border-t border-[#E2E8F0] px-5 py-4 text-base leading-6 text-[#64748B]">
      {answer}
    </div>
  </details>
);

const FooterColumn = ({
  title,
  links,
}) => (
  <div>
    <p className="text-sm font-bold uppercase tracking-wider text-white">
      {title}
    </p>

    <div className="mt-3 space-y-2.5">
      {links.map((link) => (
        <button
          key={link.label}
          type="button"
          onClick={link.action}
          className="block text-left text-base text-white transition-colors hover:text-[#93C5FD]"
        >
          {link.label}
        </button>
      ))}
    </div>
  </div>
);

/* ================================================================
   DASHBOARD PREVIEW COMPONENTS
================================================================ */

const PreviewCard = ({
  title,
  value,
  detail,
  icon: Icon,
  iconClass,
}) => (
  <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-medium text-[#94A3B8]">
          {title}
        </p>

        <p className="mt-1 text-xl font-bold text-[#0F172A]">
          {value}
        </p>

        <p className="mt-1 text-[9px] text-[#94A3B8]">
          {detail}
        </p>
      </div>

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={16} />
      </div>
    </div>
  </div>
);

const MiniNav = ({
  icon: Icon,
  text,
  active,
}) => (
  <div
    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold ${active
      ? 'bg-[#EEF2FF] text-[#4F46E5]'
      : 'text-[#64748B]'
      }`}
  >
    <Icon size={14} />
    {text}
  </div>
);

const NetworkNode = ({
  className,
  size,
  tone,
}) => {
  const tones = {
    blue: 'bg-[#4F46E5]',
    red: 'bg-[#EF4444]',
    violet: 'bg-[#7C3AED]',
    amber: 'bg-[#F59E0B]',
    green: 'bg-[#10B981]',
  };

  return (
    <div
      className={`absolute ${className} ${size} ${tones[tone] || tones.blue
        } rounded-full shadow-[0_6px_15px_rgba(15,23,42,0.16)]`}
    />
  );
};

const RiskBar = ({
  label,
  value,
  width,
  tone,
}) => {
  const tones = {
    green: {
      bar: 'bg-[#22C55E]',
      text: 'text-[#16A34A]',
      track: 'bg-[#DCFCE7]',
    },
    amber: {
      bar: 'bg-[#F59E0B]',
      text: 'text-[#D97706]',
      track: 'bg-[#FEF3C7]',
    },
    red: {
      bar: 'bg-[#EF4444]',
      text: 'text-[#DC2626]',
      track: 'bg-[#FEE2E2]',
    },
  };

  const palette =
    tones[tone] || tones.green;

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-semibold">
        <span className="text-[#475569]">
          {label}
        </span>

        <span className={palette.text}>
          {value}
        </span>
      </div>

      <div
        className={`mt-2 h-2 overflow-hidden rounded-full ${palette.track}`}
      >
        <div
          className={`h-full rounded-full ${palette.bar}`}
          style={{ width }}
        />
      </div>
    </div>
  );
};

export default Home;