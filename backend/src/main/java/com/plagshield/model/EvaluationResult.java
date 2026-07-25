package com.plagshield.model;

import lombok.Data;

@Data
public class EvaluationResult {
    private int truePositives;
    private int falsePositives;
    private int trueNegatives;
    private int falseNegatives;
    private double precision;
    private double recall;
    private double f1Score;
}
