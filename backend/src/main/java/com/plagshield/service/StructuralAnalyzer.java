package com.plagshield.service;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.*;

@Service
public class StructuralAnalyzer {

    public double calculateStructuralSimilarity(String code1, String code2) {
        String normalized1 = normalizeCode(code1);
        String normalized2 = normalizeCode(code2);

        if (normalized1.isBlank() && normalized2.isBlank()) {
            return 100.0;
        }

        Set<String> tokenSet1 = getTokenSet(normalized1);
        Set<String> tokenSet2 = getTokenSet(normalized2);
        Set<String> fingerprint1 = getStructuralFingerprint(normalized1);
        Set<String> fingerprint2 = getStructuralFingerprint(normalized2);

        double tokenScore = calculateJaccardSimilarity(tokenSet1, tokenSet2);
        double structuralScore = calculateJaccardSimilarity(fingerprint1, fingerprint2);
        double sequenceScore = calculateSequenceSimilarity(normalized1, normalized2);
        double lengthPenalty = calculateLengthPenalty(normalized1, normalized2);

        double combinedScore = (tokenScore * 0.45) + (structuralScore * 0.35) + (sequenceScore * 0.20);
        return Math.max(0.0, Math.min(100.0, combinedScore * lengthPenalty));
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }

        String normalized = code.replaceAll("//.*?$", " ");
        normalized = normalized.replaceAll("/\\*.*?\\*/", " ");
        normalized = normalized.replaceAll("\"(?:\\\\.|[^\"\\\\])*\"", " STR ");
        normalized = normalized.replaceAll("'(?:\\\\.|[^'\\\\])*'", " CHR ");
        normalized = normalized.replaceAll("\\s+", " ");
        return normalized.toLowerCase(Locale.ROOT).trim();
    }

    private Set<String> getTokenSet(String code) {
        Set<String> tokens = new HashSet<>();
        if (code == null || code.isBlank()) {
            return tokens;
        }

        String[] parts = code.split("[^a-zA-Z0-9_]+");
        for (String part : parts) {
            if (!part.isBlank() && !part.chars().allMatch(Character::isDigit)) {
                tokens.add(part);
            }
        }
        return tokens;
    }

    private Set<String> getStructuralFingerprint(String code) {
        Set<String> fingerprint = new HashSet<>();
        String[] keywords = {"if", "else", "for", "while", "do", "switch", "case", "try", "catch", "finally", "class", "interface", "enum", "function", "def", "return", "public", "private", "protected", "static", "async", "await", "import", "from", "extends", "implements"};

        String patternString = "\\b(" + String.join("|", keywords) + ")\\b";
        Pattern pattern = Pattern.compile(patternString);
        Matcher matcher = pattern.matcher(code);
        
        while (matcher.find()) {
            fingerprint.add(matcher.group().toLowerCase(Locale.ROOT));
        }
        return fingerprint;
    }

    private double calculateJaccardSimilarity(Set<String> set1, Set<String> set2) {
        if (set1.isEmpty() && set2.isEmpty()) {
            return 100.0;
        }
        if (set1.isEmpty() || set2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / union.size() * 100.0;
    }

    private double calculateSequenceSimilarity(String code1, String code2) {
        if (code1.isEmpty() && code2.isEmpty()) {
            return 100.0;
        }
        int maxLength = Math.max(code1.length(), code2.length());
        if (maxLength == 0) {
            return 100.0;
        }
        int distance = calculateEditDistance(code1, code2);
        return Math.max(0.0, 100.0 - ((double) distance / maxLength * 100.0));
    }

    private double calculateLengthPenalty(String code1, String code2) {
        int length1 = code1.length();
        int length2 = code2.length();
        if (length1 == 0 || length2 == 0) {
            return 0.5;
        }

        int maxLength = Math.max(length1, length2);
        double diffRatio = (double) Math.abs(length1 - length2) / maxLength;
        return Math.max(0.55, 1.0 - (diffRatio * 0.25));
    }

    private int calculateEditDistance(String left, String right) {
        int[][] dp = new int[left.length() + 1][right.length() + 1];

        for (int i = 0; i <= left.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= right.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= left.length(); i++) {
            for (int j = 1; j <= right.length(); j++) {
                int cost = left.charAt(i - 1) == right.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[left.length()][right.length()];
    }
}
