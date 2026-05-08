package com.plagshield.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class AnalysisBatch {
    @Id
    private String id;
    private String status; // UPLOADED, PROCESSING, COMPLETED, FAILED
    private String language;
    private String storagePath;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PlagiarismResult> results;
}
