package com.plagshield.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "analysis_batches")
public class AnalysisBatch {
    @Id
    private String id;
    private String status; // UPLOADED, PROCESSING, COMPLETED, FAILED
    private String language;
    private String storagePath;
    private LocalDateTime createdAt = LocalDateTime.now();
}
