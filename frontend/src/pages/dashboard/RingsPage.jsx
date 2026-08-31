import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import RingsView from '../../components/views/RingsView';
import { Activity, Network } from 'lucide-react';

export default function RingsPage() {
  let ctx;
  try {
    ctx = usePlagShield();
  } catch(e) {
    return (
      <div className="card p-12 text-center">
        <p className="text-[var(--text-primary)] font-bold">Context unavailable</p>
        <p className="text-sm text-[var(--text-secondary)] mt-2">{e.message}</p>
      </div>
    );
  }

  const { 
    results, 
    riskThreshold = 75, 
    suspiciousThreshold = 40, 
    normalizedRings = [],
    getPairScore
  } = ctx;

  if (!results) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center">
        <Activity size={48} className="text-[var(--text-tertiary)] mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">No Analysis Results</h2>
        <p className="text-[var(--text-secondary)] mt-2">Open an investigation from the Analysis Library to view rings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Network className="text-[var(--accent)]" size={24} /> Plagiarism Rings
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Identify coordinated cheating rings and highly suspicious clusters.
        </p>
      </div>

      <RingsView
        results={results}
        normalizedRings={normalizedRings}
        getPairScore={getPairScore}
        riskThreshold={riskThreshold}
        suspiciousThreshold={suspiciousThreshold}
      />
    </div>
  );
}
