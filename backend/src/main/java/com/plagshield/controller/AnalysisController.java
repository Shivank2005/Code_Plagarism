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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

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

    @GetMapping("/{batchId}/files")
    public ResponseEntity<?> getBatchFiles(@PathVariable String batchId) {
        return batchRepository.findById(batchId)
                .map(batch -> {
                    Path batchPath = Paths.get(batch.getStoragePath());
                    if (!Files.exists(batchPath)) {
                        return ResponseEntity.ok(Map.of("files", Collections.emptyList()));
                    }

                    List<Map<String, String>> files = new ArrayList<>();
                    try (Stream<Path> pathStream = Files.walk(batchPath)) {
                        pathStream
                                .filter(Files::isRegularFile)
                                .filter(this::isLikelyCodeFile)
                                .forEach(path -> {
                                    try {
                                        long size = Files.size(path);
                                        if (size > 300_000) {
                                            return;
                                        }
                                        String relativeId = batchPath.relativize(path).toString().replace('\\', '/');
                                        String content = Files.readString(path);
                                        files.add(Map.of("id", relativeId, "code", content));
                                    } catch (Exception ignored) {
                                    }
                                });
                    } catch (IOException e) {
                        return ResponseEntity.internalServerError().body(Map.of("error", "Failed to read batch files"));
                    }

                    return ResponseEntity.ok(Map.of("files", files));
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

    private boolean isLikelyCodeFile(Path path) {
        String name = path.getFileName().toString().toLowerCase(Locale.ROOT);
        return name.endsWith(".java") ||
                name.endsWith(".py") ||
                name.endsWith(".js") ||
                name.endsWith(".jsx") ||
                name.endsWith(".ts") ||
                name.endsWith(".tsx") ||
                name.endsWith(".cpp") ||
                name.endsWith(".c") ||
                name.endsWith(".h") ||
                name.endsWith(".cs") ||
            name.endsWith(".rb") ||
            name.endsWith(".php") ||
                name.endsWith(".kt") ||
                name.endsWith(".go") ||
                name.endsWith(".rs") ||
                name.endsWith(".swift") ||
                name.endsWith(".scala");
    }
}
