package com.plagshield.controller;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.model.PlagiarismResult;
import com.plagshield.repository.AnalysisBatchRepository;
import com.plagshield.repository.PlagiarismResultRepository;
import com.plagshield.service.AnalysisService;
import com.plagshield.service.ClusteringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private AnalysisBatchRepository batchRepository;

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private ClusteringService clusteringService;

    @Autowired
    private PlagiarismResultRepository resultRepository;

    @PostMapping("/{batchId}/start")
    public ResponseEntity<?> startAnalysis(@PathVariable String batchId) {
        analysisService.startAnalysis(batchId);
        return ResponseEntity.ok(Map.of("message", "Analysis started"));
    }

    @GetMapping("/{batchId}/status")
    public ResponseEntity<AnalysisBatch> getStatus(@PathVariable String batchId) {
        return batchRepository.findById(batchId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{batchId}/results")
    public ResponseEntity<?> getResults(@PathVariable String batchId) {
        return batchRepository.findById(batchId)
                .map(batch -> {
                    List<PlagiarismResult> results = batch.getResults();
                    
                    // Generate Heatmap Data
                    Set<String> students = new HashSet<>();
                    for (PlagiarismResult r : results) {
                        students.add(r.getSubmissionA());
                        students.add(r.getSubmissionB());
                    }
                    
                    List<String> sortedStudents = new ArrayList<>(students);
                    Collections.sort(sortedStudents);
                    
                    double[][] matrix = new double[sortedStudents.size()][sortedStudents.size()];
                    for (int i = 0; i < sortedStudents.size(); i++) matrix[i][i] = 100.0;
                    
                    for (PlagiarismResult r : results) {
                        int idxA = sortedStudents.indexOf(r.getSubmissionA());
                        int idxB = sortedStudents.indexOf(r.getSubmissionB());
                        matrix[idxA][idxB] = r.getSimilarityScore();
                        matrix[idxB][idxA] = r.getSimilarityScore();
                    }
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("students", sortedStudents);
                    response.put("matrix", matrix);
                    response.put("rings", clusteringService.detectPlagiarismRings(results, 70.0));
                    response.put("status", batch.getStatus());
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<AnalysisBatch>> getHistory() {
        return ResponseEntity.ok(batchRepository.findAll());
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory() {
        resultRepository.deleteAll();
        batchRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "History cleared"));
    }
}
