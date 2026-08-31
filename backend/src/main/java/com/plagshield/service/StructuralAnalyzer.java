package com.plagshield.service;

import org.springframework.stereotype.Service;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.*;

@Service
public class StructuralAnalyzer {

    private final LanguageConfigService languageConfigService;

    @org.springframework.beans.factory.annotation.Autowired
    public StructuralAnalyzer(LanguageConfigService languageConfigService) {
        this.languageConfigService = languageConfigService;
    }

    public double calculateStructuralSimilarity(String code1, String code2, String ext1, String ext2) {
        if (code1 == null || code2 == null) return 0.0;
        
        List<String> tree1 = getTreeSequence(code1, ext1);
        List<String> tree2 = getTreeSequence(code2, ext2);
        
        if (tree1.isEmpty() && tree2.isEmpty()) return 100.0;
        
        Set<String> fingerprint1 = new HashSet<>(tree1);
        Set<String> fingerprint2 = new HashSet<>(tree2);

        double structuralJaccardScore = calculateJaccardSimilarity(fingerprint1, fingerprint2);
        double treeEditDistanceScore = calculateSequenceSimilarity(String.join(" ", tree1), String.join(" ", tree2));
        
        // Pure AST structural matching
        double structuralScore = (structuralJaccardScore * 0.3) + (treeEditDistanceScore * 0.7);
        return Math.max(0.0, Math.min(100.0, structuralScore));
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

    private String stripCommentsAndStrings(String code, com.plagshield.model.LanguageRuleConfig rule) {
        if (code == null) return "";
        String clean = code;
        
        if (rule == null) {
            // Default generic fallback stripping
            clean = clean.replaceAll("(?m)//.*?$", "");
            clean = clean.replaceAll("(?s)/\\*.*?\\*/", "");
            clean = clean.replaceAll("\"(?:\\\\.|[^\"\\\\])*\"", "STR");
            clean = clean.replaceAll("'(?:\\\\.|[^'\\\\])*'", "CHR");
            return clean.toLowerCase(Locale.ROOT);
        }

        if (rule.getCompiledMultiLineString() != null) {
            clean = rule.getCompiledMultiLineString().matcher(clean).replaceAll("STR");
        }
        if (rule.getCompiledSingleLineString() != null) {
            // Very naive way to preserve CHR vs STR (if it contains ', assume char).
            // Based on existing behavior.
            Matcher m = rule.getCompiledSingleLineString().matcher(clean);
            StringBuffer sb = new StringBuffer();
            while (m.find()) {
                String match = m.group();
                if (match.startsWith("'")) {
                    m.appendReplacement(sb, "CHR");
                } else {
                    m.appendReplacement(sb, "STR");
                }
            }
            m.appendTail(sb);
            clean = sb.toString();
        }
        if (rule.getCompiledMultiLineComment() != null) {
            clean = rule.getCompiledMultiLineComment().matcher(clean).replaceAll("");
        }
        if (rule.getCompiledSingleLineComment() != null) {
            clean = rule.getCompiledSingleLineComment().matcher(clean).replaceAll("");
        }
        
        return clean.toLowerCase(Locale.ROOT);
    }

    private List<String> getTreeSequence(String originalCode, String extension) {
        com.plagshield.model.LanguageRuleConfig rule = languageConfigService.getRuleForExtension(extension);
        List<String> tree = new ArrayList<>();
        String code = stripCommentsAndStrings(originalCode, rule);
        
        boolean isIndentationBased = (rule != null) && rule.isIndentationBased();
        
        if (isIndentationBased) {
            int depth = 0;
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
                
                if (rule.getCompiledClass() != null) {
                    Matcher m = rule.getCompiledClass().matcher(line);
                    while(m.find()) tree.add("CLASS");
                }
                if (rule.getCompiledFunction() != null) {
                    Matcher m = rule.getCompiledFunction().matcher(line);
                    while(m.find()) tree.add("FUNCTION");
                }
                if (rule.getCompiledIf() != null) {
                    Matcher m = rule.getCompiledIf().matcher(line);
                    while(m.find()) tree.add("IF");
                }
                if (rule.getCompiledLoop() != null) {
                    Matcher m = rule.getCompiledLoop().matcher(line);
                    while(m.find()) tree.add("LOOP");
                }
                if (rule.getCompiledCtrl() != null) {
                    Matcher m = rule.getCompiledCtrl().matcher(line);
                    while(m.find()) tree.add("CTRL");
                }
                if (rule.getCompiledExcept() != null) {
                    Matcher m = rule.getCompiledExcept().matcher(line);
                    while(m.find()) tree.add("EXCEPT");
                }
            }
            while (depth > 0) {
                tree.add("UP");
                depth--;
            }
        } else {
            if (rule != null) {
                if (rule.getCompiledClass() != null) code = rule.getCompiledClass().matcher(code).replaceAll(" CLASS ");
                if (rule.getCompiledIf() != null) code = rule.getCompiledIf().matcher(code).replaceAll(" IF ");
                if (rule.getCompiledLoop() != null) code = rule.getCompiledLoop().matcher(code).replaceAll(" LOOP ");
                if (rule.getCompiledCtrl() != null) code = rule.getCompiledCtrl().matcher(code).replaceAll(" CTRL ");
                if (rule.getCompiledExcept() != null) code = rule.getCompiledExcept().matcher(code).replaceAll(" EXCEPT ");
                if (rule.getCompiledFunction() != null) code = rule.getCompiledFunction().matcher(code).replaceAll(" FUNCTION ");
            } else {
                // Fallback for unknown languages (mimicking old brace-based generic approach)
                code = code.replaceAll("\\b(class|struct|interface|enum|trait|impl)\\b", " CLASS ");
                code = code.replaceAll("\\b(if|else|elif|elseif|switch|case|default|when|match|guard)\\b", " IF ");
                code = code.replaceAll("\\b(for|while|do|foreach|loop|range)\\b", " LOOP ");
                code = code.replaceAll("\\b(return|break|continue|yield|goto|fallthrough)\\b", " CTRL ");
                code = code.replaceAll("\\b(try|catch|finally|throw|throws|raise|rescue|except)\\b", " EXCEPT ");
                code = code.replaceAll("\\b(func|fn|function)\\s+[a-zA-Z_]\\w*\\s*\\(|\\b(?!(?:IF|LOOP|CTRL|EXCEPT|CLASS|FUNCTION)\\b)[a-zA-Z_]\\w*\\s*\\(", " FUNCTION ");
            }

            String patternString = "\\b(CLASS|FUNCTION|IF|LOOP|CTRL|EXCEPT)\\b|\\{|\\}";
            Pattern pattern = Pattern.compile(patternString);
            Matcher matcher = pattern.matcher(code);
            
            while (matcher.find()) {
                String match = matcher.group();
                if (match.equals("{")) {
                    tree.add("DOWN");
                } else if (match.equals("}")) {
                    tree.add("UP");
                } else {
                    tree.add(match);
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
