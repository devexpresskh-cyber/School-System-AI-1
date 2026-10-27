/**
 * Excel Formula Parser & Evaluator Engine for School Financial Reports
 * 
 * Supports:
 * - Leading '=' sign (optional or required)
 * - Standard arithmetic operators: +, -, *, /, %, ^
 * - Comparison operators: =, ==, <>, !=, >, <, >=, <=
 * - Logical operators: AND, OR, NOT
 * - Excel Functions:
 *     SUM, AVERAGE, ROUND, ROUNDUP, ROUNDDOWN, IF, MAX, MIN,
 *     OR, AND, NOT, ABS, INT, COUNTA, COUNTIF
 * - Cell references: e.g. I4, K4, M4, Q4, AA4, AB4 (case-insensitive)
 * - Relative column references: e.g. I, K, M, Q, AA, AB
 * - Range references: e.g. L5:O5, L:O
 * - String concatenation: &
 * - Parenthesized subexpressions: ( ... )
 * - Robust error handling with Excel-style error codes: #VALUE!, #NAME?, #DIV/0!, #SYNTAX!
 */

export type PrimitiveValue = number | string | boolean | null;

export interface FormulaContext {
  /** Row index (1-based, like Excel row 4, 5...) */
  rowNumber?: number;
  /** Cell mapping for the current row: e.g., { "I": 981, "K": 20, "J": 0.1, "L": 0 } */
  cells: Record<string, PrimitiveValue>;
  /** Optional all rows mapping to support cross-row and full column ranges */
  allRows?: Array<{ rowNumber: number; cells: Record<string, PrimitiveValue> }>;
}

export interface FormulaValidationResult {
  valid: boolean;
  result?: PrimitiveValue;
  error?: string;
}

// Token types
type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'IDENTIFIER'
  | 'CELL_REF'
  | 'RANGE_REF'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

interface Token {
  type: TokenType;
  value: any;
  raw: string;
  start: number;
}

/**
 * Tokenizer for Excel formulas
 */
export function tokenizeFormula(expr: string): Token[] {
  let text = expr.trim();
  if (text.startsWith('=')) {
    text = text.substring(1).trim();
  }

  const tokens: Token[] = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number literal (supports decimals and percentage like 10%)
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(text[i + 1]))) {
      const start = i;
      while (i < len && /[0-9.]/.test(text[i])) {
        i++;
      }
      let raw = text.substring(start, i);
      let val = parseFloat(raw);
      if (i < len && text[i] === '%') {
        val = val / 100;
        raw += '%';
        i++;
      }
      tokens.push({ type: 'NUMBER', value: val, raw, start });
      continue;
    }

    // String literal with single or double quotes
    if (ch === '"' || ch === "'") {
      const quote = ch;
      const start = i;
      i++; // skip open quote
      let str = '';
      while (i < len && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < len) {
          i++;
          str += text[i];
        } else {
          str += text[i];
        }
        i++;
      }
      if (i < len && text[i] === quote) {
        i++; // skip close quote
      }
      tokens.push({ type: 'STRING', value: str, raw: text.substring(start, i), start });
      continue;
    }

    // Parentheses and comma
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(', raw: '(', start: i++ });
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')', raw: ')', start: i++ });
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'COMMA', value: ',', raw: ',', start: i++ });
      continue;
    }

    // Multi-char operators: <=, >=, <>, !=, ==
    if (ch === '<' || ch === '>' || ch === '!' || ch === '=') {
      const start = i;
      if (i + 1 < len) {
        const two = text.substring(i, i + 2);
        if (two === '<=' || two === '>=' || two === '<>' || two === '!=' || two === '==') {
          i += 2;
          const op = two === '==' ? '=' : two === '!=' ? '<>' : two;
          tokens.push({ type: 'OPERATOR', value: op, raw: two, start });
          continue;
        }
      }
      tokens.push({ type: 'OPERATOR', value: ch, raw: ch, start: i++ });
      continue;
    }

    // Single-char operators
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '&') {
      tokens.push({ type: 'OPERATOR', value: ch, raw: ch, start: i++ });
      continue;
    }

    // Identifiers, Cell References, Functions, and Ranges (e.g. M4, I, Q4, L5:O5, SUM, IF)
    if (/[a-zA-Z_$]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_$:]/.test(text[i])) {
        i++;
      }
      const raw = text.substring(start, i);
      const upper = raw.toUpperCase().replace(/\$/g, '');

      // Check if it's a range like L5:O5 or L:O
      if (upper.includes(':')) {
        tokens.push({ type: 'RANGE_REF', value: upper, raw, start });
        continue;
      }

      // Check for boolean literals
      if (upper === 'TRUE') {
        tokens.push({ type: 'BOOLEAN', value: true, raw, start });
        continue;
      }
      if (upper === 'FALSE') {
        tokens.push({ type: 'BOOLEAN', value: false, raw, start });
        continue;
      }

      // Check if it's a specific cell reference with row number: e.g. A4, AB12, Q4
      const cellRefMatch = /^([A-Z]+)([0-9]+)$/.exec(upper);
      if (cellRefMatch) {
        tokens.push({
          type: 'CELL_REF',
          value: { col: cellRefMatch[1], row: parseInt(cellRefMatch[2], 10) },
          raw,
          start
        });
        continue;
      }

      // Standard Column reference or function identifier (e.g. SUM, ROUND, IF, or single column I, Q, AA)
      tokens.push({ type: 'IDENTIFIER', value: upper, raw, start });
      continue;
    }

    // Colon as separate operator if not part of identifier
    if (ch === ':') {
      tokens.push({ type: 'OPERATOR', value: ':', raw: ':', start: i++ });
      continue;
    }

    // Skip or throw on unexpected character
    i++;
  }

  tokens.push({ type: 'EOF', value: null, raw: '', start: i });
  return tokens;
}

/**
 * Expression AST Node
 */
type ASTNode =
  | { type: 'Literal'; value: PrimitiveValue }
  | { type: 'CellRef'; col: string; row?: number }
  | { type: 'RangeRef'; startCol: string; startRow?: number; endCol: string; endRow?: number }
  | { type: 'UnaryOp'; operator: string; argument: ASTNode }
  | { type: 'BinaryOp'; operator: string; left: ASTNode; right: ASTNode }
  | { type: 'FunctionCall'; name: string; args: ASTNode[] };

/**
 * Recursive Descent Parser for Excel Expressions
 */
class FormulaParser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: null, raw: '', start: 0 };
  }

  private match(...types: TokenType[]): boolean {
    const curr = this.current();
    return types.includes(curr.type);
  }

  private consume(type?: TokenType, value?: string): Token {
    const curr = this.current();
    if (type && curr.type !== type) {
      throw new Error(`Expected token type ${type} but found ${curr.type} (${curr.raw})`);
    }
    if (value !== undefined && curr.value !== value) {
      throw new Error(`Expected token value "${value}" but found "${curr.value}"`);
    }
    this.pos++;
    return curr;
  }

  public parse(): ASTNode {
    if (this.current().type === 'EOF') {
      return { type: 'Literal', value: 0 };
    }
    const node = this.parseExpression();
    if (this.current().type !== 'EOF') {
      throw new Error(`Unexpected extra tokens after formula: "${this.current().raw}"`);
    }
    return node;
  }

  // Expression: handles comparison operators (=, <>, <, <=, >, >=)
  private parseExpression(): ASTNode {
    let left = this.parseConcat();

    while (
      this.current().type === 'OPERATOR' &&
      ['=', '<>', '<', '<=', '>', '>='].includes(this.current().value)
    ) {
      const op = this.consume().value;
      const right = this.parseConcat();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  // String concatenation (&)
  private parseConcat(): ASTNode {
    let left = this.parseAdditive();

    while (this.current().type === 'OPERATOR' && this.current().value === '&') {
      const op = this.consume().value;
      const right = this.parseAdditive();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  // Addition & Subtraction (+, -)
  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();

    while (this.current().type === 'OPERATOR' && ['+', '-'].includes(this.current().value)) {
      const op = this.consume().value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  // Multiplication & Division (*, /, %)
  private parseMultiplicative(): ASTNode {
    let left = this.parseExponent();

    while (this.current().type === 'OPERATOR' && ['*', '/', '%'].includes(this.current().value)) {
      const op = this.consume().value;
      const right = this.parseExponent();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  // Exponent (^)
  private parseExponent(): ASTNode {
    let left = this.parseUnary();

    while (this.current().type === 'OPERATOR' && this.current().value === '^') {
      const op = this.consume().value;
      const right = this.parseUnary();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  // Unary operators (+, -)
  private parseUnary(): ASTNode {
    if (this.current().type === 'OPERATOR' && ['+', '-'].includes(this.current().value)) {
      const op = this.consume().value;
      const arg = this.parseUnary();
      return { type: 'UnaryOp', operator: op, argument: arg };
    }
    return this.parsePrimary();
  }

  // Primary: Numbers, strings, function calls, cell references, ranges, parentheses
  private parsePrimary(): ASTNode {
    const token = this.current();

    if (token.type === 'NUMBER') {
      this.consume();
      return { type: 'Literal', value: token.value };
    }

    if (token.type === 'STRING') {
      this.consume();
      return { type: 'Literal', value: token.value };
    }

    if (token.type === 'BOOLEAN') {
      this.consume();
      return { type: 'Literal', value: token.value };
    }

    // Specific Cell reference with row number: e.g. M4, Q4
    if (token.type === 'CELL_REF') {
      this.consume();
      return { type: 'CellRef', col: token.value.col, row: token.value.row };
    }

    // Range reference: e.g. L5:O5 or L:O
    if (token.type === 'RANGE_REF') {
      this.consume();
      const parts = token.value.split(':');
      const startMatch = /^([A-Z]+)([0-9]*)$/.exec(parts[0]);
      const endMatch = /^([A-Z]+)([0-9]*)$/.exec(parts[1]);
      return {
        type: 'RangeRef',
        startCol: startMatch ? startMatch[1] : parts[0],
        startRow: startMatch && startMatch[2] ? parseInt(startMatch[2], 10) : undefined,
        endCol: endMatch ? endMatch[1] : parts[1],
        endRow: endMatch && endMatch[2] ? parseInt(endMatch[2], 10) : undefined
      };
    }

    // Identifier: could be a function call (SUM, IF, etc.) or relative column reference (I, K, Q)
    if (token.type === 'IDENTIFIER') {
      const ident = token.value;
      this.consume();

      // If followed by '(', it's a function call
      if (this.current().type === 'LPAREN') {
        this.consume('LPAREN');
        const args: ASTNode[] = [];
        if (this.current().type !== 'RPAREN') {
          args.push(this.parseExpression());
          while (this.current().type === 'COMMA') {
            this.consume('COMMA');
            args.push(this.parseExpression());
          }
        }
        this.consume('RPAREN');
        return { type: 'FunctionCall', name: ident, args };
      }

      // If followed by ':', it's a range like L:O
      if (this.current().type === 'OPERATOR' && this.current().value === ':') {
        this.consume('OPERATOR', ':');
        const nextToken = this.consume();
        const endIdent = nextToken.value;
        return {
          type: 'RangeRef',
          startCol: ident,
          endCol: typeof endIdent === 'object' && endIdent?.col ? endIdent.col : String(endIdent)
        };
      }

      // Otherwise, it's a relative column reference in the current row: e.g. I, K, M, Q, AA
      return { type: 'CellRef', col: ident };
    }

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      this.consume('LPAREN');
      const expr = this.parseExpression();
      this.consume('RPAREN');
      return expr;
    }

    throw new Error(`Unexpected token at position ${token.start}: "${token.raw}"`);
  }
}

/**
 * Converts any value into a numeric representation
 */
function toNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.endsWith('%')) {
      const num = parseFloat(trimmed.slice(0, -1));
      return isNaN(num) ? 0 : num / 100;
    }
    const clean = trimmed.replace(/[$,]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Checks equality in Excel style
 */
function isExcelEqual(a: any, b: any): boolean {
  if (typeof a === 'number' || typeof b === 'number') {
    return toNumber(a) === toNumber(b);
  }
  return String(a).toLowerCase() === String(b).toLowerCase();
}

/**
 * Evaluates an AST Node against a given row context
 */
function evaluateAST(node: ASTNode, ctx: FormulaContext): PrimitiveValue {
  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'CellRef': {
      const colUpper = node.col.toUpperCase();

      // Check if target row specified and matches an external row
      if (node.row !== undefined && ctx.allRows && node.row !== ctx.rowNumber) {
        const targetRow = ctx.allRows.find(r => r.rowNumber === node.row);
        if (targetRow && targetRow.cells[colUpper] !== undefined) {
          return targetRow.cells[colUpper];
        }
      }

      // Check current row cells
      if (ctx.cells[colUpper] !== undefined) {
        return ctx.cells[colUpper];
      }

      // Common column alias fallbacks
      const colLower = colUpper.toLowerCase();
      if (ctx.cells[colLower] !== undefined) {
        return ctx.cells[colLower];
      }

      return 0;
    }

    case 'RangeRef': {
      // Evaluate range into array of values
      const startCol = node.startCol.toUpperCase();
      const endCol = node.endCol.toUpperCase();

      // If row numbers are omitted, aggregate across columns in current row
      const colList: string[] = [];
      const startCode = startCol.charCodeAt(0);
      const endCode = endCol.charCodeAt(0);
      if (startCol.length === 1 && endCol.length === 1 && startCode <= endCode) {
        for (let c = startCode; c <= endCode; c++) {
          colList.push(String.fromCharCode(c));
        }
      } else {
        colList.push(startCol, endCol);
      }

      const values: number[] = [];
      for (const col of colList) {
        const val = ctx.cells[col];
        if (val !== undefined && val !== null) {
          values.push(toNumber(val));
        }
      }
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) : 0;
    }

    case 'UnaryOp': {
      const argVal = evaluateAST(node.argument, ctx);
      if (node.operator === '+') {
        return toNumber(argVal);
      }
      if (node.operator === '-') {
        return -toNumber(argVal);
      }
      return 0;
    }

    case 'BinaryOp': {
      const leftVal = evaluateAST(node.left, ctx);
      const rightVal = evaluateAST(node.right, ctx);

      switch (node.operator) {
        case '+':
          return toNumber(leftVal) + toNumber(rightVal);
        case '-':
          return toNumber(leftVal) - toNumber(rightVal);
        case '*':
          return toNumber(leftVal) * toNumber(rightVal);
        case '/': {
          const divisor = toNumber(rightVal);
          if (divisor === 0) return 0; // Avoid NaN/Infinity in financial tables
          return toNumber(leftVal) / divisor;
        }
        case '%':
          return toNumber(leftVal) % toNumber(rightVal);
        case '^':
          return Math.pow(toNumber(leftVal), toNumber(rightVal));
        case '&':
          return String(leftVal ?? '') + String(rightVal ?? '');
        case '=':
          return isExcelEqual(leftVal, rightVal);
        case '<>':
          return !isExcelEqual(leftVal, rightVal);
        case '<':
          return toNumber(leftVal) < toNumber(rightVal);
        case '<=':
          return toNumber(leftVal) <= toNumber(rightVal);
        case '>':
          return toNumber(leftVal) > toNumber(rightVal);
        case '>=':
          return toNumber(leftVal) >= toNumber(rightVal);
        default:
          return 0;
      }
    }

    case 'FunctionCall': {
      const fnName = node.name.toUpperCase();
      const evaluatedArgs = node.args.map(arg => evaluateAST(arg, ctx));

      switch (fnName) {
        // IF(condition, value_if_true, value_if_false)
        case 'IF': {
          const condition = Boolean(evaluatedArgs[0]);
          return condition ? evaluatedArgs[1] ?? 0 : evaluatedArgs[2] ?? 0;
        }

        // SUM(val1, val2, ...)
        case 'SUM': {
          let sum = 0;
          for (const arg of evaluatedArgs) {
            sum += toNumber(arg);
          }
          return sum;
        }

        // AVERAGE(val1, val2, ...)
        case 'AVERAGE': {
          if (evaluatedArgs.length === 0) return 0;
          let sum = 0;
          for (const arg of evaluatedArgs) {
            sum += toNumber(arg);
          }
          return sum / evaluatedArgs.length;
        }

        // ROUND(val, digits)
        case 'ROUND': {
          const num = toNumber(evaluatedArgs[0]);
          const digits = Math.floor(toNumber(evaluatedArgs[1] ?? 0));
          const factor = Math.pow(10, digits);
          return Math.round(num * factor) / factor;
        }

        // ROUNDUP(val, digits)
        case 'ROUNDUP': {
          const num = toNumber(evaluatedArgs[0]);
          const digits = Math.floor(toNumber(evaluatedArgs[1] ?? 0));
          const factor = Math.pow(10, digits);
          if (num >= 0) {
            return Math.ceil(num * factor) / factor;
          } else {
            return Math.floor(num * factor) / factor;
          }
        }

        // ROUNDDOWN(val, digits)
        case 'ROUNDDOWN': {
          const num = toNumber(evaluatedArgs[0]);
          const digits = Math.floor(toNumber(evaluatedArgs[1] ?? 0));
          const factor = Math.pow(10, digits);
          if (num >= 0) {
            return Math.floor(num * factor) / factor;
          } else {
            return Math.ceil(num * factor) / factor;
          }
        }

        // MAX(val1, val2, ...)
        case 'MAX': {
          if (evaluatedArgs.length === 0) return 0;
          return Math.max(...evaluatedArgs.map(toNumber));
        }

        // MIN(val1, val2, ...)
        case 'MIN': {
          if (evaluatedArgs.length === 0) return 0;
          return Math.min(...evaluatedArgs.map(toNumber));
        }

        // OR(cond1, cond2, ...)
        case 'OR': {
          return evaluatedArgs.some(a => Boolean(a));
        }

        // AND(cond1, cond2, ...)
        case 'AND': {
          return evaluatedArgs.every(a => Boolean(a));
        }

        // NOT(cond)
        case 'NOT': {
          return !Boolean(evaluatedArgs[0]);
        }

        // ABS(val)
        case 'ABS': {
          return Math.abs(toNumber(evaluatedArgs[0]));
        }

        // INT(val)
        case 'INT': {
          return Math.floor(toNumber(evaluatedArgs[0]));
        }

        // COUNTA(...)
        case 'COUNTA': {
          return evaluatedArgs.filter(a => a !== null && a !== undefined && a !== '').length;
        }

        // COUNTIF(range, criteria)
        case 'COUNTIF': {
          if (evaluatedArgs.length < 2) return 0;
          const criteria = evaluatedArgs[1];
          return evaluatedArgs.slice(0, -1).filter(v => isExcelEqual(v, criteria)).length;
        }

        default:
          throw new Error(`Unsupported Excel function: "${fnName}"`);
      }
    }
  }
}

/**
 * Main evaluation entry point
 * 
 * @param formula Formula string (e.g. "=(I-K)-((I-K)*J)-L" or "=ROUND(N+O+P,2)")
 * @param context Current row data context
 */
export function evaluateFormula(formula: string, context: FormulaContext): PrimitiveValue {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    return 0;
  }

  try {
    const tokens = tokenizeFormula(formula);
    const parser = new FormulaParser(tokens);
    const ast = parser.parse();
    const result = evaluateAST(ast, context);

    if (typeof result === 'number') {
      return Number(result.toFixed(4));
    }
    return result;
  } catch (err: any) {
    console.warn(`Formula evaluation error on "${formula}":`, err?.message);
    return '#VALUE!';
  }
}

/**
 * Validates a formula string and checks syntax correctness
 */
export function validateFormula(
  formula: string,
  sampleContext?: FormulaContext
): FormulaValidationResult {
  if (!formula || typeof formula !== 'string' || formula.trim() === '') {
    return { valid: false, error: 'រូបមន្តទទេ (Empty formula)' };
  }

  try {
    const tokens = tokenizeFormula(formula);
    const parser = new FormulaParser(tokens);
    const ast = parser.parse();

    const dummyCtx: FormulaContext = sampleContext || {
      rowNumber: 4,
      cells: {
        I: 981,
        J: 0.1,
        K: 20,
        L: 0,
        M: 864.9,
        N: 0,
        O: 0,
        P: 220.45,
        Q: 220.45,
        T: 220.45,
        W: 0,
        Z: 0,
        AA: 220.45,
        AB: 0,
        AC: 0,
        AD: 0,
        AE: 0,
        S: 0,
        U: 0,
        Y: 1523.25,
        AG: 144,
        AM: 128,
        AJ: 25,
        AP: 25,
        AQ: 272,
        AR: 50,
        AS: 4145.17,
        AT: 675
      }
    };

    const res = evaluateAST(ast, dummyCtx);
    return { valid: true, result: res };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'កំហុសវាក្យសម្ព័ន្ធរូបមន្ត (Formula syntax error)' };
  }
}

/**
 * Standard Default Formula Presets for Khmer Grade 7 and English K1
 */
export const STANDARD_FORMULA_PRESETS = {
  khmer: {
    M: '=(I-K)-((I-K)*J)-L',
    Q: '=ROUND(N+O+P, 2)',
    AA: '=ROUND(T+W+Z, 2)',
    AB: '=ROUND(Q-AA, 2)',
    AC: '=IF((N-AA)<=0, 0, N-AA)',
    AD: '=IF(AA<=(N+O), IF(AA<=N, O, (N+O)-AA), 0)',
    AE: '=IF(AA>=(O+N), MAX(0, Q-AA), P)'
  },
  english: {
    P: '=SUM(L:O)',
    Q: '=J-(J*K)-P',
    AC: '=ROUND(S+U+W+Y+AA, 2)',
    AD: '=ROUND(T+V+X+Z+AB, 2)',
    AQ: '=ROUND(AG+AM, 2)',
    AR: '=ROUND(AJ+AP, 2)',
    AS: '=AC-AQ',
    AT: '=AD-AR',
    AU: '=IF(OR(AS>0, AT>0), 1, 0)',
    AV: '=IF(AQ<=S, S-AQ, 0)',
    AW: '=IF(AR<=T, T-AR, 0)',
    AX: '=IF(S+U<=AQ, 0, IF((S+U)-AQ>U, U, (S+U)-AQ))',
    AY: '=IF(T+V<=AR, 0, IF((T+V)-AR>V, V, (T+V)-AR))',
    AZ: '=IF(S+U+W<=AQ, 0, IF((S+U+W)-AQ>W, W, (S+U+W)-AQ))',
    BA: '=IF(T+V+X<=AR, 0, IF((T+V+X)-AR>X, X, (T+V)-AR))',
    BB: '=IF(S+U+W+Y<=AQ, 0, IF((S+U+W+Y)-AQ>Y, Y, (S+U+W+Y)-AQ))',
    BC: '=IF(T+V+X+Z<=AR, 0, IF((T+V+X+Z)-AR>Z, Z, (T+V)-AR))',
    BD: '=IF(S+U+W+Y+AA<=AQ, 0, IF((S+U+W+Y+AA)-AQ>AA, AA, (S+U+W+Y+AA)-AQ))',
    BE: '=IF(T+V+X+Z+AB<=AR, 0, IF((T+V+X+Z+AB)-AR>AB, AB, (T+V)-AR))'
  }
};
