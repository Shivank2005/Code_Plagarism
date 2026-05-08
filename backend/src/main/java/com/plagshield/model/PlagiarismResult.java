package com.plagshield.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class PlagiarismResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String submissionA;
    private String submissionB;
    private double similarityScore;
    private String reportLink;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    @JsonIgnore
    private AnalysisBatch batch;
}
