package com.plagshield.service;

import com.plagshield.model.LanguageRuleConfig;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Set;

public class LanguageRulesTest {

    private static LanguageConfigService configService;
    private static StructuralAnalyzer analyzer;

    @BeforeAll
    public static void setup() {
        configService = new LanguageConfigService();
        configService.init();
        analyzer = new StructuralAnalyzer(configService);
    }

    @Test
    public void testJavaStructuralAnalysis() throws Exception {
        String javaCode = "public class Test {\n" +
                "    // this is a comment\n" +
                "    public static void main(String[] args) {\n" +
                "        String s = \"test string\";\n" +
                "        /* block \n comment */\n" +
                "        if (args.length > 0) {\n" +
                "            System.out.println(args[0]);\n" +
                "        }\n" +
                "    }\n" +
                "}\n";

        Method getTree = StructuralAnalyzer.class.getDeclaredMethod("getTreeSequence", String.class, String.class);
        getTree.setAccessible(true);

        @SuppressWarnings("unchecked")
        List<String> tree = (List<String>) getTree.invoke(analyzer, javaCode, "java");
        
        assertTrue(tree.contains("CLASS"), "Should detect class declaration");
        assertTrue(tree.contains("FUNCTION"), "Should detect function declaration");
        assertTrue(tree.contains("IF"), "Should detect if statement");
        assertTrue(tree.contains("DOWN"), "Should detect block opening");
        assertTrue(tree.contains("UP"), "Should detect block closing");
    }

    @Test
    public void testJavaCommentStripping() throws Exception {
        String javaCode = "// single line comment\n/* block comment */\nString s = \"hello\";";

        LanguageRuleConfig rule = configService.getRuleForExtension("java");
        assertNotNull(rule, "Java rule should exist");

        Method strip = StructuralAnalyzer.class.getDeclaredMethod(
                "stripCommentsAndStrings", String.class, LanguageRuleConfig.class);
        strip.setAccessible(true);
        String result = (String) strip.invoke(analyzer, javaCode, rule);

        assertFalse(result.contains("single line comment"), "Single-line comment should be stripped");
        assertFalse(result.contains("block comment"), "Block comment should be stripped");
        assertFalse(result.contains("hello"), "String content should be replaced");
    }

    @Test
    public void testPythonStructuralAnalysis() throws Exception {
        String pythonCode = "def test_function(args):\n" +
                "    ''' this is a \n" +
                "        multiline string/comment '''\n" +
                "    # line comment\n" +
                "    s = 'test string'\n" +
                "    if len(args) > 0:\n" +
                "        print(args[0])\n";

        Method getTree = StructuralAnalyzer.class.getDeclaredMethod("getTreeSequence", String.class, String.class);
        getTree.setAccessible(true);

        @SuppressWarnings("unchecked")
        List<String> tree = (List<String>) getTree.invoke(analyzer, pythonCode, "py");
        
        assertTrue(tree.contains("DOWN"), "Should detect indentation increase");
        assertTrue(tree.contains("UP"), "Should detect indentation decrease");
        assertTrue(tree.contains("FUNCTION"), "Should detect def");
        assertTrue(tree.contains("IF"), "Should detect if");
    }

    @Test
    public void testPythonCommentStripping() throws Exception {
        String pythonCode = "# line comment\n'''multi\nline'''\nx = 'test'";

        LanguageRuleConfig rule = configService.getRuleForExtension("py");
        assertNotNull(rule, "Python rule should exist");

        Method strip = StructuralAnalyzer.class.getDeclaredMethod(
                "stripCommentsAndStrings", String.class, LanguageRuleConfig.class);
        strip.setAccessible(true);
        String result = (String) strip.invoke(analyzer, pythonCode, rule);

        assertFalse(result.contains("line comment"), "Hash comment should be stripped");
        assertFalse(result.contains("multi"), "Triple-quote string should be replaced");
        assertFalse(result.contains("test"), "Single-quote string should be replaced");
    }

    @Test
    public void testTokenSimilarityWithExtensions() {
        JPlagService jplag = new JPlagService(configService);

        String code1 = "public class A { int x = 5; }";
        String code2 = "public class B { int y = 5; }";

        double score = jplag.calculateTokenSimilarity(code1, code2, "java", "java");
        assertTrue(score >= 0.0 && score <= 100.0, "Score should be between 0 and 100");
    }

    @Test
    public void testUnknownExtensionDoesNotCrash() {
        double score = analyzer.calculateStructuralSimilarity(
                "if (x) { return 1; }", "if (y) { return 2; }", "xyz", "xyz");
        assertTrue(score >= 0.0, "Should not crash on unknown extension");
    }
}
