import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Code2,
  GitBranch,
  Brain,
  Target,
  Users,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';

const About = ({ embedded = false }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#0F172A]">

      {!embedded && <PublicNavbar />}

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-white">

        <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[500px] w-[750px] -translate-x-1/2 rounded-full bg-[#EFF6FF] opacity-80 blur-3xl" />

        <div className="pointer-events-none absolute right-[-150px] top-[180px] h-[300px] w-[300px] rounded-full bg-[#EFF6FF] opacity-60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 md:py-24 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#F8FBFF] px-4 py-2 text-xs font-semibold text-[#2563EB] shadow-sm sm:text-sm">

              <ShieldCheck size={16} />

              About PlagShield

            </div>

            {/* Heading */}
            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-[#0F172A] sm:text-5xl md:text-6xl">

              Intelligent Source-Code

              <br />

              <span className="text-[#2563EB]">
                Similarity Analysis
              </span>

            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#64748B] sm:text-lg">

              PlagShield is a source-code analysis platform designed to
              identify potentially similar submissions using multiple
              complementary analysis techniques.

            </p>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          WHAT IS PLAGSHIELD
      ===================================================== */}
      <section className="bg-[#F8FBFF]">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >

              <p className="text-xs font-bold tracking-[0.18em] text-[#2563EB]">
                ABOUT THE PLATFORM
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                What is PlagShield?
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#64748B]">
                PlagShield compares source-code submissions and provides
                similarity information to help identify potentially copied
                or highly similar code.
              </p>

              <p className="mt-4 max-w-2xl text-base leading-8 text-[#64748B]">
                The platform combines token-based, structural and semantic
                analysis to examine code from different perspectives.
              </p>

              <div className="mt-7 space-y-3">

                <AboutPoint text="Multiple complementary analysis techniques" />

                <AboutPoint text="Source-code similarity insights" />

                <AboutPoint text="Designed for academic code review" />

              </div>

            </motion.div>


            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-[#DBEAFE] bg-white p-3 shadow-[0_20px_50px_rgba(37,99,235,0.08)]"
            >

              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FBFF] p-6">

                <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      PlagShield
                    </p>

                    <p className="text-xs text-[#94A3B8]">
                      Source-Code Analysis
                    </p>
                  </div>

                </div>


                <div className="mt-5 space-y-3">

                  <AnalysisItem
                    icon={Code2}
                    title="Token-Based"
                    text="Code tokens"
                  />

                  <AnalysisItem
                    icon={GitBranch}
                    title="Structural"
                    text="Code structure"
                  />

                  <AnalysisItem
                    icon={Brain}
                    title="Semantic / AI"
                    text="Code meaning"
                  />

                </div>


                <div className="mt-5 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3">

                  <p className="text-xs leading-5 text-[#475569]">
                    Different analysis perspectives work together to provide
                    a broader view of source-code similarity.
                  </p>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ANALYSIS METHODS
      ===================================================== */}
      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >

            <p className="text-xs font-bold tracking-[0.18em] text-[#2563EB]">
              ANALYSIS METHODS
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Multiple ways to analyze code
            </h2>

            <p className="mt-4 text-base leading-7 text-[#64748B]">
              Each approach examines source code from a different perspective.
            </p>

          </motion.div>


          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <MethodCard
              icon={Code2}
              number="01"
              title="Token-Based"
              text="Compares normalized source-code tokens to identify common code elements and patterns."
            />

            <MethodCard
              icon={GitBranch}
              number="02"
              title="Structural / AST-Based"
              text="Analyzes programming structures such as conditions, loops, declarations and control statements."
            />

            <MethodCard
              icon={Brain}
              number="03"
              title="Semantic / AI-Based"
              text="Uses CodeBERT embeddings to identify code that is semantically similar."
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          GOAL + USERS
      ===================================================== */}
      <section className="border-y border-[#E2E8F0] bg-[#F8FBFF]">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >

            <p className="text-xs font-bold tracking-[0.18em] text-[#2563EB]">
              OUR PURPOSE
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Built for better code review
            </h2>

          </motion.div>


          <div className="mt-12 grid gap-5 md:grid-cols-2">

            <PurposeCard
              icon={Target}
              title="Our Goal"
              text="Provide a clear and efficient platform for analyzing similarities between multiple source-code submissions."
            />

            <PurposeCard
              icon={Users}
              title="Who Can Use It?"
              text="The platform can support students, educators and institutions in reviewing source-code similarity."
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="bg-white">

        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 md:py-20 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-6 py-12 text-center sm:px-10"
          >

            <div className="pointer-events-none absolute left-1/2 top-[-130px] h-[280px] w-[500px] -translate-x-1/2 rounded-full bg-white opacity-70 blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                <ShieldCheck size={24} />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Explore PlagShield
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#64748B] sm:text-base">
                Learn how PlagShield processes source code and identifies
                potentially similar submissions.
              </p>

              <button
                type="button"
                onClick={() => navigate('/how-it-works')}
                className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1D4ED8] hover:shadow-md"
              >

                See How It Works

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />

              </button>

            </div>

          </motion.div>

        </div>

      </section>

    </div>
  );
};


/* ============================================================
   COMPONENTS
============================================================ */

const AboutPoint = ({ text }) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        <CheckCircle2 size={14} />
      </div>

      <p className="text-sm font-medium text-[#475569]">
        {text}
      </p>

    </div>
  );
};


const AnalysisItem = ({ icon: Icon, title, text }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white p-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
        <Icon size={17} />
      </div>

      <div>

        <p className="text-sm font-semibold text-[#0F172A]">
          {title}
        </p>

        <p className="text-xs text-[#94A3B8]">
          {text}
        </p>

      </div>

    </div>
  );
};


const MethodCard = ({
  icon: Icon,
  number,
  title,
  text,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-200 hover:border-[#BFDBFE] hover:shadow-[0_14px_35px_rgba(37,99,235,0.08)] sm:p-7"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB] transition-colors duration-200 group-hover:bg-[#2563EB] group-hover:text-white">
          <Icon size={21} />
        </div>

        <span className="text-xs font-bold text-[#BFDBFE]">
          {number}
        </span>

      </div>

      <h3 className="mt-5 text-lg font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#64748B]">
        {text}
      </p>

    </motion.div>
  );
};


const PurposeCard = ({
  icon: Icon,
  title,
  text,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[#E2E8F0] bg-white p-7 shadow-sm transition-all duration-200 hover:border-[#BFDBFE] hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)]"
    >

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#64748B]">
        {text}
      </p>

    </motion.div>
  );
};


export default About;