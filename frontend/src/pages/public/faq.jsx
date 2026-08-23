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

const FAQ = () => {
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
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <PublicNavbar />


      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-14">

        <div className="max-w-4xl mx-auto text-center">

          {/* Icon */}

          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--accent-muted)',
              color: 'var(--accent-light)',
            }}
          >
            <HelpCircle size={34} />
          </div>


          {/* Heading */}

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Frequently Asked Questions
          </h1>


          {/* Description */}

          <p
            className="mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Everything you need to know about PlagShield,
            code plagiarism detection, and how the platform works.
          </p>

        </div>

      </section>


      {/* =====================================================
          ASK A QUESTION
      ====================================================== */}

      <section className="px-4 sm:px-6 pb-10">

        <div className="max-w-4xl mx-auto">

          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              borderColor: 'var(--border-default)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >

            <div className="text-center">

              <h2 className="text-xl sm:text-2xl font-semibold">
                Have a Question?
              </h2>

              <p
                className="mt-2 text-sm sm:text-base"
                style={{
                  color: 'var(--text-secondary)',
                }}
              >
                Can't find what you're looking for?
                Ask your question below.
              </p>

            </div>


            {/* Question Form */}

            <form
              onSubmit={handleQuestionSubmit}
              className="mt-6"
            >

              <div className="flex flex-col sm:flex-row gap-3">

                <input
                  type="text"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    setQuestionSubmitted(false);
                  }}
                  placeholder="Type your question here..."
                  className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />

                <button
                  type="submit"
                  disabled={!question.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <Send size={17} />
                  Ask Question
                </button>

              </div>

            </form>


            {/* Question Submitted Message */}

            {questionSubmitted && (
              <div
                className="mt-4 rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: 'rgba(99, 102, 241, 0.35)',
                  background: 'var(--accent-muted)',
                  color: 'var(--accent-light)',
                }}
              >
                Thanks for your question! Our team will review it
                and provide an answer.
              </div>
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          FAQ QUESTIONS
      ====================================================== */}

      <section className="px-4 sm:px-6 pb-24">

        <div className="max-w-4xl mx-auto">

          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Common Questions
          </h2>


          <div className="space-y-3">

            {faqs.map((faq, index) => {

              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="rounded-xl border overflow-hidden transition-all duration-200"
                  style={{
                    borderColor: 'var(--border-default)',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >

                  {/* Question */}

                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-5"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                    aria-expanded={isOpen}
                  >

                    <span className="font-medium text-sm sm:text-base">
                      {faq.question}
                    </span>


                    <ChevronDown
                      size={20}
                      className="flex-shrink-0 transition-transform duration-200"
                      style={{
                        color: 'var(--accent-light)',
                        transform: isOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    />

                  </button>


                  {/* Answer */}

                  {isOpen && (
                    <div
                      className="px-5 pb-5 text-sm leading-7"
                      style={{
                        color: 'var(--text-secondary)',
                      }}
                    >

                      <div
                        className="pt-1 border-t"
                        style={{
                          borderColor: 'var(--border-default)',
                        }}
                      >

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


          {/* =================================================
              CONTACT CTA
          ================================================== */}

          <div
            className="mt-12 rounded-2xl border p-7 sm:p-9 text-center"
            style={{
              borderColor: 'var(--border-default)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >

            <div
              className="w-11 h-11 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--accent-muted)',
                color: 'var(--accent-light)',
              }}
            >
              <ShieldCheck size={22} />
            </div>


            <h2 className="text-xl font-semibold">
              Still have questions?
            </h2>


            <p
              className="mt-2 text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              If you need more information about PlagShield,
              feel free to get in touch with us.
            </p>


            <a
              href="/contact"
              className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              Contact Us
            </a>

          </div>

        </div>

      </section>

    </div>
  );
};

export default FAQ;