package com.plagshield.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "results")
public class PlagiarismResult {
    @Id
    private String id;
    
    @Indexed
    private String batchId;
    
    private String submissionA;
    private String submissionB;
    private double similarityScore;
    private double tokenScore;
    private double structuralScore;
    private double semanticScore;
    private int boilerplateRemovedCount;
    private double confidenceScore;
    private String reportLink;
}
