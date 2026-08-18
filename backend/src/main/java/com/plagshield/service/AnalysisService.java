package com.plagshield.service;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.model.PlagiarismResult;
import com.plagshield.repository.AnalysisBatchRepository;
import com.plagshield.repository.PlagiarismResultRepository;

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
    private PlagiarismResultRepository resultRepository;


    @Autowired
    private StructuralAnalyzer structuralAnalyzer;

    @Autowired
    private RiskScoringService riskScoringService;

    @Autowired
    private JPlagService jPlagService;
    
    @Autowired
    private PreFilterService preFilterService;

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
                
                Map<String, String> sub = new HashMap<>();
                sub.put("id", fileName);
                // Send ORIGINAL code to CodeBERT — it needs real variable names,
                // comments, and strings to understand semantic meaning.
                // Sending normalized code strips all that away and makes
                // unrelated Java files look identical to the model.
                sub.put("code", content);
                submissions.add(sub);
                
                originalCodes.put(fileName, content);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("submissions", submissions);

            List<List<Number>> matrix = null;
            List<String> students = new ArrayList<>();
            for (Map<String, String> sub : submissions) {
                students.add(sub.get("id"));
            }
            boolean codebertSuccess = false;

            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity("http://localhost:8090/api/embeddings/similarity-matrix", request, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    matrix = (List<List<Number>>) response.getBody().get("matrix");
                    students = (List<String>) response.getBody().get("students");
                    codebertSuccess = true;
                }
            } catch (Exception e) {
                System.err.println("CodeBERT unavailable or failed. Falling back to local analysis only: " + e.getMessage());
            }

            final List<String> finalStudents = students;
            final List<List<Number>> finalMatrix = matrix;
            final boolean finalCodebertSuccess = codebertSuccess;

            // Generate all pairs
            List<int[]> pairs = new ArrayList<>();
            for (int i = 0; i < finalStudents.size(); i++) {
                for (int j = i + 1; j < finalStudents.size(); j++) {
                    pairs.add(new int[]{i, j});
                }
            }

            // Process pairs in parallel
            // --- GLOBAL DF FILTERING (FIRST PASS) ---
            Map<String, java.util.Set<String>> fileWords = new java.util.HashMap<>();
            for (String student : finalStudents) {
                fileWords.put(student, preFilterService.extractWords(originalCodes.get(student)));
            }
            java.util.Set<String> globalBoilerplate = preFilterService.calculateBoilerplate(fileWords.values());
            // ----------------------------------------

            List<PlagiarismResult> results = pairs.parallelStream()
                    .map(pair -> {
                        int i = pair[0];
                        int j = pair[1];
                        String studentA = finalStudents.get(i);
                        String studentB = finalStudents.get(j);

                        String codeA = originalCodes.get(studentA);
                        String codeB = originalCodes.get(studentB);

                        PreFilterService.FilterResult filterResult = preFilterService.shouldDeepScan(
                                fileWords.get(studentA), 
                                fileWords.get(studentB), 
                                globalBoilerplate
                        );

                        if (!filterResult.shouldScan) {
                            PlagiarismResult result = new PlagiarismResult();
                            result.setBatchId(batchId);
                            result.setSubmissionA(studentA);
                            result.setSubmissionB(studentB);
                            result.setSimilarityScore(0.0);
                            result.setTokenScore(0.0);
                            result.setStructuralScore(0.0);
                            result.setSemanticScore(0.0);
                            result.setBoilerplateRemovedCount(filterResult.boilerplateRemoved);
                            return result;
                        }

                        double semanticScore = 0.0;
                        if (finalCodebertSuccess && finalMatrix != null) {
                            semanticScore = finalMatrix.get(i).get(j).doubleValue();
                        }

                        String extA = studentA.contains(".") ? studentA.substring(studentA.lastIndexOf(".") + 1).toLowerCase() : "txt";
                        String extB = studentB.contains(".") ? studentB.substring(studentB.lastIndexOf(".") + 1).toLowerCase() : "txt";

                        double structuralScore = structuralAnalyzer.calculateStructuralSimilarity(codeA, codeB, extA, extB);
                        double tokenScore = jPlagService.calculateTokenSimilarity(codeA, codeB, extA, extB);

                        boolean isCrossLanguage = !extA.isEmpty() && !extA.equalsIgnoreCase(extB);
                        
                        String languagePair;
                        if (extA.compareTo(extB) <= 0) {
                            languagePair = extA + "-" + extB;
                        } else {
                            languagePair = extB + "-" + extA;
                        }

                        RiskScoringService.RiskResult finalScore = riskScoringService.calculateFinalRiskScore(tokenScore, structuralScore, semanticScore, isCrossLanguage, languagePair);

                        PlagiarismResult result = new PlagiarismResult();
                        result.setBatchId(batchId);
                        result.setSubmissionA(studentA);
                        result.setSubmissionB(studentB);
                        result.setSimilarityScore(finalScore.score);
                        result.setTokenScore(tokenScore);
                        result.setStructuralScore(structuralScore);
                        result.setSemanticScore(semanticScore);
                        result.setBoilerplateRemovedCount(filterResult.boilerplateRemoved);
                        result.setConfidenceScore(finalScore.confidence);
                        return result;
                }).collect(Collectors.toList());

            // Save results to repository
            resultRepository.saveAll(results);

            if (codebertSuccess) {
                batch.setStatus("COMPLETED");
            } else {
                batch.setStatus("COMPLETED_WITH_WARNINGS");
            }

        } catch (Exception e) {
            batch.setStatus("FAILED");
            e.printStackTrace();
        } finally {
            batchRepository.save(batch);
        }
    }
}
