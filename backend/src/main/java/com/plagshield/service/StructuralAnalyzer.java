package com.plagshield.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.*;

@Service
public class StructuralAnalyzer {

    // Simple structural fingerprinting
    public double calculateStructuralSimilarity(String code1, String code2) {
        List<String> fingerprint1 = getStructuralFingerprint(code1);
        List<String> fingerprint2 = getStructuralFingerprint(code2);
        
        return calculateJaccardSimilarity(new HashSet<>(fingerprint1), new HashSet<>(fingerprint2));
    }

    private List<String> getStructuralFingerprint(String code) {
        List<String> fingerprint = new ArrayList<>();
        // Extract keywords that define structure
        String[] keywords = {"if", "for", "while", "switch", "case", "try", "catch", "function", "class", "public", "private"};
        
        String patternString = "\\b(" + String.join("|", keywords) + ")\\b";
        Pattern pattern = Pattern.compile(patternString);
        Matcher matcher = pattern.matcher(code);
        
        while (matcher.find()) {
            fingerprint.add(matcher.group());
        }
        return fingerprint;
    }

    private double calculateJaccardSimilarity(Set<String> set1, Set<String> set2) {
        if (set1.isEmpty() && set2.isEmpty()) return 1.0;
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        return (double) intersection.size() / union.size() * 100;
    }
}
