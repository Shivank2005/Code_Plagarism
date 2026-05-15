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
            for (Path file : files) {
                String content = Files.readString(file);
                String fileName = file.getFileName().toString();
                Map<String, String> sub = new HashMap<>();
                sub.put("id", fileName);
                sub.put("code", content);
                submissions.add(sub);
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
                        double score = matrix.get(i).get(j).doubleValue();
                        PlagiarismResult result = new PlagiarismResult();
                        result.setSubmissionA(students.get(i));
                        result.setSubmissionB(students.get(j));
                        result.setSimilarityScore(score);
                        result.setBatch(batch);
                        results.add(result);
                    }
                }
            } else {
                throw new RuntimeException("CodeBERT semantic analysis failed.");
            }

            resultRepository.saveAll(results);
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
