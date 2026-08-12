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
        java.util.Set<String> keywords = new java.util.HashSet<>(java.util.Arrays.asList(
            // Universal control flow
            "if", "else", "elif", "for", "while", "do", "switch", "case", "default",
            "return", "break", "continue", "goto", "pass", "yield",
            // Declarations and modifiers
            "public", "private", "protected", "class", "interface", "extends", "implements",
            "abstract", "final", "static", "new", "this", "super", "self", "cls",
            // Types (Java/C/C++/C#/Go/Rust)
            "boolean", "int", "float", "double", "char", "string", "void", "long", "short",
            "byte", "unsigned", "signed", "bool", "var", "let", "const", "val", "mut",
            // Literals
            "true", "false", "null", "nil", "none", "undefined", "nan",
            // Python
            "def", "import", "from", "pass", "and", "or", "not", "in", "is", "as",
            "with", "lambda", "nonlocal", "global", "assert", "except", "finally", "raise",
            // JavaScript/TypeScript
            "function", "async", "await", "export", "require", "module", "typeof", "instanceof",
            "delete", "debugger", "of",
            // C/C++
            "include", "define", "ifdef", "ifndef", "endif", "pragma", "typedef", "sizeof",
            "struct", "union", "extern", "register", "volatile", "inline", "template",
            "namespace", "using", "virtual", "override", "explicit", "friend",
            // Go
            "func", "go", "chan", "defer", "select", "range", "map", "type", "package",
            "fallthrough",
            // Rust
            "fn", "impl", "trait", "pub", "mod", "crate", "use", "where", "move",
            "ref", "match", "loop", "unsafe", "dyn", "enum",
            // Ruby
            "begin", "end", "rescue", "ensure", "puts", "attr_accessor", "attr_reader",
            // PHP
            "echo", "print", "array", "foreach", "elseif", "endfor", "endforeach",
            "endif", "endwhile",
            // C#/Kotlin/Swift/Scala
            "fun", "object", "companion", "sealed", "data", "when", "internal",
            "guard", "protocol", "extension", "optional", "throws",
            // Exception handling (universal)
            "try", "catch", "throw", "throws"
        ));
        
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("[a-zA-Z_]\\w*|\\d+\\.?\\d*").matcher(code);
        while (m.find()) {
            String token = m.group();
            if (!keywords.contains(token.toLowerCase())) {
                tokens.add(token);
            }
        }
        return tokens.toArray(new String[0]);
    }
}
