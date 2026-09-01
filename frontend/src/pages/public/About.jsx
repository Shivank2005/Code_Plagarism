import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Code2,
  GitBranch,
  Brain,
  Target,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import PublicNavbar from '../../components/public/PublicNavbar';

const About = ({ embedded = false }) => {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0F172A]">

      {!embedded && <PublicNavbar />}

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        id="about"
        className="relative overflow-hidden border-b border-[#E5E7EB]"
      >
        {/* Soft background glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E0E7FF] via-[#F3E8FF] to-[#FCE7F3] opacity-70 blur-3xl" />

        <div className="pointer-events-none absolute left-[10%] top-[35%] h-40 w-40 rounded-full bg-[#6366F1]/10 blur-3xl" />

        <div className="pointer-events-none absolute right-[10%] top-[30%] h-40 w-40 rounded-full bg-[#EC4899]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 text-center sm:px-6 md:pb-24 md:pt-36 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >

            {/* Badge */}
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#C7D2FE] bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.14em] text-[#4F46E5] shadow-sm backdrop-blur-md sm:text-sm">
              <ShieldCheck size={16} />
              ABOUT PLAGSHIELD
            </div>

            {/* Heading */}
            <h1 className="mx-auto mt-7 max-w-5xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#0F172A] sm:text-5xl md:text-6xl lg:text-7xl">
              Understand Code.
              <br />

              <span className="bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                Detect Similarity.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-[#64748B] sm:text-lg sm:leading-8">
              PlagShield is a source-code analysis platform designed to
              identify similarities between code submissions using multiple
              complementary analysis techniques.
            </p>

          </motion.div>
        </div>
      </section>


      {/* =========================================================
          WHAT IS PLAGSHIELD
      ========================================================= */}
      <section className="relative overflow-hidden bg-white">

        <div className="pointer-events-none absolute right-[-180px] top-20 h-96 w-96 rounded-full bg-[#EEF2FF] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">

            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >

              <p className="text-xs font-bold tracking-[0.18em] text-[#4F46E5]">
                THE PLATFORM
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
                What is PlagShield?
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#64748B]">
                PlagShield compares source-code submissions and provides
                similarity information to help identify potentially copied
                or highly similar code.
              </p>

              <p className="mt-4 max-w-xl text-base leading-8 text-[#64748B]">
                The platform combines token-based, structural, and semantic
                analysis to examine code from different perspectives.
              </p>

              {/* Points */}
              <div className="mt-8 space-y-4">

                <AboutPoint text="Multiple complementary analysis techniques" />

                <AboutPoint text="Source-code similarity insights" />

                <AboutPoint text="Designed for academic code review" />

              </div>

            </motion.div>


            {/* RIGHT VISUAL */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative"
            >

              {/* Outer card */}
              <div className="relative overflow-hidden rounded-[2rem] border border-[#E2E8F0] bg-white p-3 shadow-[0_25px_70px_rgba(79,70,229,0.10)]">

                {/* Inner dashboard */}
                <div className="overflow-hidden rounded-[1.5rem] border border-[#E2E8F0] bg-[#F8FAFC]">

                  {/* Browser top */}
                  <div className="flex h-12 items-center gap-2 border-b border-[#E2E8F0] bg-white px-5">

                    <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]" />

                    <div className="ml-4 h-2.5 w-28 rounded-full bg-[#E2E8F0]" />

                  </div>


                  {/* Analysis visual */}
                  <div className="p-6 sm:p-8">

                    <div className="mb-6 flex items-center justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                          Analysis Engine
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#0F172A]">
                          Multi-Layer Detection
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                        <ShieldCheck size={20} />
                      </div>

                    </div>


                    {/* Analysis layers */}
                    <div className="space-y-3">

                      <AnalysisLayer
                        icon={Code2}
                        title="Token-Based Analysis"
                        subtitle="Code tokens"
                        number="01"
                        iconClass="bg-[#EEF2FF] text-[#4F46E5]"
                      />

                      <AnalysisLayer
                        icon={GitBranch}
                        title="Structural / AST Analysis"
                        subtitle="Code structure"
                        number="02"
                        iconClass="bg-[#F3E8FF] text-[#9333EA]"
                      />

                      <AnalysisLayer
                        icon={Brain}
                        title="Semantic / AI Analysis"
                        subtitle="Code meaning"
                        number="03"
                        iconClass="bg-[#FCE7F3] text-[#DB2777]"
                      />

                    </div>


                    {/* Combined result */}
                    <div className="mt-6 rounded-2xl border border-[#C7D2FE] bg-gradient-to-r from-[#EEF2FF] via-[#F5F3FF] to-[#FDF2F8] p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-sm">
                          <CheckCircle2 size={19} />
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                            Combined Decision
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-[#0F172A]">
                            Comprehensive similarity insight
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[#A855F7]/20 blur-3xl" />

            </motion.div>

          </div>

        </div>

      </section>


      {/* =========================================================
          ANALYSIS METHODS
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#F8FAFC]">

        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-[#EEF2FF] opacity-70 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-2xl text-center"
          >

            <p className="text-xs font-bold tracking-[0.18em] text-[#4F46E5]">
              ANALYSIS METHODS
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
              Multiple Analysis Approaches
            </h2>

            <p className="mt-4 text-base leading-7 text-[#64748B]">
              Different techniques provide different views of code similarity.
            </p>

          </motion.div>


          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <InfoCard
              icon={Code2}
              number="01"
              title="Token-Based"
              text="Compares normalized source-code tokens to identify common code elements."
              gradient="from-[#EEF2FF] to-[#E0E7FF]"
              iconColor="text-[#4F46E5]"
            />

            <InfoCard
              icon={GitBranch}
              number="02"
              title="Structural / AST-Based"
              text="Analyzes programming structures such as conditions, loops, declarations and control statements."
              gradient="from-[#F3E8FF] to-[#EDE9FE]"
              iconColor="text-[#9333EA]"
            />

            <InfoCard
              icon={Brain}
              number="03"
              title="Semantic / AI-Based"
              text="Uses CodeBERT embeddings to identify code that is semantically similar."
              gradient="from-[#FCE7F3] to-[#FDF2F8]"
              iconColor="text-[#DB2777]"
            />

          </div>

        </div>

      </section>


      {/* =========================================================
          GOAL + USERS
      ========================================================= */}
      <section className="relative overflow-hidden bg-white">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <div className="grid gap-6 md:grid-cols-2">

            <GoalCard
              icon={Target}
              label="OUR GOAL"
              title="Clearer Code Similarity Analysis"
              text="Provide a clear and efficient platform for analyzing similarities between multiple source-code submissions."
            />

            <GoalCard
              icon={Users}
              label="WHO CAN USE IT?"
              title="Built for Academic Review"
              text="The platform can support students, educators and institutions in reviewing source-code similarity."
            />

          </div>


          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mt-12 rounded-[2rem] border border-[#E0E7FF] bg-gradient-to-r from-[#EEF2FF] via-[#F5F3FF] to-[#FDF2F8] px-6 py-10 text-center sm:px-10"
          >

            <p className="text-sm font-semibold text-[#64748B]">
              Multiple techniques. One comprehensive analysis.
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">
              Protect originality with deeper code analysis.
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
              Explore PlagShield's analysis tools and review source-code
              similarity from multiple perspectives.
            </p>

            <a
              href="/login"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(79,70,229,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)]"
            >
              Explore PlagShield

              <ArrowRight
                size={16}
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
   ABOUT POINT
================================================================ */

const AboutPoint = ({ text }) => {
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
   ANALYSIS LAYER
================================================================ */

const AnalysisLayer = ({
  icon: Icon,
  title,
  subtitle,
  number,
  iconClass,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-bold text-[#0F172A]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#94A3B8]">
          {subtitle}
        </p>

      </div>

      <span className="text-xs font-black text-[#CBD5E1]">
        {number}
      </span>

    </div>
  );
};


/* ===============================================================
   INFO CARD
================================================================ */

const InfoCard = ({
  icon: Icon,
  number,
  title,
  text,
  gradient,
  iconColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-[#E2E8F0] bg-white p-7 shadow-sm transition-shadow duration-200 hover:border-[#C7D2FE] hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
    >

      {/* Top glow */}
      <div
        className={`absolute right-[-35px] top-[-35px] h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-80 blur-2xl transition-transform duration-500 group-hover:scale-125`}
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
          {text}
        </p>

      </div>

    </motion.div>
  );
};


/* ===============================================================
   GOAL CARD
================================================================ */

const GoalCard = ({
  icon: Icon,
  label,
  title,
  text,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group rounded-[1.75rem] border border-[#E2E8F0] bg-white p-7 shadow-sm transition-all duration-200 hover:border-[#C7D2FE] hover:shadow-[0_20px_45px_rgba(15,23,42,0.07)] sm:p-8"
    >

      <div className="flex items-center gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4F46E5] transition-colors duration-200 group-hover:bg-[#4F46E5] group-hover:text-white">
          <Icon size={22} />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#4F46E5]">
            {label}
          </p>
        </div>

      </div>

      <h3 className="mt-6 text-2xl font-black tracking-tight text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-3 max-w-xl text-sm leading-7 text-[#64748B]">
        {text}
      </p>

    </motion.div>
  );
};


export default About;