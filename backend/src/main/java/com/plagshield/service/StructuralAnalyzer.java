package com.plagshield.service;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.*;

@Service
public class StructuralAnalyzer {

    private static final Map<String, String> IR_MAP = new HashMap<>();
    static {
        String[] conds = {"if", "else", "elif", "switch", "case", "match"};
        for (String c : conds) IR_MAP.put(c, "COND");
        String[] loops = {"for", "while", "do", "foreach"};
        for (String l : loops) IR_MAP.put(l, "LOOP");
        String[] ex = {"try", "catch", "finally", "except", "throw", "throws", "raise"};
        for (String e : ex) IR_MAP.put(e, "EXCEPT");
        String[] ctrls = {"return", "break", "continue", "pass"};
        for (String c : ctrls) IR_MAP.put(c, "CTRL");
        String[] imps = {"import", "from", "require", "include", "package"};
        for (String i : imps) IR_MAP.put(i, "IMP");
        String[] decls = {"class", "interface", "enum", "struct", "def", "function", "func"};
        for (String d : decls) IR_MAP.put(d, "DECL");
        String[] mods = {"public", "private", "protected", "static"};
        for (String m : mods) IR_MAP.put(m, "MOD");
        String[] asyncs = {"async", "await"};
        for (String a : asyncs) IR_MAP.put(a, "ASYNC");
    }

    public double calculateStructuralSimilarity(String code1, String code2) {
        String normalized1 = normalizeCode(code1);
        String normalized2 = normalizeCode(code2);

        if (normalized1.isBlank() && normalized2.isBlank()) {
            return 100.0;
        }

        Set<String> tokenSet1 = getTokenSet(normalized1);
        Set<String> tokenSet2 = getTokenSet(normalized2);
        
        List<String> tree1 = getTreeSequence(code1);
        List<String> tree2 = getTreeSequence(code2);
        
        Set<String> fingerprint1 = new HashSet<>(tree1);
        Set<String> fingerprint2 = new HashSet<>(tree2);

        double tokenScore = calculateJaccardSimilarity(tokenSet1, tokenSet2);
        double structuralJaccardScore = calculateJaccardSimilarity(fingerprint1, fingerprint2);
        double treeEditDistanceScore = calculateSequenceSimilarity(String.join(" ", tree1), String.join(" ", tree2));
        
        // Tree Edit Distance is much more accurate than pure jaccard, weight it heavily
        double structuralScore = (structuralJaccardScore * 0.3) + (treeEditDistanceScore * 0.7);
        double sequenceScore = calculateSequenceSimilarity(normalized1, normalized2);
        double lengthPenalty = calculateLengthPenalty(normalized1, normalized2);

        // Increased weight on the pure structural fingerprint to assist cross-language detection
        double combinedScore = (tokenScore * 0.25) + (structuralScore * 0.60) + (sequenceScore * 0.15);
        return Math.max(0.0, Math.min(100.0, combinedScore * lengthPenalty));
    }

    public String normalizeCode(String code) {
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

    private String stripCommentsAndStrings(String code) {
        if (code == null) return "";
        String clean = code.replaceAll("(?m)//.*?$", "");
        clean = clean.replaceAll("(?s)/\\*.*?\\*/", "");
        clean = clean.replaceAll("\"(?:\\\\.|[^\"\\\\])*\"", "STR");
        clean = clean.replaceAll("'(?:\\\\.|[^'\\\\])*'", "CHR");
        return clean.toLowerCase(Locale.ROOT);
    }

    private List<String> getTreeSequence(String originalCode) {
        List<String> tree = new ArrayList<>();
        String code = stripCommentsAndStrings(originalCode);
        
        boolean isPython = !code.contains("{") && !code.contains("}");
        int depth = 0;
        
        if (isPython) {
            String[] lines = code.split("\n");
            for (String line : lines) {
                if (line.trim().isEmpty()) continue;
                
                int leadingSpaces = 0;
                while (leadingSpaces < line.length() && line.charAt(leadingSpaces) == ' ') {
                    leadingSpaces++;
                }
                int newDepth = leadingSpaces / 4;
                
                while (newDepth > depth) {
                    tree.add("DOWN");
                    depth++;
                }
                while (newDepth < depth) {
                    tree.add("UP");
                    depth--;
                }
                
                String patternString = "\\b(" + String.join("|", IR_MAP.keySet()) + ")\\b";
                Pattern pattern = Pattern.compile(patternString);
                Matcher matcher = pattern.matcher(line);
                while (matcher.find()) {
                    tree.add(IR_MAP.get(matcher.group()));
                }
            }
        } else {
            String patternString = "\\b(" + String.join("|", IR_MAP.keySet()) + ")\\b|\\{|\\}";
            Pattern pattern = Pattern.compile(patternString);
            Matcher matcher = pattern.matcher(code);
            
            while (matcher.find()) {
                String match = matcher.group();
                if (match.equals("{")) {
                    tree.add("DOWN");
                } else if (match.equals("}")) {
                    tree.add("UP");
                } else {
                    tree.add(IR_MAP.get(match));
                }
            }
        }
        return tree;
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
        if (code1.length() > 2000 || code2.length() > 2000) {
            Set<String> set1 = new HashSet<>(Arrays.asList(code1.split("")));
            Set<String> set2 = new HashSet<>(Arrays.asList(code2.split("")));
            return calculateJaccardSimilarity(set1, set2);
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
