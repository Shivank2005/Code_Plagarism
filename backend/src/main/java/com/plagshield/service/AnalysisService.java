package com.plagshield.service;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.model.PlagiarismResult;
import com.plagshield.repository.AnalysisBatchRepository;
import com.plagshield.repository.PlagiarismResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
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

            List<PlagiarismResult> results = new ArrayList<>();

            for (int i = 0; i < files.size(); i++) {
                for (int j = i + 1; j < files.size(); j++) {
                    Path fileA = files.get(i);
                    Path fileB = files.get(j);

                    String contentA = Files.readString(fileA);
                    String contentB = Files.readString(fileB);

                    double score = structuralAnalyzer.calculateStructuralSimilarity(contentA, contentB);

                    PlagiarismResult result = new PlagiarismResult();
                    result.setSubmissionA(fileA.getFileName().toString());
                    result.setSubmissionB(fileB.getFileName().toString());
                    result.setSimilarityScore(score);
                    result.setBatch(batch);
                    results.add(result);
                }
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
