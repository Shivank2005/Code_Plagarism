package com.plagshield.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plagshield.model.LanguageConfig;
import com.plagshield.model.LanguageRuleConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class LanguageConfigService {
    private static final Logger logger = LoggerFactory.getLogger(LanguageConfigService.class);

    @Value("${plagshield.config.dir:}")
    private String configDir;

    private final Map<String, Set<String>> extensionToKeywords = new HashMap<>();
    private final Map<String, LanguageRuleConfig> extensionToRules = new HashMap<>();
    private final Map<String, String> extensionToLanguage = new HashMap<>();

    @PostConstruct
    public void init() {
        logger.info("Initializing Language Configuration...");
        ObjectMapper mapper = new ObjectMapper();

        loadKeywords(mapper);
        loadRules(mapper);
        
        logger.info("Language Configuration loaded successfully.");
    }

    private void loadKeywords(ObjectMapper mapper) {
        try {
            Map<String, LanguageConfig> configMap;
            File externalFile = null;
            if (configDir != null && !configDir.isBlank()) {
                externalFile = new File(configDir, "keywords.json");
            }

            TypeReference<Map<String, LanguageConfig>> typeRef = new TypeReference<>() {};
            if (externalFile != null && externalFile.exists()) {
                configMap = mapper.readValue(externalFile, typeRef);
            } else {
                InputStream is = getClass().getResourceAsStream("/keywords.json");
                if (is == null) {
                    throw new RuntimeException("keywords.json not found in classpath.");
                }
                configMap = mapper.readValue(is, typeRef);
            }

            for (Map.Entry<String, LanguageConfig> entry : configMap.entrySet()) {
                String langName = entry.getKey().toUpperCase();
                LanguageConfig config = entry.getValue();
                
                if (config.getExtensions() == null || config.getExtensions().isEmpty()) {
                    throw new RuntimeException("Language '" + langName + "' has no extensions defined in keywords.json");
                }
                
                Set<String> keywords = new HashSet<>();
                if (config.getKeywords() != null) {
                    for (String kw : config.getKeywords()) {
                        keywords.add(kw.toLowerCase());
                    }
                }

                for (String ext : config.getExtensions()) {
                    String normalizedExt = normalizeExtension(ext);
                    if (extensionToKeywords.containsKey(normalizedExt)) {
                        throw new RuntimeException("Duplicate extension mapping for keywords: " + normalizedExt);
                    }
                    extensionToKeywords.put(normalizedExt, keywords);
                    extensionToLanguage.put(normalizedExt, langName);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to load language keywords configuration", e);
            throw new RuntimeException("Configuration loading failed: " + e.getMessage(), e);
        }
    }

    private void loadRules(ObjectMapper mapper) {
        try {
            Map<String, LanguageRuleConfig> ruleMap;
            File externalFile = null;
            if (configDir != null && !configDir.isBlank()) {
                externalFile = new File(configDir, "language-rules.json");
            }

            TypeReference<Map<String, LanguageRuleConfig>> typeRef = new TypeReference<>() {};
            if (externalFile != null && externalFile.exists()) {
                ruleMap = mapper.readValue(externalFile, typeRef);
            } else {
                InputStream is = getClass().getResourceAsStream("/language-rules.json");
                if (is == null) {
                    throw new RuntimeException("language-rules.json not found in classpath.");
                }
                ruleMap = mapper.readValue(is, typeRef);
            }

            for (Map.Entry<String, LanguageRuleConfig> entry : ruleMap.entrySet()) {
                String langName = entry.getKey();
                LanguageRuleConfig rule = entry.getValue();
                
                if (rule.getExtensions() == null || rule.getExtensions().isEmpty()) {
                    throw new RuntimeException("Language '" + langName + "' has no extensions defined in language-rules.json");
                }

                try {
                    rule.compilePatterns();
                } catch (Exception e) {
                    throw new RuntimeException("Invalid regex in language '" + langName + "': " + e.getMessage(), e);
                }

                for (String ext : rule.getExtensions()) {
                    String normalizedExt = normalizeExtension(ext);
                    if (extensionToRules.containsKey(normalizedExt)) {
                        throw new RuntimeException("Duplicate extension mapping for rules: " + normalizedExt);
                    }
                    extensionToRules.put(normalizedExt, rule);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to load language rules configuration", e);
            throw new RuntimeException("Configuration loading failed: " + e.getMessage(), e);
        }
    }

    public String normalizeExtension(String ext) {
        if (ext == null) return "txt";
        String normalized = ext.trim().toLowerCase();
        if (normalized.startsWith(".")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }

    public Set<String> getKeywordsForExtension(String extension) {
        String ext = normalizeExtension(extension);
        Set<String> keywords = extensionToKeywords.get(ext);
        if (keywords == null) {
            logger.debug("No keywords configuration found for extension '{}', using empty set.", ext);
            return new HashSet<>(); // Unknown language fallback
        }
        return keywords;
    }

    public LanguageRuleConfig getRuleForExtension(String extension) {
        String ext = normalizeExtension(extension);
        LanguageRuleConfig rule = extensionToRules.get(ext);
        if (rule == null) {
            logger.debug("No structural rules found for extension '{}', returning null.", ext);
            return null; // Signals unknown language to StructuralAnalyzer
        }
        return rule;
    }

    public String getLanguageForExtension(String extension) {
        String ext = normalizeExtension(extension);
        String lang = extensionToLanguage.get(ext);
        if (lang == null) {
            return "UNKNOWN";
        }
        return lang;
    }
}
