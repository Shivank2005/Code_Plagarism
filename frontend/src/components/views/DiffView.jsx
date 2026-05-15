import React from 'react';
import { motion } from 'framer-motion';
import DiffViewer from '../DiffViewer';

const DiffView = ({ batchFiles, semanticResults, selectedSuspiciousPair }) => {
  return (
    <motion.div
      key="diff"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <DiffViewer files={batchFiles} semanticData={semanticResults} selectedPair={selectedSuspiciousPair} />
    </motion.div>
  );
};

export default DiffView;