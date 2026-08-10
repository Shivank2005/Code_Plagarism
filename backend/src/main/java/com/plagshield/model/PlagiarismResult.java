package com.plagshield.model;

import lombok.Data;

@Data
public class PlagiarismResult {
    private String submissionA;
    private String submissionB;
    private double similarityScore;
    private String reportLink;
}
