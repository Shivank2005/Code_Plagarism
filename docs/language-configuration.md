# Language Configuration Guide

PlagShield is designed to be easily extensible. All language-specific logic (keywords, regex patterns, and structural rules) is configuration-driven.

## Where configurations are stored
Configurations are stored in external JSON files located in `backend/src/main/resources/`:
1. `keywords.json`: Contains reserved language keywords used for tokenization.
2. `language-rules.json`: Contains regular expressions for comments, strings, and structural elements used in AST generation.

## How extensions are mapped
Each language definition in the JSON files contains an `extensions` array. When a file is uploaded, its extension is extracted (e.g. `.py` or `py`), converted to lowercase, and mapped to the corresponding language.
For example, both `cpp` and `cc` map to the `cpp` language rules.

## How to add a new language
To add a new language, you **do not** need to write any Java code.
1. Open `keywords.json` and add a new language block with its extensions and reserved keywords.
2. Open `language-rules.json` and add a matching language block with its regex rules.

## How to add keywords
In `keywords.json`:
```json
"language_name": {
  "extensions": ["ext1", "ext2"],
  "keywords": ["if", "else", "while", "return"]
}
```

## How to add regex rules
In `language-rules.json`:
```json
"language_name": {
  "extensions": ["ext1", "ext2"],
  "indentationBased": false,
  "singleLineCommentPattern": "//.*",
  "multiLineCommentStart": "/\\*",
  "multiLineCommentEnd": "\\*/",
  "singleLineStringPattern": "\"(?:\\\\.|[^\"\\\\])*\"",
  "multiLineStringPattern": null,
  "functionPattern": "\\b[a-zA-Z_]\\w*\\s*\\(",
  "classPattern": "\\b(class|interface)\\b",
  "ifPattern": "\\b(if|else|switch|case)\\b",
  "loopPattern": "\\b(for|while|do)\\b",
  "ctrlPattern": "\\b(return|break|continue)\\b",
  "exceptPattern": "\\b(try|catch|throw)\\b"
}
```

## Required Fields
- `extensions`: Must be an array of strings (without dots).
- `indentationBased`: Boolean indicating if the language uses indentation (like Python) or braces for structure.
- All other pattern strings are optional. If a language doesn't have multi-line strings, set it to `null`.

## How to test a new language
After adding the configuration:
1. Write a test source file in the new language.
2. Submit it to PlagShield.
3. Verify that the tokens are properly extracted (keywords filtered) and the structural AST tree is correctly generated without errors.
