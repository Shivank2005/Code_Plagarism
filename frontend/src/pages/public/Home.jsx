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
  X,
  Network,
  FileText,
  ListChecks,
  Quote,
  Sparkles,
  Archive,
} from 'lucide-react';
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

  const goToApp = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLearnMore = () => {
    navigate('/how-it-works');
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
    if (!questionText.trim()) return;
    setQuestionSent(true);
    setQuestionText('');
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#0F172A]">
      <PublicNavbar />

      {/* =====================================================
          HERO — mirrors the "free tool" landing pattern:
          badge, heading, upload CTA, trust strip, stat counters
      ===================================================== */}
      <section id="home" className="relative overflow-hidden bg-white pt-16">
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#EFF6FF] opacity-80 blur-3xl" />
        <div className="pointer-events-none absolute right-[-180px] top-[260px] h-[350px] w-[350px] rounded-full bg-[#EFF6FF] opacity-60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-6 md:pb-20 md:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#F8FBFF] px-4 py-2 text-sm font-semibold text-[#2563EB] shadow-sm sm:text-base"
            >
              <Sparkles size={15} />
              Built for Academic Code Review
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl"
            >
              Free Code Plagiarism Checker
              <br />
              <span className="text-[#2563EB]">for Students &amp; Educators</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-[#64748B] sm:text-xl sm:leading-8"
            >
              Sign in and upload a submission to scan it against your class
              or cohort. Get a similarity score, side-by-side comparisons,
              and a clear, color-coded report in minutes.
            </motion.p>
          </div>

          {/* Upload CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div
              onClick={goToApp}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropZoneInteract}
              role="button"
              tabIndex={0}
              className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-10 ${isDragging
                ? 'border-[#2563EB] bg-[#EFF6FF]'
                : 'border-[#BFDBFE] bg-[#F8FBFF] hover:border-[#2563EB] hover:bg-[#EFF6FF]'
                }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2563EB] shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
                <UploadCloud size={26} />
              </div>

              <p className="mt-4 text-lg font-semibold text-[#0F172A]">
                Sign in to upload your source code
              </p>

              <p className="mt-1 text-base text-[#64748B]">
                Supports multiple files and common languages &mdash; analysis
                runs from your dashboard
              </p>

              <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 group-hover:bg-[#1D4ED8] group-hover:shadow-md">
                Get Started
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
              <LockKeyhole size={14} />
              Your submissions stay private to your account and are never used to train models.
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleLearnMore}
                className="text-base font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
              >
                or learn how the analysis works &rarr;
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
          </div>
        </div>
      </section>

      {/* =====================================================
          TRY IT CTA BANNER
      ===================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Try PlagShield's Code Similarity Checker
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
              Sign in, upload a set of submissions, and get a full similarity
              breakdown with top matching sources &mdash; at no cost.
            </p>
            <button
              type="button"
              onClick={goToApp}
              className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-lg"
            >
              Get Free Report
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS — connected workflow
      ===================================================== */}
      <section id="how-it-works" className="border-y border-[#E2E8F0] bg-[#F8FBFF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-base font-bold tracking-[0.22em] text-[#2563EB]">
              HOW IT WORKS
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl md:text-[52px] md:leading-[1.08]">
              From source code to <span className="text-[#2563EB]">clear insights</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#64748B] sm:text-xl">
              A simple workflow designed to turn source-code submissions into
              meaningful similarity information.
            </p>
          </motion.div>

          <div className="relative mx-auto mt-14 max-w-6xl">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-px bg-[#BFDBFE] lg:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              <WorkflowStep step="01" icon={UploadCloud} title="Upload" text="Submit source-code files or a complete project." color="blue" />
              <WorkflowStep step="02" icon={Code2} title="Preprocess" text="Prepare and normalize source code for comparison." color="violet" />
              <WorkflowStep step="03" icon={Brain} title="Analyze" text="Apply token, structural and semantic techniques." color="amber" />
              <WorkflowStep step="04" icon={GitBranch} title="Compare" text="Evaluate relationships between submissions." color="green" />
              <WorkflowStep step="05" icon={BarChart3} title="Report" text="Present similarity results and useful insights." color="teal" />
            </div>
          </div>

          <motion.div
            {...fadeUp}
            className="mx-auto mt-12 max-w-4xl rounded-2xl border border-[#DBEAFE] bg-white px-6 py-5 text-center shadow-[0_8px_30px_rgba(37,99,235,0.06)] sm:px-8"
          >
            <p className="text-base leading-7 text-[#64748B] sm:text-lg">
              <span className="font-bold text-[#0F172A]">Multiple techniques, one analysis.</span>{' '}
              Token-based, structural and semantic analysis provide complementary
              perspectives on source-code similarity.
            </p>
          </motion.div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={goToApp}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-lg"
            >
              Start an Analysis
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          SPEC / COMPARISON TABLE
      ===================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Maintain academic integrity with confidence
            </h2>
          </motion.div>

          <motion.div {...fadeUp} className="mt-10 overflow-hidden rounded-2xl border border-[#E2E8F0]">
            <ComparisonRow icon={BarChart3} label="Analyzes" value="Similarity across token, structural & semantic layers" />
            <ComparisonRow icon={FileText} label="Provides" value="Real-time report with an overall similarity score" />
            <ComparisonRow icon={ShieldCheck} label="Accuracy" value="Multi-method analysis reduces false positives" />
            <ComparisonRow icon={UploadCloud} label="Uploads" value="Multiple files or a full project folder per scan" last />
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          WORKS WITH HOW YOU ALREADY SUBMIT CODE
      ===================================================== */}
      <section className="border-t border-[#D8E5F7] bg-[#EEF4FF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-base font-bold tracking-[0.22em] text-[#2563EB]">
              FLEXIBLE SUBMISSIONS
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl md:text-[52px] md:leading-[1.08]">
              Works with how you already submit code
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#526B8A] sm:text-xl">
              Bring individual source files, complete ZIP projects, or repository
              code into PlagShield without changing your workflow.
            </p>
          </motion.div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <IntegrationCard icon={UploadCloud} title="File Upload" text="Upload individual source-code files directly from your computer." accent="blue" />
            <IntegrationCard icon={Archive} title="ZIP Projects" text="Submit a complete project as a ZIP archive for batch analysis." accent="violet" />
            <IntegrationCard icon={GithubLogo} title="GitHub" text="Bring repository-based source code into your review workflow." accent="github" />
            <IntegrationCard icon={GitlabLogo} title="GitLab" text="Keep repository submissions organized and ready for analysis." accent="gitlab" />
          </div>

          <motion.div {...fadeUp} className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-2xl border border-[#D6E3F5] bg-white shadow-[0_8px_28px_rgba(30,64,175,0.06)]">
            <div className="flex items-center gap-3 border-b border-[#E2EAF5] px-5 py-4 sm:px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Code2 size={19} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                  Supported languages &amp; formats
                </p>
                <p className="text-sm text-[#64748B]">
                  One workspace for your source files and project archives.
                </p>
              </div>
            </div>

            <div className="language-marquee overflow-hidden py-5">
              <div className="language-marquee-track flex w-max items-center gap-6">
                {[...LANGUAGE_LOGOS, ...LANGUAGE_LOGOS].map((language, index) => (
                  <div
                    key={`${language.name}-${index}`}
                    className="flex h-16 w-20 flex-shrink-0 items-center justify-center"
                  >
                    <img
                      src={language.src}
                      alt={language.name}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            <style>{`
  .language-marquee-track {
    animation: languageMarquee 42s linear infinite;
  }

  @keyframes languageMarquee {
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
      transform: translateX(0);
    }
  }
`}</style>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mx-auto mt-8 flex max-w-6xl items-center justify-center gap-3 rounded-2xl border border-[#D6E3F5] bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(30,64,175,0.05)]"
          >
            <ShieldCheck size={19} className="flex-shrink-0 text-[#2563EB]" />
            <p className="text-base font-medium text-[#334E73] sm:text-lg">
              All analysis starts securely from your PlagShield workspace after sign in.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          WHO IT'S FOR
      ===================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Who Does <span className="text-[#2563EB]">PlagShield</span> Help?
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <AudiencePhotoCard
              photo="/images/audience/student.jpg"
              title="Students"
              text="Check your own submission before you turn it in, and understand where it overlaps with other work."
              items={['Assignments', 'Lab Exercises', 'Capstone Projects']}
            />
            <AudiencePhotoCard
              photo="/images/audience/educator.avif"
              title="Educators"
              text="Screen a whole cohort's submissions in one batch and focus your review time on what matters."
              items={['Class Assignments', 'Coding Exams', 'Group Projects']}
            />
            <AudiencePhotoCard
              photo="/images/audience/institution.avif"
              title="Institutions"
              text="Support consistent, structured integrity checks across departments and cohorts at scale."
              items={['Course-wide Audits', 'Plagiarism Records', 'Bulk Reports']}
            />
          </div>

          <motion.div {...fadeUp} className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
            <p className="text-sm font-bold tracking-[0.18em] text-[#94A3B8]">PLAGSHIELD IS NOT FOR</p>
            <div className="mt-3 space-y-2">
              <NotForItem text="Checking natural-language text or essays for plagiarism" />
              <NotForItem text="Masking or disguising copied code to avoid detection" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          PRICING
      ===================================================== */}
      <section className="border-t border-[#163A70] bg-[#0A1F44]">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-10"
          >
            <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
              <div>
                <p className="text-sm font-bold tracking-[0.18em] text-[#2563EB]">FREE PLAN</p>
                <h3 className="mt-2 text-2xl font-bold text-[#0F172A]">
                  Everything you need to get started
                </h3>
                <p className="mt-3 text-base leading-6 text-[#64748B]">
                  Create an account and start scanning submissions right away
                  &mdash; no credit card required.
                </p>
                <button
                  type="button"
                  onClick={goToApp}
                  className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8]"
                >
                  Get Started Free
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <PricingItem text="Token, structural & semantic analysis" />
                <PricingItem text="Similarity graph & heatmap views" />
                <PricingItem text="Side-by-side diff viewer" />
                <PricingItem text="Suspicious pairs list" />
                <PricingItem text="Downloadable PDF reports" last />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIALS
      ===================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <TestimonialCard
              quote="Being able to see exactly which lines overlap, instead of just a percentage, made grading disputes so much easier to resolve."
              name="Course Instructor"
              context="Introductory Programming"
            />
            <TestimonialCard
              quote="I ran my own project through it before submitting and caught a chunk of boilerplate I'd forgotten to cite properly."
              name="Computer Science Student"
              context="Final-year Project"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          MORE THAN A PLAGIARISM CHECKER
      ===================================================== */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FBFF]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl">
            <h2 className="whitespace-nowrap text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              PlagShield Offers <span className="text-[#2563EB]">More Than a Similarity Score</span>
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 lg:grid-cols-6">
            <ToolCard color="rose" icon={Network} title="Similarity Graph" text="Visualize clusters of related submissions and identify groups that deserve attention." onClick={goToApp} featured />
            <ToolCard color="violet" icon={GitBranch} title="Diff Viewer" text="Line-by-line, side-by-side comparison of any two files." onClick={goToApp} />
            <ToolCard color="green" icon={BarChart3} title="Similarity Heatmap" text="Spot hotspots of overlap across an entire batch at once." onClick={goToApp} />
            <ToolCard color="blue" icon={ListChecks} title="Suspicious Pairs" text="A ranked list of submission pairs that need a closer look." onClick={goToApp} />
            <ToolCard color="amber" icon={FileText} title="PDF Reports" text="Export a shareable report for records or academic review." onClick={goToApp} />
            <ToolCard color="teal" icon={Code2} title="Multi-Language Support" text="Analyze submissions across common programming languages." onClick={goToApp} />
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT — full contact & feedback panel, team + college
      ===================================================== */}
      <section id="contact" className="border-t border-[#E2E8F0] bg-[#F8FBFF]">
        <div className="mx-auto max-w-2xl px-5 pt-20 text-center sm:px-6 md:pt-24 lg:px-8">
          <p className="text-base font-bold tracking-[0.18em] text-[#2563EB]">CONTACT &amp; FEEDBACK</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
            Have questions about PlagShield?
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#64748B] sm:text-xl">
            Reach out to the team, or use the form below to share feedback,
            report a bug, or ask us anything.
          </p>
        </div>

        <Contact embedded />
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-base font-bold tracking-[0.18em] text-[#2563EB]">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-[#64748B] sm:text-xl">A few things you may want to know about PlagShield.</p>
          </motion.div>

          <div className="mt-10 space-y-3">
            <FaqItem question="What is PlagShield?" answer="PlagShield is a source-code similarity analysis platform that uses token-based, structural and semantic analysis techniques." />
            <FaqItem question="Where do I upload my source code?" answer="Source-code uploads and analysis are available after signing in through the PlagShield dashboard." />
            <FaqItem question="Which analysis approaches does PlagShield use?" answer="PlagShield combines token-based analysis using JPlag, structural analysis and semantic analysis using CodeBERT." />
            <FaqItem question="Does PlagShield only catch identical code?" answer="No. The platform also looks at structural and semantic similarity, so renamed variables or restructured logic can still be flagged." />
            <FaqItem question="Is my code kept private?" answer="Yes. Uploaded submissions are tied to your account and are not used to train any external models." />
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
              Didn't find what you were looking for? Ask us directly and
              we'll get back to you.
            </p>

            <button
              type="button"
              onClick={handleAskQuestionClick}
              className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md sm:text-lg"
            >
              {showAskBox ? 'Close' : 'Ask a Question'}
              <ArrowRight size={16} className={`transition-transform duration-200 ${showAskBox ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
            </button>

            {showAskBox && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                onSubmit={handleQuestionSubmit}
                className="mx-auto mt-6 max-w-xl text-left"
              >
                <label htmlFor="faq-question" className="text-sm font-semibold text-[#0F172A]">
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
                  className="mt-2 w-full rounded-lg border border-[#CBD5E1] bg-white px-4 py-3 text-base text-[#0F172A] shadow-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                />
                <div className="mt-3 flex items-center gap-3">
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

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-6 py-12 text-center sm:px-10 md:py-14"
          >
            <div className="pointer-events-none absolute left-1/2 top-[-150px] h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-white opacity-70 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Ready to analyze your code?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg">
                Sign in to start scanning submissions with PlagShield's
                multi-method similarity analysis.
              </p>
              <button
                type="button"
                onClick={goToApp}
                className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md"
              >
                Start Analysis
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
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

/* ============================================================
   COMPONENTS
============================================================ */

const StatCounter = ({ value, label, eyebrow, dark }) => (
  <div className="text-center">
    {eyebrow && (
      <p className={`text-sm font-semibold ${dark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>{eyebrow}</p>
    )}
    <p className={`mt-1 text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-[#0F172A]'}`}>{value}</p>
    <p className={`mt-1 text-sm ${dark ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>{label}</p>
  </div>
);

const WhyRow = ({ icon: Icon, title, text }) => (
  <div className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5">
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-base font-bold text-[#0F172A]">{title}</p>
      <p className="mt-1 text-base leading-6 text-[#64748B]">{text}</p>
    </div>
  </div>
);

const STEP_COLORS = {
  blue: { bg: '#EFF6FF', text: '#2563EB' },
  violet: { bg: '#F1EEFF', text: '#7C3AED' },
  amber: { bg: '#FFF7E6', text: '#D97706' },
  green: { bg: '#EFFDF4', text: '#16A34A' },
};

const WorkflowStep = ({ step, icon: Icon, title, text, color }) => {
  const palettes = {
    blue: { bg: '#EFF6FF', text: '#2563EB', ring: '#BFDBFE' },
    violet: { bg: '#F5F3FF', text: '#7C3AED', ring: '#DDD6FE' },
    amber: { bg: '#FFF7ED', text: '#D97706', ring: '#FED7AA' },
    green: { bg: '#F0FDF4', text: '#16A34A', ring: '#BBF7D0' },
    teal: { bg: '#F0FDFA', text: '#0D9488', ring: '#99F6E4' },
  };

  const palette = palettes[color] || palettes.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="relative z-10 text-center"
    >
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: palette.ring }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          <Icon size={23} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-5 text-sm font-bold tracking-[0.12em] text-[#2563EB]">
        STEP {step}
      </p>
      <h3 className="mt-2 text-lg font-bold text-[#0F172A] sm:text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-[190px] text-sm leading-6 text-[#64748B] sm:text-base">
        {text}
      </p>
    </motion.div>
  );
};

const ComparisonRow = ({ icon: Icon, label, value, last }) => (
  <div className={`flex items-center gap-4 bg-white px-5 py-4 sm:px-7 ${!last ? 'border-b border-[#E2E8F0]' : ''}`}>
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
      <Icon size={17} />
    </div>
    <p className="w-28 flex-shrink-0 text-base font-bold text-[#0F172A] sm:w-36">{label}</p>
    <p className="text-base text-[#64748B]">{value}</p>
  </div>
);

const IntegrationCard = ({ icon: Icon, title, text, accent = 'blue', dark = false }) => {
  const accents = {
    blue: { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' },
    violet: { bg: '#F5F3FF', text: '#7C3AED', border: '#EDE9FE' },
    github: { bg: '#F8FAFC', text: '#111827', border: '#E2E8F0' },
    gitlab: { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5' },
  };
  const palette = accents[accent] || accents.blue;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-2xl border p-6 text-left transition-all duration-200 ${dark
        ? 'border-[#2B568B] bg-[#102B55] shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:border-[#60A5FA] hover:bg-[#12325F]'
        : 'border-[#DCE6F2] bg-white shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:border-[#BFD7FF] hover:shadow-[0_16px_36px_rgba(37,99,235,0.10)]'
        }`}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: palette.bg, color: palette.text, borderColor: palette.border }}
      >
        <Icon size={23} strokeWidth={2} />
      </div>
      <h3 className={`mt-6 text-xl font-bold ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
        {title}
      </h3>
      <p className={`mt-2 text-base leading-6 ${dark ? 'text-[#BFDBFE]' : 'text-[#64748B]'}`}>
        {text}
      </p>
    </motion.div>
  );
};

const AudiencePhotoCard = ({ photo, title, text, items }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:border-[#BFDBFE] hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)]"
  >
    <div className="h-56 w-full overflow-hidden bg-[#F1F5F9]">
      <img
        src={photo}
        alt={title}
        className="h-full w-full object-cover object-top"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-[#0F172A]">{title}</h3>
      <p className="mt-2 text-base leading-6 text-[#64748B]">{text}</p>
      {items && (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#F8FAFC] px-3 py-1 text-sm font-medium text-[#475569]">
              <CheckCircle2 size={12} className="text-[#2563EB]" />
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
    <X size={15} className="flex-shrink-0 text-[#DC2626]" />
    {text}
  </div>
);

const PricingItem = ({ text, last }) => (
  <div className={`flex items-center gap-2.5 py-2.5 text-base text-[#334155] ${!last ? 'border-b border-[#E2E8F0]' : ''}`}>
    <CheckCircle2 size={16} className="flex-shrink-0 text-[#16A34A]" />
    {text}
  </div>
);

const TestimonialCard = ({ quote, name, context }) => (
  <motion.div {...({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.5 },
  })} className="rounded-xl border border-[#E2E8F0] bg-[#F8FBFF] p-6">
    <Quote size={22} className="text-[#BFDBFE]" />
    <p className="mt-3 text-base leading-7 text-[#334155]">&ldquo;{quote}&rdquo;</p>
    <p className="mt-4 text-base font-semibold text-[#0F172A]">{name}</p>
    <p className="text-sm text-[#94A3B8]">{context}</p>
  </motion.div>
);

const TOOL_COLORS = {
  rose: { bg: '#FDECEE', text: '#E11D48' },
  violet: { bg: '#F1EEFF', text: '#7C3AED' },
  green: { bg: '#EFFDF4', text: '#16A34A' },
  blue: { bg: '#EFF6FF', text: '#2563EB' },
  amber: { bg: '#FFF7E6', text: '#D97706' },
  teal: { bg: '#E9FBF8', text: '#0D9488' },
};

const ToolCard = ({ icon: Icon, title, text, onClick, color, featured = false }) => {
  const palette = TOOL_COLORS[color] || TOOL_COLORS.blue;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-2xl border border-[#E2E8F0] bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-[#BFDBFE] hover:shadow-[0_14px_34px_rgba(37,99,235,0.08)] ${featured ? 'lg:col-span-2 lg:row-span-2 lg:p-8' : 'lg:col-span-2'
        }`}
    >
      <div
        className={`flex items-center justify-center rounded-full ${featured ? 'h-14 w-14' : 'h-11 w-11'}`}
        style={{ backgroundColor: palette.bg, color: palette.text }}
      >
        <Icon size={featured ? 24 : 20} />
      </div>

      <h3 className={`mt-5 font-bold text-[#0F172A] ${featured ? 'text-2xl' : 'text-lg'}`}>
        {title}
      </h3>
      <p className={`mt-2 text-[#64748B] ${featured ? 'text-lg leading-7' : 'text-base leading-6'}`}>
        {text}
      </p>

      {featured && (
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
          Open similarity graph
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      )}
    </motion.button>
  );
};

const FaqItem = ({ question, answer }) => (
  <details className="group rounded-xl border border-[#E2E8F0] bg-white transition-colors duration-200 hover:border-[#BFDBFE]">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
      <span>{question}</span>
      <ChevronDown size={18} className="flex-shrink-0 text-[#64748B] transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <div className="border-t border-[#E2E8F0] px-5 py-4 text-base leading-6 text-[#64748B]">{answer}</div>
  </details>
);

const FooterColumn = ({ title, links }) => (
  <div>
    <p className="text-sm font-bold uppercase tracking-wider text-[#93A9C7]">{title}</p>
    <div className="mt-3 space-y-2.5">
      {links.map((link) => (
        <button
          key={link.label}
          type="button"
          onClick={link.action}
          className="block text-left text-base text-[#BFDBFE] transition-colors hover:text-white"
        >
          {link.label}
        </button>
      ))}
    </div>
  </div>
);

export default Home;
