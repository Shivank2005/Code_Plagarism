package com.plagshield.service;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.model.PlagiarismResult;
import com.plagshield.repository.AnalysisBatchRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AnalysisService {

    @Autowired
    private AnalysisBatchRepository batchRepository;


    @Autowired
    private StructuralAnalyzer structuralAnalyzer;

    @Autowired
    private RiskScoringService riskScoringService;

    @Autowired
    private JPlagService jPlagService;

    @Async
    public void startAnalysis(String batchId) {
        AnalysisBatch batch = batchRepository.findById(batchId).orElseThrow();
        batch.setStatus("PROCESSING");
        batchRepository.save(batch);

        try {
            Path path = Paths.get(batch.getStoragePath());
            List<Path> files = new ArrayList<>();
            try (Stream<Path> stream = Files.walk(path)) {
                files = stream.filter(Files::isRegularFile).collect(Collectors.toList());
            }

            List<Map<String, String>> submissions = new ArrayList<>();
            Map<String, String> originalCodes = new HashMap<>();
            
            for (Path file : files) {
                String content = Files.readString(file);
                String fileName = file.getFileName().toString();
                String normalizedContent = structuralAnalyzer.normalizeCode(content);
                
                Map<String, String> sub = new HashMap<>();
                sub.put("id", fileName);
                sub.put("code", normalizedContent);
                submissions.add(sub);
                
                originalCodes.put(fileName, content);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("submissions", submissions);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity("http://localhost:8090/api/embeddings/similarity-matrix", request, Map.class);
            
            List<PlagiarismResult> results = new ArrayList<>();
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<List<Number>> matrix = (List<List<Number>>) response.getBody().get("matrix");
                List<String> students = (List<String>) response.getBody().get("students");

                for (int i = 0; i < students.size(); i++) {
                    for (int j = i + 1; j < students.size(); j++) {
                        double semanticScore = matrix.get(i).get(j).doubleValue();
                        String studentA = students.get(i);
                        String studentB = students.get(j);
                        
                        double structuralScore = structuralAnalyzer.calculateStructuralSimilarity(
                            originalCodes.get(studentA), 
                            originalCodes.get(studentB)
                        );
                        
                        double tokenScore = jPlagService.calculateTokenSimilarity(
                            originalCodes.get(studentA), 
                            originalCodes.get(studentB)
                        );
                        
                        double finalScore = riskScoringService.calculateFinalRiskScore(tokenScore, structuralScore, semanticScore);
                        
                        PlagiarismResult result = new PlagiarismResult();
                        result.setSubmissionA(studentA);
                        result.setSubmissionB(studentB);
                        result.setSimilarityScore(finalScore);
                        results.add(result);
                    }
                }
            } else {
                throw new RuntimeException("CodeBERT semantic analysis failed.");
            }

            batch.setResults(results);
            batch.setStatus("COMPLETED");

        } catch (Exception e) {
            batch.setStatus("FAILED");
            e.printStackTrace();
        } finally {
            batchRepository.save(batch);
        }
    }
}
