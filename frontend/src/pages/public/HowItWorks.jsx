import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileCode2,
  ScanSearch,
  GitCompare,
  Brain,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

import PublicNavbar from '../../components/public/PublicNavbar';

const HowItWorks = ({ embedded = false }) => {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload Code',
      description:
        'Submit multiple source-code files or a code dataset for analysis.',
      color: 'indigo',
    },
    {
      number: '02',
      icon: FileCode2,
      title: 'Preprocess',
      description:
        'The system identifies the programming language and prepares the source code for analysis.',
      color: 'violet',
    },
    {
      number: '03',
      icon: ScanSearch,
      title: 'Extract Features',
      description:
        'Source code is transformed into tokens, structural representations and semantic embeddings.',
      color: 'purple',
    },
    {
      number: '04',
      icon: GitCompare,
      title: 'Compare Submissions',
      description:
        'Different analysis techniques compare the submitted programs against one another.',
      color: 'fuchsia',
    },
    {
      number: '05',
      icon: Brain,
      title: 'Combine Results',
      description:
        'Token, structural and semantic similarity signals are combined into a comprehensive result.',
      color: 'pink',
    },
    {
      number: '06',
      icon: BarChart3,
      title: 'View Results',
      description:
        'Similarity scores, suspicious pairs and visual analysis are presented through the dashboard.',
      color: 'rose',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0F172A]">

      {!embedded && <PublicNavbar />}

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        id="how-it-works"
        className="relative overflow-hidden border-b border-[#E5E7EB]"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E0E7FF] via-[#F3E8FF] to-[#FCE7F3] opacity-70 blur-3xl" />

        <div className="pointer-events-none absolute left-[8%] top-[45%] h-44 w-44 rounded-full bg-[#6366F1]/10 blur-3xl" />

        <div className="pointer-events-none absolute right-[8%] top-[35%] h-44 w-44 rounded-full bg-[#EC4899]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 text-center sm:px-6 md:pb-24 md:pt-36 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >

            {/* Badge */}
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#C7D2FE] bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.14em] text-[#4F46E5] shadow-sm backdrop-blur-md sm:text-sm">
              <ShieldCheck size={16} />
              HOW PLAGSHIELD WORKS
            </div>

            {/* Heading */}
            <h1 className="mx-auto mt-7 max-w-5xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#0F172A] sm:text-5xl md:text-6xl lg:text-7xl">
              From Source Code
              <br />

              <span className="bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                To Similarity Insights.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-[#64748B] sm:text-lg sm:leading-8">
              PlagShield processes source code through multiple analysis
              stages to identify similarities and present the results in
              an easy-to-understand dashboard.
            </p>

          </motion.div>
        </div>
      </section>


      {/* =========================================================
          PROCESS OVERVIEW
      ========================================================= */}
      <section className="relative overflow-hidden bg-white">

        <div className="pointer-events-none absolute right-[-180px] top-32 h-96 w-96 rounded-full bg-[#EEF2FF] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-2xl text-center"
          >

            <p className="text-xs font-bold tracking-[0.18em] text-[#4F46E5]">
              THE PROCESS
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              How the Analysis Works
            </h2>

            <p className="mt-4 text-base leading-7 text-[#64748B]">
              Six stages take your source code from upload to actionable
              similarity insights.
            </p>

          </motion.div>


          {/* =====================================================
              PIPELINE VISUAL
          ===================================================== */}
          <div className="relative mt-14">

            {/* Connecting line */}
            <div className="absolute left-[calc(50%-1px)] top-5 hidden h-[calc(100%-40px)] w-px bg-gradient-to-b from-[#C7D2FE] via-[#DDD6FE] to-[#FBCFE8] md:block" />

            <div className="space-y-8 md:space-y-10">

              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={step.number}
                    initial={{
                      opacity: 0,
                      x: isEven ? -20 : 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                      margin: '-60px',
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                    }}
                    className="relative"
                  >

                    {/* Desktop */}
                    <div className="hidden md:grid md:grid-cols-[1fr_72px_1fr] md:items-center md:gap-7">

                      {/* Left */}
                      <div>
                        {isEven ? (
                          <StepCard
                            step={step}
                            Icon={Icon}
                            align="right"
                          />
                        ) : (
                          <div />
                        )}
                      </div>


                      {/* Center */}
                      <div className="relative z-10 flex justify-center">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#4F46E5] to-[#A855F7] text-xs font-black text-white shadow-[0_8px_20px_rgba(79,70,229,0.22)]">
                          {step.number}
                        </div>

                      </div>


                      {/* Right */}
                      <div>
                        {!isEven ? (
                          <StepCard
                            step={step}
                            Icon={Icon}
                            align="left"
                          />
                        ) : (
                          <div />
                        )}
                      </div>

                    </div>


                    {/* Mobile */}
                    <div className="relative flex gap-4 md:hidden">

                      <div className="relative z-10 flex shrink-0">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#A855F7] text-xs font-black text-white shadow-[0_8px_20px_rgba(79,70,229,0.20)]">
                          {step.number}
                        </div>

                      </div>

                      <StepCard
                        step={step}
                        Icon={Icon}
                        align="left"
                      />

                    </div>

                  </motion.div>
                );
              })}

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          ANALYSIS ENGINE
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#F8FAFC]">

        <div className="pointer-events-none absolute left-1/2 top-[-100px] h-72 w-[700px] -translate-x-1/2 rounded-full bg-[#EEF2FF] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-2xl text-center"
          >

            <p className="text-xs font-bold tracking-[0.18em] text-[#4F46E5]">
              INSIDE THE ENGINE
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              Three Ways to Understand Code
            </h2>

            <p className="mt-4 text-base leading-7 text-[#64748B]">
              PlagShield combines complementary signals instead of relying
              on a single similarity technique.
            </p>

          </motion.div>


          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <EngineCard
              icon={FileCode2}
              number="01"
              title="Token Similarity"
              description="Normalized source-code tokens are compared to identify common code elements."
              gradient="from-[#EEF2FF] to-[#E0E7FF]"
              iconColor="text-[#4F46E5]"
            />

            <EngineCard
              icon={GitCompare}
              number="02"
              title="Structural Similarity"
              description="Program structure and AST-related characteristics help identify similarities beyond exact text."
              gradient="from-[#F3E8FF] to-[#EDE9FE]"
              iconColor="text-[#9333EA]"
            />

            <EngineCard
              icon={Brain}
              number="03"
              title="Semantic Similarity"
              description="CodeBERT embeddings help identify code that expresses similar meaning even when its implementation differs."
              gradient="from-[#FCE7F3] to-[#FDF2F8]"
              iconColor="text-[#DB2777]"
            />

          </div>


          {/* Combined result */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto mt-8 max-w-4xl rounded-[1.75rem] border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-6"
          >

            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#FCE7F3] text-[#4F46E5]">
                <CheckCircle2 size={23} />
              </div>

              <div className="flex-1">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4F46E5]">
                  Combined Analysis
                </p>

                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  Multiple similarity signals are brought together to
                  provide a broader view of potential code similarity.
                </p>

              </div>

              <ArrowRight
                size={20}
                className="hidden text-[#A855F7] sm:block"
              />

            </div>

          </motion.div>

        </div>
      </section>


      {/* =========================================================
          RESULT SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-white">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >

              <p className="text-xs font-bold tracking-[0.18em] text-[#4F46E5]">
                THE RESULT
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
                Everything You Need
                <br />
                <span className="bg-gradient-to-r from-[#4F46E5] to-[#EC4899] bg-clip-text text-transparent">
                  In One Dashboard.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#64748B]">
                Once the analysis is complete, PlagShield presents the
                results through visual and numerical indicators that make
                code similarity easier to understand.
              </p>

              <div className="mt-8 space-y-4">

                <ResultPoint text="Similarity scores between submissions" />

                <ResultPoint text="Suspicious code-pair identification" />

                <ResultPoint text="Visual similarity representations" />

                <ResultPoint text="Detailed comparison information" />

              </div>

            </motion.div>


            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative"
            >

              <div className="rounded-[2rem] border border-[#E2E8F0] bg-white p-3 shadow-[0_25px_70px_rgba(79,70,229,0.10)]">

                <div className="overflow-hidden rounded-[1.5rem] border border-[#E2E8F0] bg-[#F8FAFC]">

                  {/* Browser bar */}
                  <div className="flex h-11 items-center gap-2 border-b border-[#E2E8F0] bg-white px-4">

                    <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />

                    <div className="ml-3 h-2.5 w-24 rounded-full bg-[#E2E8F0]" />

                  </div>


                  <div className="p-5">

                    <div className="flex items-center justify-between">

                      <div>
                        <div className="h-2.5 w-20 rounded-full bg-[#CBD5E1]" />
                        <div className="mt-2 h-4 w-36 rounded-full bg-[#0F172A]/10" />
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]">
                        <ShieldCheck size={17} />
                      </div>

                    </div>


                    {/* Score */}
                    <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-xs font-semibold text-[#94A3B8]">
                            Overall Similarity
                          </p>

                          <p className="mt-1 text-3xl font-black text-[#0F172A]">
                            87.4%
                          </p>
                        </div>

                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-[#C7D2FE] text-sm font-black text-[#4F46E5]">
                          87%
                        </div>

                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">

                        <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#EC4899]" />

                      </div>

                    </div>


                    {/* Pair rows */}
                    <div className="mt-4 space-y-2">

                      <ResultRow
                        fileA="submission_01.py"
                        fileB="submission_07.py"
                        score="91%"
                      />

                      <ResultRow
                        fileA="submission_03.py"
                        fileB="submission_08.py"
                        score="84%"
                      />

                      <ResultRow
                        fileA="submission_04.py"
                        fileB="submission_11.py"
                        score="78%"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>
      </section>


      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#F8FAFC]">

        <div className="pointer-events-none absolute left-1/2 top-[-140px] h-80 w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E0E7FF] via-[#F3E8FF] to-[#FCE7F3] opacity-80 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-6 md:py-24 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#A855F7] text-white shadow-[0_10px_25px_rgba(79,70,229,0.22)]">
              <ShieldCheck size={26} />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
              Ready to Analyze Your Code?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#64748B]">
              Upload your source-code submissions and explore similarity
              through PlagShield's multi-layer analysis.
            </p>

            <a
              href="/login"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(79,70,229,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)]"
            >
              Get Started

              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>

          </motion.div>

        </div>
      </section>

    </div>
  );
};


/* ===============================================================
   STEP CARD
================================================================ */

const StepCard = ({
  step,
  Icon,
  align = 'left',
}) => {
  const isRight = align === 'right';

  return (
    <div
      className={`group rounded-[1.5rem] border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#C7D2FE] hover:shadow-[0_18px_40px_rgba(15,23,42,0.07)] ${
        isRight ? 'text-right' : 'text-left'
      }`}
    >

      <div
        className={`flex items-center gap-4 ${
          isRight ? 'justify-end' : 'justify-start'
        }`}
      >

        {!isRight && (
          <IconBox Icon={Icon} />
        )}

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
            STEP {step.number}
          </p>

          <h3 className="mt-1 text-lg font-black text-[#0F172A]">
            {step.title}
          </h3>

        </div>

        {isRight && (
          <IconBox Icon={Icon} />
        )}

      </div>

      <p className="mt-4 text-sm leading-7 text-[#64748B]">
        {step.description}
      </p>

    </div>
  );
};


/* ===============================================================
   ICON BOX
================================================================ */

const IconBox = ({ Icon }) => {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#F3E8FF] text-[#4F46E5] transition-transform duration-200 group-hover:scale-105">
      <Icon size={20} />
    </div>
  );
};


/* ===============================================================
   ENGINE CARD
================================================================ */

const EngineCard = ({
  icon: Icon,
  number,
  title,
  description,
  gradient,
  iconColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-[#E2E8F0] bg-white p-7 shadow-sm transition-all duration-200 hover:border-[#C7D2FE] hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
    >

      <div
        className={`absolute right-[-30px] top-[-30px] h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-80 blur-2xl transition-transform duration-500 group-hover:scale-125`}
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} ${iconColor}`}
          >
            <Icon size={22} />
          </div>

          <span className="text-xs font-black tracking-wider text-[#CBD5E1]">
            {number}
          </span>

        </div>

        <h3 className="mt-6 text-xl font-black text-[#0F172A]">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-[#64748B]">
          {description}
        </p>

      </div>

    </motion.div>
  );
};


/* ===============================================================
   RESULT POINT
================================================================ */

const ResultPoint = ({ text }) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
        <CheckCircle2 size={15} />
      </div>

      <p className="text-sm font-semibold text-[#334155]">
        {text}
      </p>

    </div>
  );
};


/* ===============================================================
   RESULT ROW
================================================================ */

const ResultRow = ({
  fileA,
  fileB,
  score,
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">

      <div className="min-w-0">

        <p className="truncate text-xs font-bold text-[#334155]">
          {fileA}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-[#94A3B8]">
          ↔ {fileB}
        </p>

      </div>

      <span className="ml-3 shrink-0 rounded-lg bg-[#EEF2FF] px-2.5 py-1 text-xs font-black text-[#4F46E5]">
        {score}
      </span>

    </div>
  );
};


export default HowItWorks;