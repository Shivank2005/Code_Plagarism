package com.plagshield.service;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.repository.AnalysisBatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class JPlagService {

    @Autowired
    private AnalysisBatchRepository batchRepository;

    private final String JPLAG_JAR_PATH = "lib/jplag.jar"; // Assumed location

    @Async
    public void runAnalysis(String batchId, String language) {
        AnalysisBatch batch = batchRepository.findById(batchId).orElseThrow();
        batch.setStatus("PROCESSING");
        batchRepository.save(batch);

        try {
            Path submissionPath = Paths.get(batch.getStoragePath());
            Path outputPath = submissionPath.resolve("jplag_results");

            // Build Command: java -jar jplag.jar <submissions> -l <language> -r <resultFile> --csv-export
            ProcessBuilder pb = new ProcessBuilder(
                "java", "-jar", JPLAG_JAR_PATH,
                submissionPath.toString(),
                "-l", language,
                "-r", outputPath.toString(),
                "--csv-export"
            );

            pb.inheritIO();
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode == 0) {
                batch.setStatus("COMPLETED");
                // TODO: Trigger ResultParser to read the CSV and save to DB
            } else {
                batch.setStatus("FAILED");
            }
        } catch (Exception e) {
            batch.setStatus("FAILED");
            e.printStackTrace();
        } finally {
            batchRepository.save(batch);
        }
    }
}
