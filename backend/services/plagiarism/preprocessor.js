/**
 * Source Code Preprocessor
 * Cleans comments, normalizes whitespace, and abstracts string/number literals
 */

function preprocessCode(rawCode, language = 'python') {
  if (!rawCode || typeof rawCode !== 'string') {
    return '';
  }

  let code = rawCode;

  // 1. Remove Language-Specific Comments
  if (['python'].includes(language.toLowerCase())) {
    // Multi-line python docstrings / comments """...""" and '''...'''
    code = code.replace(/"""[\s\S]*?"""/g, ' ');
    code = code.replace(/'''[\s\S]*?'''/g, ' ');
    // Single line python comments
    code = code.replace(/#.*$/gm, ' ');
  } else {
    // C, C++, Java, JavaScript: Multi-line comments /* ... */
    code = code.replace(/\/\*[\s\S]*?\*\//g, ' ');
    // Single-line comments // ...
    code = code.replace(/\/\/.*$/gm, ' ');
  }

  // 2. Normalize String Literals to standard 'STR' token
  // Handles double and single quoted strings
  code = code.replace(/"(?:[^"\\]|\\.)*"/g, ' STR ');
  code = code.replace(/'(?:[^'\\]|\\.)*'/g, ' STR ');

  // 3. Normalize Numeric Literals to 'NUM' token
  code = code.replace(/\b\d+(\.\d+)?\b/g, ' NUM ');

  // 4. Normalize Whitespace: replace all consecutive tabs/spaces/newlines with a single space
  code = code.replace(/\s+/g, ' ').trim();

  return code;
}

module.exports = {
  preprocessCode
};
