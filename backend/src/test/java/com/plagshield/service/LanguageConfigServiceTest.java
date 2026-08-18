package com.plagshield.service;

import com.plagshield.model.LanguageRuleConfig;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Set;

public class LanguageConfigServiceTest {

    private static LanguageConfigService service;

    @BeforeAll
    public static void setup() {
        service = new LanguageConfigService();
        service.init();
    }

    // --- Extension Resolution ---

    @Test
    public void testNormalizeDottedExtension() {
        assertEquals("java", service.normalizeExtension(".java"));
    }

    @Test
    public void testNormalizeUppercase() {
        assertEquals("py", service.normalizeExtension("PY"));
    }

    @Test
    public void testNormalizeNull() {
        assertEquals("txt", service.normalizeExtension(null));
    }

    @Test
    public void testNormalizeWithWhitespace() {
        assertEquals("cpp", service.normalizeExtension(" .cpp "));
    }

    @Test
    public void testJavaExtensionResolvesToJava() {
        assertEquals("JAVA", service.getLanguageForExtension("java"));
    }

    @Test
    public void testPyExtensionResolvesToPython() {
        assertEquals("PYTHON", service.getLanguageForExtension("py"));
    }

    @Test
    public void testCppExtensionResolvesToCpp() {
        assertEquals("CPP", service.getLanguageForExtension("cpp"));
    }

    @Test
    public void testJsExtensionResolvesToJavascript() {
        assertEquals("JAVASCRIPT", service.getLanguageForExtension("js"));
    }

    @Test
    public void testUppercaseExtensionResolvesCorrectly() {
        assertEquals("JAVA", service.getLanguageForExtension(".JAVA"));
    }

    @Test
    public void testUnknownExtensionResolvesToUnknown() {
        assertEquals("UNKNOWN", service.getLanguageForExtension("xyz123"));
    }

    // --- Keyword Loading ---

    @Test
    public void testJavaKeywordsContainExpected() {
        Set<String> javaKeywords = service.getKeywordsForExtension("java");
        assertTrue(javaKeywords.contains("public"), "Java should have 'public'");
        assertTrue(javaKeywords.contains("class"), "Java should have 'class'");
    }

    @Test
    public void testJavaKeywordsDontContainPythonSpecific() {
        Set<String> javaKeywords = service.getKeywordsForExtension("java");
        assertFalse(javaKeywords.contains("def"), "Java should not have 'def'");
    }

    @Test
    public void testPythonKeywordsContainExpected() {
        Set<String> pythonKeywords = service.getKeywordsForExtension("py");
        assertTrue(pythonKeywords.contains("def"), "Python should have 'def'");
        assertTrue(pythonKeywords.contains("import"), "Python should have 'import'");
    }

    @Test
    public void testPythonKeywordsDontContainJavaSpecific() {
        Set<String> pythonKeywords = service.getKeywordsForExtension("py");
        assertFalse(pythonKeywords.contains("public"), "Python should not have 'public'");
    }

    @Test
    public void testUnknownExtensionReturnsEmptyKeywords() {
        Set<String> unknownKeywords = service.getKeywordsForExtension("unknown123");
        assertNotNull(unknownKeywords);
        assertTrue(unknownKeywords.isEmpty());
    }

    // --- Rule Loading ---

    @Test
    public void testJavaRuleExists() {
        LanguageRuleConfig javaRule = service.getRuleForExtension("java");
        assertNotNull(javaRule, "Java rule should exist");
    }

    @Test
    public void testJavaRuleIsNotIndentationBased() {
        LanguageRuleConfig javaRule = service.getRuleForExtension("java");
        assertFalse(javaRule.isIndentationBased());
    }

    @Test
    public void testJavaRuleHasCompiledPatterns() {
        LanguageRuleConfig javaRule = service.getRuleForExtension("java");
        assertNotNull(javaRule.getCompiledFunction(), "Java should have function pattern");
        assertNotNull(javaRule.getCompiledClass(), "Java should have class pattern");
        assertNotNull(javaRule.getCompiledSingleLineComment(), "Java should have comment pattern");
    }

    @Test
    public void testPythonRuleExists() {
        LanguageRuleConfig pythonRule = service.getRuleForExtension("py");
        assertNotNull(pythonRule, "Python rule should exist");
    }

    @Test
    public void testPythonRuleIsIndentationBased() {
        LanguageRuleConfig pythonRule = service.getRuleForExtension("py");
        assertTrue(pythonRule.isIndentationBased());
    }

    @Test
    public void testUnknownExtensionReturnsNullRule() {
        LanguageRuleConfig unknownRule = service.getRuleForExtension("unknown123");
        assertNull(unknownRule);
    }
}
