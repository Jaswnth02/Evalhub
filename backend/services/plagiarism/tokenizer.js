/**
 * Source Code Tokenizer
 * Performs lexical analysis, keyword recognition, and identifier normalization (VAR_1, VAR_2)
 */

const COMMON_KEYWORDS = new Set([
  // Control flow
  'if', 'else', 'elif', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'default',
  // Types & declarations
  'def', 'function', 'class', 'struct', 'int', 'float', 'double', 'char', 'string', 'bool', 'boolean',
  'void', 'let', 'const', 'var', 'public', 'private', 'protected', 'static', 'final', 'const',
  // Modules / Imports
  'import', 'from', 'include', 'require', 'export', 'package', 'namespace', 'using',
  // Error handling
  'try', 'catch', 'finally', 'throw', 'throws', 'except', 'raise',
  // Object / Memory
  'new', 'this', 'self', 'super', 'delete', 'null', 'nil', 'none', 'true', 'false',
  // Common I/O & language builtins
  'print', 'printf', 'scanf', 'cout', 'cin', 'endl', 'console', 'log', 'sys', 'stdin', 'stdout'
]);

const OPERATORS = [
  '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=',
  '+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|', '^', '~', '?', ':'
];

function tokenizeCode(preprocessedCode) {
  if (!preprocessedCode || typeof preprocessedCode !== 'string') {
    return [];
  }

  // Regex splitting on whitespace, punctuation, and multi-char operators
  const tokens = [];
  const symbolMap = new Map();
  let varCounter = 1;

  // Regex token pattern: match literals, identifiers, operators, or punctuation
  const tokenRegex = /(STR|NUM|[a-zA-Z_]\w*|==|!=|<=|>=|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|[-+*/%<>=!&|^~?:;,{}()[\]])/g;
  let match;

  while ((match = tokenRegex.exec(preprocessedCode)) !== null) {
    const raw = match[0];

    if (raw === 'STR' || raw === 'NUM') {
      tokens.push(raw);
    } else if (COMMON_KEYWORDS.has(raw.toLowerCase())) {
      tokens.push(`KW_${raw.toUpperCase()}`);
    } else if (OPERATORS.includes(raw)) {
      tokens.push(`OP_${raw}`);
    } else if (/^[a-zA-Z_]\w*$/.test(raw)) {
      // User identifier: map to canonical symbol (VAR_1, VAR_2...)
      if (!symbolMap.has(raw)) {
        symbolMap.set(raw, `ID_${varCounter++}`);
      }
      tokens.push(symbolMap.get(raw));
    } else {
      // Punctuation like () {} [] ; ,
      tokens.push(raw);
    }
  }

  return tokens;
}

module.exports = {
  tokenizeCode
};
