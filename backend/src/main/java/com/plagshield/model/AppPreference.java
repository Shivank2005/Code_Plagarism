package com.plagshield.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "preferences")
public class AppPreference {
    @Id
    private String id;

    private int highRiskThreshold;
    private int suspiciousThreshold;
    private boolean autoRefreshHistory;
    private boolean compactMode;
    private boolean animateHeatmap;
}
