import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Settings2,
  Code2,
  GitBranch,
  Brain,
  BarChart3,
  FileCheck2,
  ArrowDown,
  ShieldCheck,
} from 'lucide-react';
import PublicNavbar from '../../components/public/PublicNavbar';

const HowItWorks = () => {
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
              How PlagShield Works
            </div>

            <h1 className="text-5xl font-bold tracking-tight">
              From Code Upload
              <br />
              <span style={{ color: 'var(--accent-light)' }}>
                to Similarity Analysis
              </span>
            </h1>

            <p
              className="max-w-2xl mx-auto mt-6 text-lg leading-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              PlagShield processes source-code submissions through
              multiple analysis stages to identify potentially similar
              code.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Workflow */}
      <section
        className="border-t border-[var(--border-default)]"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-16">

          <WorkflowStep
            number="01"
            icon={Upload}
            title="Upload Code Submissions"
            description="Users upload multiple source-code submissions for analysis. The system collects and prepares the submitted files for comparison."
          />

          <StepArrow />

          <WorkflowStep
            number="02"
            icon={Settings2}
            title="Code Preprocessing"
            description="The submitted source code is prepared for analysis. Depending on the selected approach, the system extracts tokens, structural information, or code chunks."
          />

          <StepArrow />

          {/* Three approaches */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-7"
          >
            <div className="flex items-center gap-4 mb-7">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--accent-muted)',
                  color: 'var(--accent-light)',
                }}
              >
                <Code2 size={23} />
              </div>

              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent-light)' }}
                >
                  Step 03
                </p>

                <h2 className="text-xl font-bold">
                  Multiple Similarity Approaches
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              <MiniApproach
                icon={Code2}
                title="Token-Based"
                text="Compares source-code tokens to identify similar code patterns."
              />

              <MiniApproach
                icon={GitBranch}
                title="Structural"
                text="Examines programming structures and their relationships."
              />

              <MiniApproach
                icon={Brain}
                title="Semantic / AI"
                text="Uses CodeBERT embeddings to compare semantic representations."
              />

            </div>
          </motion.div>

          <StepArrow />

          <WorkflowStep
            number="04"
            icon={BarChart3}
            title="Similarity Calculation"
            description="The outputs from the analysis techniques are converted into similarity scores between the submitted programs."
          />

          <StepArrow />

          <WorkflowStep
            number="05"
            icon={FileCheck2}
            title="Results & Visualization"
            description="The results are presented through similarity matrices, suspicious pairs, graphs, reports, and detailed code comparisons."
          />

        </div>
      </section>

      {/* Bottom summary */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-16">

          <div
            className="rounded-2xl p-8 md:p-10 text-center border"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold">
              One platform. Multiple ways to detect similarity.
            </h2>

            <p
              className="max-w-2xl mx-auto mt-4 leading-7"
              style={{ color: 'var(--text-secondary)' }}
            >
              PlagShield combines different perspectives of source-code
              analysis to provide a more comprehensive view of similarity
              between submissions.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

const WorkflowStep = ({
  number,
  icon: Icon,
  title,
  description,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-7"
    >
      <div className="flex items-start gap-5">

        <div
          className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'var(--accent-muted)',
            color: 'var(--accent-light)',
          }}
        >
          <Icon size={22} />
        </div>

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'var(--accent-light)' }}
          >
            Step {number}
          </p>

          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <p
            className="mt-2 text-sm leading-7"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </p>
        </div>

      </div>
    </motion.div>
  );
};

const StepArrow = () => {
  return (
    <div className="flex justify-center py-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--accent-muted)',
          color: 'var(--accent-light)',
        }}
      >
        <ArrowDown size={18} />
      </div>
    </div>
  );
};

const MiniApproach = ({ icon: Icon, title, text }) => {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <Icon
        size={20}
        style={{ color: 'var(--accent-light)' }}
      />

      <h3 className="font-semibold mt-3">
        {title}
      </h3>

      <p
        className="text-sm leading-6 mt-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {text}
      </p>
    </div>
  );
};

export default HowItWorks;