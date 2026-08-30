import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Code2,
  Brain,
  GitBranch,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import PublicNavbar from '../../components/public/PublicNavbar';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload',
    description: 'Submit source-code files for analysis.',
  },
  {
    number: '02',
    icon: Code2,
    title: 'Preprocess',
    description: 'Prepare source code for comparison.',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Analyze',
    description: 'Apply multiple similarity techniques.',
  },
  {
    number: '04',
    icon: GitBranch,
    title: 'Compare',
    description: 'Evaluate relationships between submissions.',
  },
  {
    number: '05',
    icon: BarChart3,
    title: 'Report',
    description: 'Present similarity results and insights.',
  },
];

const HowItWorks = ({ embedded = false }) => {
  return (
    <div
      id="how-it-works"
      className="min-h-screen bg-[#F4F8FF] text-[#0F172A]"
    >
      {!embedded && <PublicNavbar />}

      {/* Main Section */}
      <section className="relative overflow-hidden border-b border-[#DCE7F7]">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-180px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#E5EEFF] opacity-70 blur-3xl" />

          <div className="absolute left-[8%] top-[45%] h-40 w-40 rounded-full bg-[#EAF2FF] opacity-60 blur-3xl" />

          <div className="absolute right-[8%] top-[40%] h-48 w-48 rounded-full bg-[#E8F0FF] opacity-60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-6 md:py-32 lg:px-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center"
          >
            <p className="text-sm font-bold tracking-[0.2em] text-[#2563EB] sm:text-base">
              HOW IT WORKS
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-[#0B1736] sm:text-5xl md:text-6xl">
              From source code to clear insights
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#526987] sm:text-xl">
              A simple workflow designed to turn source-code submissions
              into meaningful similarity information.
            </p>
          </motion.div>

          {/* Workflow */}
          <div className="relative mx-auto mt-24 max-w-6xl">

            {/* Connecting line */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-[36px] hidden h-px bg-[#AFCBFF] lg:block" />

            <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">

              {STEPS.map((step, index) => (
                <StepCard
                  key={step.number}
                  {...step}
                  index={index}
                />
              ))}

            </div>
          </div>

          {/* Bottom message */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="rounded-2xl border border-[#CFE0FF] bg-white px-8 py-10 text-center shadow-[0_8px_30px_rgba(37,99,235,0.08)] md:px-12">

              <p className="text-base leading-7 text-[#526987] sm:text-lg">
                <span className="font-bold text-[#0F172A]">
                  Multiple techniques, one analysis.
                </span>{' '}
                Token-based, structural and semantic analysis provide
                complementary perspectives on source-code similarity.
              </p>

            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};


/* -------------------------------------------------------
   Step Card
------------------------------------------------------- */

const StepCard = ({
  number,
  icon: Icon,
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
      }}
      className="relative text-center"
    >

      {/* Icon */}
      <div className="relative z-10 mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-2xl border border-[#BBD4FF] bg-white text-[#2563EB] shadow-[0_5px_18px_rgba(37,99,235,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,99,235,0.16)]">

        <Icon
          size={30}
          strokeWidth={2}
        />

      </div>

      {/* Step Number */}
      <p className="mt-6 text-sm font-bold tracking-[0.12em] text-[#2563EB] sm:text-base">
        STEP {number}
      </p>

      {/* Title */}
      <h3 className="mt-2 text-xl font-bold leading-tight text-[#0F172A] sm:text-2xl">
        {title}
      </h3>

      {/* Description */}
      <p className="mx-auto mt-4 max-w-[210px] text-base leading-7 text-[#526987] sm:text-lg">
        {description}
      </p>

    </motion.div>
  );
};

export default HowItWorks;