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
        
        // Tokenize into meaningful tokens (identifiers, keywords, operators, literals)
        String[] tokens1 = tokenize(code1);
        String[] tokens2 = tokenize(code2);
        
        if (tokens1.length == 0 && tokens2.length == 0) return 100.0;
        if (tokens1.length == 0 || tokens2.length == 0) return 0.0;

        int matchLength = 3;
        int totalMatches = 0;
        boolean[] mark1 = new boolean[tokens1.length];
        boolean[] mark2 = new boolean[tokens2.length];
        
        while (true) {
            int maxMatch = 0;
            int maxI = -1;
            int maxJ = -1;
            
            for (int i = 0; i < tokens1.length; i++) {
                if (mark1[i]) continue;
                for (int j = 0; j < tokens2.length; j++) {
                    if (mark2[j]) continue;
                    
                    int k = 0;
                    while (i + k < tokens1.length && j + k < tokens2.length 
                           && !mark1[i+k] && !mark2[j+k] 
                           && tokens1[i+k].equals(tokens2[j+k])) {
                        k++;
                    }
                    
                    if (k > maxMatch) {
                        maxMatch = k;
                        maxI = i;
                        maxJ = j;
                    }
                }
            }
            
            if (maxMatch < matchLength) {
                break;
            }
            
            for (int k = 0; k < maxMatch; k++) {
                mark1[maxI + k] = true;
                mark2[maxJ + k] = true;
            }
            totalMatches += maxMatch;
        }
        
        return (2.0 * totalMatches / (tokens1.length + tokens2.length)) * 100.0;
    }

    private String[] tokenize(String code) {
        // Tokenize code into meaningful tokens: identifiers, numbers, and operators
        java.util.List<String> tokens = new java.util.ArrayList<>();
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("[a-zA-Z_]\\w*|\\d+\\.?\\d*|[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]").matcher(code);
        while (m.find()) {
            tokens.add(m.group());
        }
        return tokens.toArray(new String[0]);
    }
}
