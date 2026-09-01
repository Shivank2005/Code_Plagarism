import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Code2,
  Brain,
  Users,
  ArrowRight,
} from 'lucide-react';

import PublicNavbar from '../../components/public/PublicNavbar';

const FAQ = ({ embedded = false }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is PlagShield?',
      answer:
        'PlagShield is a source-code plagiarism detection system that analyzes code submissions and identifies potential similarities using multiple analysis techniques.',
      icon: ShieldCheck,
    },
    {
      question: 'How does PlagShield detect code similarity?',
      answer:
        'PlagShield uses multiple approaches including token-based comparison, structural or AST-based analysis, and semantic analysis using CodeBERT embeddings. These approaches provide different perspectives on similarity between submissions.',
      icon: Code2,
    },
    {
      question: 'What is CodeBERT used for?',
      answer:
        'CodeBERT is used for semantic analysis. It helps identify code that may have similar meaning or intent even when the source code has been modified or written differently.',
      icon: Brain,
    },
    {
      question: 'Does PlagShield only compare exact code?',
      answer:
        'No. PlagShield is designed to look beyond exact text matches. Structural and semantic analysis can identify similarities even when code has been changed or represented differently.',
      icon: Code2,
    },
    {
      question: 'Who can use PlagShield?',
      answer:
        'PlagShield is designed primarily for academic code review and can be useful for students, educators, instructors, and educational institutions.',
      icon: Users,
    },
    {
      question: 'What programming languages are supported?',
      answer:
        'PlagShield is designed to work with multiple programming languages. The exact supported languages depend on the language configuration available in the current system.',
      icon: Code2,
    },
    {
      question: 'What kind of results does PlagShield provide?',
      answer:
        'The system provides similarity information between submissions along with visual representations and comparison details to help users investigate potentially similar code.',
      icon: ShieldCheck,
    },
    {
      question: 'Can I compare multiple submissions?',
      answer:
        'Yes. PlagShield is designed to analyze multiple source-code submissions and identify potentially suspicious pairs based on their similarity.',
      icon: Users,
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#0F172A]">

      {!embedded && <PublicNavbar />}

      <main>

        {/* =========================================================
            HERO
        ========================================================= */}
        {!embedded && (
          <section
            id="faq"
            className="relative overflow-hidden border-b border-[#E5E7EB]"
          >

            {/* Background glow */}
            <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E0E7FF] via-[#F3E8FF] to-[#FCE7F3] opacity-70 blur-3xl" />

            <div className="pointer-events-none absolute left-[8%] top-[45%] h-40 w-40 rounded-full bg-[#6366F1]/10 blur-3xl" />

            <div className="pointer-events-none absolute right-[8%] top-[35%] h-40 w-40 rounded-full bg-[#EC4899]/10 blur-3xl" />

            <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-32 text-center sm:px-6 md:pb-24 md:pt-36 lg:px-8">

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >

                {/* Badge */}
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#C7D2FE] bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.14em] text-[#4F46E5] shadow-sm backdrop-blur-md sm:text-sm">
                  <HelpCircle size={16} />
                  FREQUENTLY ASKED QUESTIONS
                </div>

                {/* Heading */}
                <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#0F172A] sm:text-5xl md:text-6xl">
                  Questions?
                  <br />

                  <span className="bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                    We've Got Answers.
                  </span>
                </h1>

                <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[#64748B] sm:text-lg sm:leading-8">
                  Learn more about PlagShield, how its similarity analysis
                  works, and how the platform can be used for source-code
                  review.
                </p>

              </motion.div>

            </div>
          </section>
        )}


        {/* =========================================================
            FAQ CONTENT
        ========================================================= */}
        <section
          className={`relative overflow-hidden ${
            embedded
              ? 'bg-white pt-10'
              : 'bg-[#F8FAFC]'
          }`}
        >

          <div className="pointer-events-none absolute right-[-180px] top-24 h-96 w-96 rounded-full bg-[#EEF2FF] blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-6 md:py-24 lg:px-8">

            {/* Section heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="mb-12 text-center"
            >

              <p className="text-xs font-bold tracking-[0.18em] text-[#4F46E5]">
                HELP CENTER
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                Everything You Need to Know
              </h2>

            </motion.div>


            {/* FAQ LIST */}
            <div className="space-y-3">

              {faqs.map((faq, index) => {
                const Icon = faq.icon;
                const isOpen = openIndex === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.035,
                    }}
                    className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                      isOpen
                        ? 'border-[#C7D2FE] shadow-[0_12px_35px_rgba(79,70,229,0.08)]'
                        : 'border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1]'
                    }`}
                  >

                    {/* Question */}
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                    >

                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                          isOpen
                            ? 'bg-[#EEF2FF] text-[#4F46E5]'
                            : 'bg-[#F8FAFC] text-[#64748B]'
                        }`}
                      >
                        <Icon size={19} />
                      </div>


                      {/* Text */}
                      <span
                        className={`flex-1 pr-3 text-sm font-bold leading-6 sm:text-base ${
                          isOpen
                            ? 'text-[#4F46E5]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {faq.question}
                      </span>


                      {/* Chevron */}
                      <motion.div
                        animate={{
                          rotate: isOpen ? 180 : 0,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isOpen
                            ? 'bg-[#EEF2FF] text-[#4F46E5]'
                            : 'bg-[#F8FAFC] text-[#64748B]'
                        }`}
                      >
                        <ChevronDown size={18} />
                      </motion.div>

                    </button>


                    {/* Answer */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: 'auto',
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.22,
                            ease: 'easeOut',
                          }}
                        >
                          <div className="border-t border-[#E2E8F0] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">

                            <p className="pl-14 text-sm leading-7 text-[#64748B]">
                              {faq.answer}
                            </p>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}

            </div>


            {/* =====================================================
                CTA
            ===================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="mt-12 overflow-hidden rounded-[2rem] border border-[#E0E7FF] bg-gradient-to-r from-[#EEF2FF] via-[#F5F3FF] to-[#FDF2F8] p-7 text-center sm:p-9"
            >

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#4F46E5] shadow-sm">
                <HelpCircle size={23} />
              </div>

              <h3 className="mt-5 text-2xl font-black tracking-tight text-[#0F172A]">
                Still Have Questions?
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748B]">
                If you couldn't find the information you were looking for,
                get in touch with the PlagShield team.
              </p>

              <a
                href="/contact"
                className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(79,70,229,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_12px_28px_rgba(79,70,229,0.25)]"
              >
                Contact Us

                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>

            </motion.div>

          </div>
        </section>

      </main>

    </div>
  );
};

export default FAQ;