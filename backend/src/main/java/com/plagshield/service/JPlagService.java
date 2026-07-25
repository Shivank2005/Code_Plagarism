package com.plagshield.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class JPlagService {

    public double calculateTokenSimilarity(String code1, String code2) {
        if (code1 == null || code2 == null) return 0.0;
        if (code1.isBlank() && code2.isBlank()) return 100.0;
        
        String[] tokens1 = code1.toLowerCase().split("\\W+");
        String[] tokens2 = code2.toLowerCase().split("\\W+");
        
        Set<String> set1 = new java.util.HashSet<>(java.util.Arrays.asList(tokens1));
        Set<String> set2 = new java.util.HashSet<>(java.util.Arrays.asList(tokens2));
        
        set1.remove("");
        set2.remove("");
        
        if (set1.isEmpty() && set2.isEmpty()) return 100.0;
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        
        Set<String> intersection = new java.util.HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new java.util.HashSet<>(set1);
        union.addAll(set2);
        
        return ((double) intersection.size() / union.size()) * 100.0;
    }
}
