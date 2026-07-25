import React, { useState } from 'react';
import { FileCheck2 } from 'lucide-react';

const EvaluationView = ({ activeBatch, evaluateModel, evaluationResults }) => {
  const [batchId, setBatchId] = useState(activeBatch || '');
  const [threshold, setThreshold] = useState(75);
  const [groundTruth, setGroundTruth] = useState('');

  const handleEvaluate = () => {
    // Parse ground truth pairs from textarea
    const pairs = groundTruth
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.includes('-'));
    
    evaluateModel(batchId, threshold, pairs);
  };

  return (
    <div className="space-y-6">
      <section className="card p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <FileCheck2 size={24} style={{ color: 'var(--accent)' }} />
          <h2 className="page-title mb-0">Model Evaluation</h2>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="section-label block mb-1">Batch ID</label>
            <input 
              type="text" 
              className="input-field w-full" 
              value={batchId} 
              onChange={e => setBatchId(e.target.value)} 
              placeholder="Enter batch ID to evaluate" 
            />
          </div>

          <div>
            <label className="section-label block mb-1">Threshold: {threshold}%</label>
            <input 
              type="range" 
              className="w-full" 
              min="0" 
              max="100" 
              value={threshold} 
              onChange={e => setThreshold(Number(e.target.value))} 
            />
          </div>

          <div>
            <label className="section-label block mb-1">Ground Truth Pairs</label>
            <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Enter known plagiarized pairs, one per line (format: fileA-fileB).
            </p>
            <textarea 
              className="input-field w-full h-32 resize-y" 
              value={groundTruth} 
              onChange={e => setGroundTruth(e.target.value)} 
              placeholder="a.py-b.py&#10;test1.cpp-test2.cpp"
            />
          </div>

          <button className="btn-primary w-full justify-center mt-2" onClick={handleEvaluate} disabled={!batchId || !groundTruth}>
            Run Evaluation
          </button>
        </div>
      </section>

      {evaluationResults && (
        <section className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
          <div className="card-flat p-5 flex flex-col items-center justify-center">
            <p className="section-label text-center">Precision</p>
            <p className="mt-2 text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {(evaluationResults.precision * 100).toFixed(1)}%
            </p>
          </div>
          <div className="card-flat p-5 flex flex-col items-center justify-center">
            <p className="section-label text-center">Recall</p>
            <p className="mt-2 text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {(evaluationResults.recall * 100).toFixed(1)}%
            </p>
          </div>
          <div className="card-flat p-5 flex flex-col items-center justify-center">
            <p className="section-label text-center">F1-Score</p>
            <p className="mt-2 text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {(evaluationResults.f1Score * 100).toFixed(1)}%
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default EvaluationView;
