import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import SimilarityGraph from '../SimilarityGraph';

const GraphView = ({ semanticResults, isSemanticLoading }) => {
  return (
    <motion.div
      key="graph"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {isSemanticLoading && (
        <div className="card-flat flex items-center gap-2 p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 className="animate-spin shrink-0" size={16} style={{ color: 'var(--accent-light)' }} />
          Generating CodeBERT embeddings and graph topology...
        </div>
      )}
      <SimilarityGraph data={semanticResults} />
    </motion.div>
  );
};

export default GraphView;