import React from 'react';
import { usePlagShield } from '../../hooks/PlagShieldContext';
import DiffViewer from '../../components/DiffViewer';
import { GitCompare } from 'lucide-react';

export default function ComparePage() {
  const { batchFiles, results, semanticResults, selectedSuspiciousPair } = usePlagShield();
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <GitCompare className="text-[var(--accent)]" size={24} /> Code Comparison
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Side-by-side semantic token investigation and AI deep scan.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DiffViewer
          files={batchFiles}
          results={results}
          semanticData={semanticResults}
          selectedPair={selectedSuspiciousPair}
        />
      </div>
    </div>
  );
}
