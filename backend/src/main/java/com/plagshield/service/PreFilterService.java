package com.plagshield.service;

import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

@Service
public class PreFilterService {

    // Extract words from a document
    public Set<String> extractWords(String text) {
        Set<String> words = new HashSet<>();
        if (text == null || text.isBlank()) return words;
        
        String[] tokens = text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+");
        for (String token : tokens) {
            if (token.length() >= 3) { 
                words.add(token);
            }
        }
        return words;
    }
    
    // Calculate global boilerplate words based on Document Frequency (DF)
    public Set<String> calculateBoilerplate(Collection<Set<String>> allDocuments) {
        Set<String> boilerplate = new HashSet<>();
        int totalDocs = allDocuments.size();
        if (totalDocs < 2) return boilerplate;
        
        // Adaptive threshold: larger batches need stricter thresholds.
        // e.g. 5 docs -> 80% (4 docs). 50 docs -> 65% (32 docs).
        double thresholdRatio = totalDocs < 10 ? 0.80 : 0.65;
        int threshold = (int) Math.ceil(totalDocs * thresholdRatio);
        
        Map<String, Integer> dfMap = new HashMap<>();
        for (Set<String> doc : allDocuments) {
            for (String word : doc) {
                dfMap.put(word, dfMap.getOrDefault(word, 0) + 1);
            }
        }
        
        for (Map.Entry<String, Integer> entry : dfMap.entrySet()) {
            if (entry.getValue() >= threshold) {
                boilerplate.add(entry.getKey());
            }
        }
        return boilerplate;
    }

    // Result object to hold boolean and boilerplate count
    public static class FilterResult {
        public boolean shouldScan;
        public int boilerplateRemoved;
        public FilterResult(boolean shouldScan, int boilerplateRemoved) {
            this.shouldScan = shouldScan;
            this.boilerplateRemoved = boilerplateRemoved;
        }
    }
    
    // Perform fast Jaccard ignoring boilerplate
    public FilterResult shouldDeepScan(Set<String> words1, Set<String> words2, Set<String> boilerplate) {
        if (words1 == null || words2 == null || words1.isEmpty() || words2.isEmpty()) {
            return new FilterResult(false, 0);
        }
        
        Set<String> w1 = new HashSet<>(words1);
        Set<String> w2 = new HashSet<>(words2);
        
        int b1 = w1.size();
        w1.removeAll(boilerplate);
        w2.removeAll(boilerplate);
        int removedCount = b1 - w1.size(); // Approximate tokens removed for UI
        
        if (w1.isEmpty() || w2.isEmpty()) return new FilterResult(false, removedCount);
        
        Set<String> intersection = new HashSet<>(w1);
        intersection.retainAll(w2);
        
        Set<String> union = new HashSet<>(w1);
        union.addAll(w2);
        
        double similarity = (double) intersection.size() / union.size();
        
        // After removing boilerplate, if they still share > 2% unique vocabulary, deep scan them.
        return new FilterResult(similarity >= 0.02, removedCount);
    }
}
