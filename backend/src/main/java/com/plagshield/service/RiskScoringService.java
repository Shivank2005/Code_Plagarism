package com.plagshield.service;

public class RiskScoringService {

    /**
     * Aggregates different similarity scores into a final weighted Risk Score.
     * 
     * @param tokenScore From JPlag
     * @param structuralScore From StructuralAnalyzer
     * @param semanticScore From Semantic Python Service
     * @return Final Risk Score (0-100)
     */
    public double calculateFinalRiskScore(double tokenScore, double structuralScore, double semanticScore) {
        // Weights can be tuned based on industry benchmarks
        double tokenWeight = 0.50;      // JPlag is very reliable for exact/partial copies
        double structuralWeight = 0.30; // AST-like structure is good for logic duplication
        double semanticWeight = 0.20;   // AI/Semantic is good for completely rewritten code
        
        return (tokenScore * tokenWeight) + 
               (structuralScore * structuralWeight) + 
               (semanticScore * semanticWeight);
    }

    public String classifyRisk(double finalScore) {
        if (finalScore >= 75) return "HIGH";
        if (finalScore >= 40) return "MEDIUM";
        return "LOW";
    }
}
