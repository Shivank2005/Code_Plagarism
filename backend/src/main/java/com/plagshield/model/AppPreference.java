package com.plagshield.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class AppPreference {
    @Id
    private String id;

    private int highRiskThreshold;
    private int suspiciousThreshold;
    private boolean autoRefreshHistory;
    private boolean compactMode;
    private boolean animateHeatmap;
}
