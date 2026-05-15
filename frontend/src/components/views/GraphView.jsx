import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import SimilarityGraph from '../SimilarityGraph';

const GraphView = ({ semanticResults, isSemanticLoading }) => {
  return (
    <motion.div
      key="graph"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {isSemanticLoading && (
        <div className="glass-card rounded-2xl border-cyan-300/30 p-4 text-sm text-cyan-100">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin text-cyan-300" size={16} /> Generating CodeBERT embeddings and graph topology...
          </div>
        </div>
      )}
      <SimilarityGraph data={semanticResults} />
    </motion.div>
  );
};

export default GraphView;