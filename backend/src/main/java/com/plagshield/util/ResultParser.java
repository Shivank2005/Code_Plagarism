package com.plagshield.util;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.model.PlagiarismResult;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class ResultParser {

    public List<PlagiarismResult> parseCsvResults(Path csvPath, AnalysisBatch batch) throws IOException {
        List<PlagiarismResult> results = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new FileReader(csvPath.toFile()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false; // Skip header
                    continue;
                }
                
                String[] values = line.split(",");
                if (values.length >= 3) {
                    PlagiarismResult result = new PlagiarismResult();
                    result.setBatch(batch);
                    result.setSubmissionA(values[0]);
                    result.setSubmissionB(values[1]);
                    result.setSimilarityScore(Double.parseDouble(values[2]));
                    // reportLink can be generated based on submissionA and submissionB
                    result.setReportLink(String.format("/reports/%s/%s-%s.html", batch.getId(), values[0], values[1]));
                    results.add(result);
                }
            }
        }
        return results;
    }
}
