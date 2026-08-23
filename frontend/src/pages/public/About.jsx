import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Code2,
  GitBranch,
  Brain,
  Target,
  Users,
} from 'lucide-react';
import PublicNavbar from '../../components/public/PublicNavbar';

const About = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 20%, rgba(99,102,241,0.15), transparent 45%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: 'var(--accent-muted)',
                color: 'var(--accent-light)',
              }}
            >
              <ShieldCheck size={16} />
              About PlagShield
            </div>

            <h1 className="text-5xl font-bold tracking-tight">
              Intelligent Source Code
              <br />
              <span style={{ color: 'var(--accent-light)' }}>
                Plagiarism Detection
              </span>
            </h1>

            <p
              className="max-w-3xl mx-auto mt-6 text-lg leading-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              PlagShield is a source-code analysis platform designed
              to identify similarities between code submissions using
              multiple complementary analysis techniques.
            </p>
          </motion.div>

        </div>
      </section>

      {/* What is PlagShield */}
      <section
        className="border-t border-[var(--border-default)]"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">

          <h2 className="text-3xl font-bold mb-5">
            What is PlagShield?
          </h2>

          <p
            className="max-w-4xl text-base leading-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            PlagShield compares source-code submissions and provides
            similarity information to help identify potentially
            copied or highly similar code. The platform combines
            token-based, structural, and semantic analysis to examine
            code from different perspectives.
          </p>

        </div>
      </section>

      {/* Three approaches */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-16">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">
              Multiple Analysis Approaches
            </h2>

            <p
              className="mt-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Different techniques provide different views of code similarity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">

            <InfoCard
              icon={Code2}
              title="Token-Based"
              text="Compares normalized source-code tokens to identify common code elements."
            />

            <InfoCard
              icon={GitBranch}
              title="Structural / AST-Based"
              text="Analyzes programming structures such as conditions, loops, declarations and control statements."
            />

            <InfoCard
              icon={Brain}
              title="Semantic / AI-Based"
              text="Uses CodeBERT embeddings to identify code that is semantically similar."
            />

          </div>

        </div>
      </section>

      {/* Goals */}
      <section
        className="border-t border-[var(--border-default)]"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">

          <div className="grid md:grid-cols-2 gap-8">

            <InfoCard
              icon={Target}
              title="Our Goal"
              text="Provide a clear and efficient platform for analyzing similarities between multiple source-code submissions."
            />

            <InfoCard
              icon={Users}
              title="Who Can Use It?"
              text="The platform can support students, educators and institutions in reviewing source-code similarity."
            />

          </div>

        </div>
      </section>

    </div>
  );
};

const InfoCard = ({ icon: Icon, title, text }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-6"
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
        style={{
          background: 'var(--accent-muted)',
          color: 'var(--accent-light)',
        }}
      >
        <Icon size={22} />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>

      <p
        className="text-sm leading-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        {text}
      </p>
    </motion.div>
  );
};

export default About;