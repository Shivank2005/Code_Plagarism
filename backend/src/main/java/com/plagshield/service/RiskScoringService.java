package com.plagshield.service;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.File;

@Service
public class RiskScoringService {
    public double calculateFinalRiskScore(double tokenScore, double structuralScore, double semanticScore) {
        if (tokenScore > 99.0 && structuralScore > 99.0 && semanticScore > 99.0) {
            return 100.0;
        }
        if (tokenScore < 5.0 && structuralScore < 5.0 && semanticScore < 5.0) {
            return 0.0;
        }

        // Weights: JPlag GST and AST tree parser are the reliable engines.
        // CodeBERT (microsoft/codebert-base) was trained for masked language
        // modeling, not code similarity — after centering it clusters by
        // LANGUAGE not ALGORITHM.  Keep it as a minor tiebreaker only.
        double tokenWeight = 0.45;
        double structWeight = 0.45;
        double semanticWeight = 0.10;

        double score = (tokenScore * tokenWeight) + (structuralScore * structWeight) + (semanticScore * semanticWeight);
        
        // Disagreement penalty: if token and structural strongly disagree,
        // dampen the score to prevent false positives from shared boilerplate
        double tsMax = Math.max(tokenScore, structuralScore);
        double tsMin = Math.min(tokenScore, structuralScore);
        if (tsMax - tsMin > 50.0) {
            score = score * 0.85;
        }
        
        // Sharpen the score to push borderline cases towards clear risk categories
        double sharpened = 100.0 / (1.0 + Math.exp(-0.12 * (score - 50.0)));
        return Math.max(0.0, Math.min(100.0, sharpened));
    }

    public String classifyRisk(double finalScore) {
        if (finalScore >= 75) return "HIGH";
        if (finalScore >= 40) return "MEDIUM";
        return "LOW";
    }
}
