package com.plagshield.service;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.File;

@Service
public class RiskScoringService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Aggregates different similarity scores into a final weighted Risk Score via ML.
     * 
     * @param tokenScore From JPlag
     * @param structuralScore From StructuralAnalyzer
     * @param semanticScore From Semantic Python Service
     * @return Final Risk Score (0-100)
     */
    public double calculateFinalRiskScore(double tokenScore, double structuralScore, double semanticScore) {
        try {
            // Find scripts directory
            String basePath = new File("").getAbsolutePath();
            String scriptPath = basePath + File.separator + "scripts" + File.separator + "ml_classifier.py";
            
            ProcessBuilder processBuilder = new ProcessBuilder("python", scriptPath, 
                String.valueOf(tokenScore), 
                String.valueOf(structuralScore), 
                String.valueOf(semanticScore));
                
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }
            
            process.waitFor();
            
            String jsonOutput = output.toString().trim();
            if (jsonOutput.contains("ml_risk_score")) {
                JsonNode rootNode = objectMapper.readTree(jsonOutput);
                return rootNode.get("ml_risk_score").asDouble();
            }
            
            // Fallback if python script fails
            return fallbackScore(tokenScore, structuralScore, semanticScore);
            
        } catch (Exception e) {
            System.err.println("Error calling ML Classifier: " + e.getMessage());
            return fallbackScore(tokenScore, structuralScore, semanticScore);
        }
    }

    private double fallbackScore(double tokenScore, double structuralScore, double semanticScore) {
        double tokenWeight = 0.33;
        double structuralWeight = 0.33;
        double semanticWeight = 0.34;
        return (tokenScore * tokenWeight) + (structuralScore * structuralWeight) + (semanticScore * semanticWeight);
    }

    public String classifyRisk(double finalScore) {
        if (finalScore >= 75) return "HIGH";
        if (finalScore >= 40) return "MEDIUM";
        return "LOW";
    }
}
