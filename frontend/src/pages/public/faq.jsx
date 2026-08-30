import React, { useState } from 'react';
import {
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';

import PublicNavbar from '../../components/public/PublicNavbar';

const faqs = [
  {
    question: 'What is PlagShield?',
    answer:
      'PlagShield is an AI-powered code plagiarism detection system designed to identify similarities between source code submissions. It analyzes code structure and semantic patterns to provide meaningful plagiarism insights.',
  },
  {
    question: 'How does PlagShield detect plagiarism?',
    answer:
      'PlagShield combines multiple code analysis techniques. Source code is processed and analyzed for structural and semantic similarities using the plagiarism detection engine and CodeBERT-based analysis.',
  },
  {
    question: 'Which programming languages are supported?',
    answer:
      'PlagShield is designed to work with commonly used programming languages. The supported languages depend on the language configuration available in the current version of the system.',
  },
  {
    question: 'Does PlagShield only compare identical code?',
    answer:
      'No. PlagShield is designed to identify meaningful similarities even when code has been modified, such as changes to variable names, formatting, or parts of the implementation.',
  },
  {
    question: 'What is CodeBERT used for?',
    answer:
      'CodeBERT is used as part of the semantic code analysis pipeline. It helps represent source code in a way that allows PlagShield to identify similarities beyond simple text matching.',
  },
  {
    question: 'Can I upload multiple code files?',
    answer:
      'Yes. PlagShield is designed to analyze code submissions and compare them against other submissions to identify potential similarities.',
  },
  {
    question: 'How is the plagiarism result presented?',
    answer:
      'The system provides plagiarism analysis through the dashboard, allowing users to review similarity information and understand which submissions may contain suspicious similarities.',
  },
  {
    question: 'Is my source code stored permanently?',
    answer:
      'Source-code storage depends on the configuration of the PlagShield deployment. For your local deployment, the data is managed by the application and its configured database.',
  },
  {
    question: 'Do I need to install anything to use PlagShield?',
    answer:
      'For the local development version, the application requires its backend, frontend, database, and CodeBERT services to be running. Once the application is running, users can access it through the web interface.',
  },
  {
    question: 'How can I get started with PlagShield?',
    answer:
      'Create an account or sign in to your existing account, then access the dashboard to begin analyzing code submissions.',
  },
];

const FAQ = ({ embedded = false }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [question, setQuestion] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();

    if (!question.trim()) {
      return;
    }

    console.log('User question:', question);

    setQuestionSubmitted(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#0F172A]">

      {!embedded && <PublicNavbar />}

      <main className="w-full">

        {/* HERO */}

        <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-6 sm:pb-14 sm:pt-20">

          <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[650px] -translate-x-1/2 rounded-full bg-[#EFF6FF] opacity-70 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <HelpCircle size={34} />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
              Frequently Asked Questions
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#64748B] sm:text-lg">
              Everything you need to know about PlagShield,
              code plagiarism detection, and how the platform works.
            </p>

          </div>

        </section>


        {/* ASK A QUESTION */}

        <section className="px-4 pb-10 sm:px-6">

          <div className="mx-auto max-w-4xl">

            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:p-8">

              <div className="text-center">

                <h2 className="text-xl font-semibold text-[#0F172A] sm:text-2xl">
                  Have a Question?
                </h2>

                <p className="mt-2 text-sm text-[#64748B] sm:text-base">
                  Can't find what you're looking for?
                  Ask your question below.
                </p>

              </div>


              {/* QUESTION FORM */}

              <form
                onSubmit={handleQuestionSubmit}
                className="mt-6"
              >

                <div className="flex flex-col gap-3 sm:flex-row">

                  <input
                    type="text"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      setQuestionSubmitted(false);
                    }}
                    placeholder="Type your question here..."
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
                  />

                  <button
                    type="submit"
                    disabled={!question.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={17} />
                    Ask Question
                  </button>

                </div>

              </form>


              {/* QUESTION SUBMITTED */}

              {questionSubmitted && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-[#EFF6FF] px-4 py-3 text-sm text-[#2563EB]">
                  Thanks for your question! Our team will review it
                  and provide an answer.
                </div>
              )}

            </div>

          </div>

        </section>


        {/* FAQ QUESTIONS */}

        <section className="px-4 pb-24 sm:px-6">

          <div className="mx-auto max-w-4xl">

            <h2 className="mb-6 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Common Questions
            </h2>


            <div className="space-y-3">

              {faqs.map((faq, index) => {

                const isOpen = openIndex === index;

                return (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                      isOpen
                        ? 'border-[#BFDBFE] shadow-sm'
                        : 'border-[#E2E8F0]'
                    } bg-white`}
                  >

                    {/* QUESTION */}

                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-[#F8FAFC]"
                      aria-expanded={isOpen}
                    >

                      <span
                        className={`text-sm font-medium sm:text-base ${
                          isOpen
                            ? 'text-[#2563EB]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={20}
                        className={`flex-shrink-0 text-[#2563EB] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      />

                    </button>


                    {/* ANSWER */}

                    {isOpen && (
                      <div className="px-5 pb-5 text-sm leading-7 text-[#64748B]">

                        <div className="border-t border-[#E2E8F0] pt-1">

                          <p className="pt-4">
                            {faq.answer}
                          </p>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>


            {/* CONTACT CTA */}

            <div className="mt-12 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-7 text-center sm:p-9">

              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <ShieldCheck size={22} />
              </div>

              <h2 className="text-xl font-semibold text-[#0F172A]">
                Still have questions?
              </h2>

              <p className="mt-2 text-sm text-[#64748B]">
                If you need more information about PlagShield,
                feel free to get in touch with us.
              </p>

              <a
                href="/contact"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8]"
              >
                Contact Us
              </a>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default FAQ;