package com.plagshield.model;

import java.util.List;
import java.util.regex.Pattern;

public class LanguageRuleConfig {
    private List<String> extensions;
    private boolean indentationBased;
    private String singleLineCommentPattern;
    private String multiLineCommentStart;
    private String multiLineCommentEnd;
    private String singleLineStringPattern;
    private String multiLineStringPattern;
    private String functionPattern;
    private String classPattern;
    private String ifPattern;
    private String loopPattern;
    private String ctrlPattern;
    private String exceptPattern;

    // Compiled patterns for performance
    private transient Pattern compiledSingleLineComment;
    private transient Pattern compiledMultiLineComment;
    private transient Pattern compiledSingleLineString;
    private transient Pattern compiledMultiLineString;
    private transient Pattern compiledFunction;
    private transient Pattern compiledClass;
    private transient Pattern compiledIf;
    private transient Pattern compiledLoop;
    private transient Pattern compiledCtrl;
    private transient Pattern compiledExcept;

    public void compilePatterns() {
        if (singleLineCommentPattern != null) compiledSingleLineComment = Pattern.compile(singleLineCommentPattern);
        if (multiLineCommentStart != null && multiLineCommentEnd != null) {
            compiledMultiLineComment = Pattern.compile("(?s)" + multiLineCommentStart + ".*?" + multiLineCommentEnd);
        }
        if (singleLineStringPattern != null) compiledSingleLineString = Pattern.compile(singleLineStringPattern);
        if (multiLineStringPattern != null) compiledMultiLineString = Pattern.compile(multiLineStringPattern);
        if (functionPattern != null) compiledFunction = Pattern.compile(functionPattern);
        if (classPattern != null) compiledClass = Pattern.compile(classPattern);
        if (ifPattern != null) compiledIf = Pattern.compile(ifPattern);
        if (loopPattern != null) compiledLoop = Pattern.compile(loopPattern);
        if (ctrlPattern != null) compiledCtrl = Pattern.compile(ctrlPattern);
        if (exceptPattern != null) compiledExcept = Pattern.compile(exceptPattern);
    }

    // Getters and Setters

    public List<String> getExtensions() { return extensions; }
    public void setExtensions(List<String> extensions) { this.extensions = extensions; }

    public boolean isIndentationBased() { return indentationBased; }
    public void setIndentationBased(boolean indentationBased) { this.indentationBased = indentationBased; }

    public String getSingleLineCommentPattern() { return singleLineCommentPattern; }
    public void setSingleLineCommentPattern(String singleLineCommentPattern) { this.singleLineCommentPattern = singleLineCommentPattern; }

    public String getMultiLineCommentStart() { return multiLineCommentStart; }
    public void setMultiLineCommentStart(String multiLineCommentStart) { this.multiLineCommentStart = multiLineCommentStart; }

    public String getMultiLineCommentEnd() { return multiLineCommentEnd; }
    public void setMultiLineCommentEnd(String multiLineCommentEnd) { this.multiLineCommentEnd = multiLineCommentEnd; }

    public String getSingleLineStringPattern() { return singleLineStringPattern; }
    public void setSingleLineStringPattern(String singleLineStringPattern) { this.singleLineStringPattern = singleLineStringPattern; }

    public String getMultiLineStringPattern() { return multiLineStringPattern; }
    public void setMultiLineStringPattern(String multiLineStringPattern) { this.multiLineStringPattern = multiLineStringPattern; }

    public String getFunctionPattern() { return functionPattern; }
    public void setFunctionPattern(String functionPattern) { this.functionPattern = functionPattern; }

    public String getClassPattern() { return classPattern; }
    public void setClassPattern(String classPattern) { this.classPattern = classPattern; }

    public String getIfPattern() { return ifPattern; }
    public void setIfPattern(String ifPattern) { this.ifPattern = ifPattern; }

    public String getLoopPattern() { return loopPattern; }
    public void setLoopPattern(String loopPattern) { this.loopPattern = loopPattern; }

    public String getCtrlPattern() { return ctrlPattern; }
    public void setCtrlPattern(String ctrlPattern) { this.ctrlPattern = ctrlPattern; }

    public String getExceptPattern() { return exceptPattern; }
    public void setExceptPattern(String exceptPattern) { this.exceptPattern = exceptPattern; }

    // Compiled Pattern Getters
    public Pattern getCompiledSingleLineComment() { return compiledSingleLineComment; }
    public Pattern getCompiledMultiLineComment() { return compiledMultiLineComment; }
    public Pattern getCompiledSingleLineString() { return compiledSingleLineString; }
    public Pattern getCompiledMultiLineString() { return compiledMultiLineString; }
    public Pattern getCompiledFunction() { return compiledFunction; }
    public Pattern getCompiledClass() { return compiledClass; }
    public Pattern getCompiledIf() { return compiledIf; }
    public Pattern getCompiledLoop() { return compiledLoop; }
    public Pattern getCompiledCtrl() { return compiledCtrl; }
    public Pattern getCompiledExcept() { return compiledExcept; }
}
