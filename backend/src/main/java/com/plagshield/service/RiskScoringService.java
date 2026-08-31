package com.plagshield.service;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Service
public class RiskScoringService {

    private double semanticWeight = 0.15;

    public static class RiskResult {
        public double score;
        public double confidence;
        public RiskResult(double score, double confidence) {
            this.score = score;
            this.confidence = confidence;
        }
    }

    public RiskResult calculateFinalRiskScore(double tokenScore, double structuralScore, double semanticScore, boolean isCrossLanguage, String languagePair) {
        if (tokenScore > 99.0 && structuralScore > 99.0 && semanticScore > 99.0) {
            return new RiskResult(100.0, 99.0);
        }
        if (tokenScore < 5.0 && structuralScore < 5.0 && semanticScore < 5.0) {
            return new RiskResult(0.0, 99.0);
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("tokenScore", tokenScore);
            payload.put("structuralScore", structuralScore);
            payload.put("semanticScore", semanticScore);
            payload.put("isCrossLanguage", isCrossLanguage ? 1 : 0);
            payload.put("languagePair", languagePair);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity("http://localhost:8090/api/ml/predict", request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                double riskScore = ((Number) response.getBody().get("riskScore")).doubleValue();
                double confidence = ((Number) response.getBody().get("confidence")).doubleValue();
                return new RiskResult(riskScore, confidence);
            }
        } catch (Exception e) {
            // Fallback to hardcoded math if Python ML service is down
        }

        // Hardcoded fallback logic
        double tokenWeight = (1.0 - semanticWeight) / 2.0;
        double structWeight = (1.0 - semanticWeight) / 2.0;

        double score = (tokenScore * tokenWeight) + (structuralScore * structWeight) + (semanticScore * semanticWeight);
        
        double tsMax = Math.max(tokenScore, structuralScore);
        double tsMin = Math.min(tokenScore, structuralScore);
        if (tsMax - tsMin > 50.0) {
            score = score * 0.85;
        }
        
        double sharpened = 100.0 / (1.0 + Math.exp(-0.12 * (score - 50.0)));
        double finalScore = Math.max(0.0, Math.min(100.0, sharpened));
        
        // Fallback confidence is derived from agreement between subscores
        double disagreement = Math.abs(tokenScore - structuralScore) / 100.0;
        double confidence = (1.0 - disagreement) * 100.0;
        
        return new RiskResult(finalScore, confidence);
    }
}
