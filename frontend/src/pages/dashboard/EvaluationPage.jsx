import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import EvaluationView from '../../components/views/EvaluationView';
import { ShieldCheck } from 'lucide-react';

export default function EvaluationPage() {
  const { activeBatch, evaluateModel, evaluationResults, results } = usePlagShield();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck className="text-[var(--accent)]" size={24} /> Model Evaluation
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Benchmark the detection engine against labeled ground truth.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)]">
        <EvaluationView
          activeBatch={activeBatch}
          evaluateModel={evaluateModel}
          evaluationResults={evaluationResults}
          results={results}
        />
      </div>
    </div>
  );
}
