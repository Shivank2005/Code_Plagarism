import React from 'react';
import { motion } from 'framer-motion';
import DiffViewer from '../DiffViewer';

const DiffView = ({ batchFiles, results, semanticResults, selectedSuspiciousPair }) => {
  return (
    <motion.div
      key="diff"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <DiffViewer files={batchFiles} results={results} semanticData={semanticResults} selectedPair={selectedSuspiciousPair} />
    </motion.div>
  );
};

export default DiffView;