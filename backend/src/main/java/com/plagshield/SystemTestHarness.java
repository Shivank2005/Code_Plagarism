package com.plagshield;

import com.plagshield.model.PlagiarismResult;
import com.plagshield.service.*;
import java.util.*;

public class SystemTestHarness {
    public static void main(String[] args) {
        System.out.println("=== PLAGSHIELD SYSTEM TEST HARNESS ===\n");

        // 1. Test Structural Analyzer
        StructuralAnalyzer sa = new StructuralAnalyzer();
        String code1 = "public class A { void run() { for(int i=0; i<10; i++) { } } }";
        String code2 = "class B { void start() { for(int x=0; x<10; x++) { } } }";
        double structScore = sa.calculateStructuralSimilarity(code1, code2);
        System.out.println("[STRUCTURAL] Score: " + structScore + "%");

        // 2. Test Clustering Service (Plagiarism Ring Detection)
        ClusteringService cs = new ClusteringService();
        List<PlagiarismResult> results = new ArrayList<>();
        
        results.add(createResult("Alice", "Bob", 85.0));
        results.add(createResult("Bob", "Charlie", 90.0));
        results.add(createResult("Charlie", "Alice", 88.0)); // Plagiarism Ring: Alice-Bob-Charlie
        results.add(createResult("Dave", "Eve", 15.0));      // Low similarity
        
        List<Set<String>> clusters = cs.detectPlagiarismRings(results, 70.0);
        System.out.println("[CLUSTERING] Rings Found: " + clusters.size());
        for(Set<String> ring : clusters) {
            System.out.println(" - Ring: " + ring);
        }

        // 3. Test Risk Scoring
        RiskScoringService rss = new RiskScoringService();
        double finalScore = rss.calculateFinalRiskScore(80.0, structScore, 75.0);
        System.out.println("[RISK SCORE] Final: " + finalScore + " (" + rss.classifyRisk(finalScore) + ")");
    }

    private static PlagiarismResult createResult(String a, String b, double score) {
        PlagiarismResult res = new PlagiarismResult();
        res.setSubmissionA(a);
        res.setSubmissionB(b);
        res.setSimilarityScore(score);
        return res;
    }
}
