package com.plagshield.service;

import com.plagshield.model.EvaluationResult;
import com.plagshield.model.PlagiarismResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class EvaluationService {

    /**
     * Calculates Precision, Recall, F1-score, and confusion matrix.
     * @param results The actual predictions made by the system.
     * @param threshold The threshold above which a prediction is considered positive.
     * @param groundTruthPlagiarizedPairs A set of string representations (e.g. "studentA,studentB") of known plagiarized pairs.
     * @param totalPossiblePairs Total number of unique pairs evaluated.
     * @return EvaluationResult containing the metrics.
     */
    public EvaluationResult evaluateModel(List<PlagiarismResult> results, double threshold, Set<String> groundTruthPlagiarizedPairs, int totalPossiblePairs) {
        int truePositives = 0;
        int falsePositives = 0;
        
        for (PlagiarismResult res : results) {
            boolean isPredictedPositive = res.getSimilarityScore() >= threshold;
            String subA = res.getSubmissionA();
            String subB = res.getSubmissionB();
            
            if (subA == null || subB == null) continue;
            
            boolean isActuallyPositive = false;
            for (String pair : groundTruthPlagiarizedPairs) {
                String[] parts = pair.split(",");
                if (parts.length == 2) {
                    String g1 = parts[0].trim();
                    String g2 = parts[1].trim();
                    if (g1.isEmpty() || g2.isEmpty()) continue;
                    // Robust check: matches if DB path ends with the user's provided filename
                    if ((subA.endsWith(g1) && subB.endsWith(g2)) || (subA.endsWith(g2) && subB.endsWith(g1))) {
                        isActuallyPositive = true;
                        break;
                    }
                }
            }
            
            if (isPredictedPositive) {
                if (isActuallyPositive) {
                    truePositives++;
                } else {
                    falsePositives++;
                }
            }
        }
        
        int falseNegatives = groundTruthPlagiarizedPairs.size() - truePositives;
        int trueNegatives = totalPossiblePairs - (truePositives + falsePositives + falseNegatives);
        
        double precision = (truePositives + falsePositives) == 0 ? 0.0 : (double) truePositives / (truePositives + falsePositives);
        double recall = (truePositives + falseNegatives) == 0 ? 0.0 : (double) truePositives / (truePositives + falseNegatives);
        double f1Score = (precision + recall) == 0 ? 0.0 : 2 * (precision * recall) / (precision + recall);
        
        EvaluationResult eval = new EvaluationResult();
        eval.setTruePositives(truePositives);
        eval.setFalsePositives(falsePositives);
        eval.setTrueNegatives(trueNegatives);
        eval.setFalseNegatives(falseNegatives);
        eval.setPrecision(precision);
        eval.setRecall(recall);
        eval.setF1Score(f1Score);
        
        return eval;
    }
}
