import Node from './Node'
import Range from './Range'

export default class QuoteSingle extends Node {
  static endOfQuote (src, offset) {
    let ch = src[offset]
    while (ch) {
      if (ch === "'") {
        if (src[offset + 1] !== "'") break
        ch = src[offset += 2]
      } else {
        ch = src[offset += 1]
      }
    }
    return offset + 1
  }

  /**
   * @throws {SyntaxError} on missing closing quote and on document boundary
   * indicators
   */
  get strValue () {
    if (!this.valueRange || !this.context) return null
    const errors = []
    const { start, end } = this.valueRange
    const { src } = this.context
    if (src[end - 1] !== "'") errors.push(new SyntaxError('Missing closing \'quote'))
    const raw = src.slice(start + 1, end - 1)
    if (/\n(?:---|\.\.\.)(?:[\n\t ]|$)/.test(raw)) errors.push(new SyntaxError(
      'Document boundary indicators are not allowed within string values'))
    const str = raw
      .replace(/''/g, "'")
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n+/g, nl => nl.length === 1 ? ' ' : '\n')
    return errors.length > 0 ? { errors, str } : str
  }

  /**
   * Parses a 'single quoted' value from the source
   *
   * @param {ParseContext} context
   * @param {number} start - Index of first character
   * @returns {number} - Index of the character after this scalar
   */
  parse (context, start) {
    this.context = context
    const { src } = context
    let offset = QuoteSingle.endOfQuote(src, start + 1)
    this.valueRange = new Range(start, offset)
    offset = Node.endOfWhiteSpace(src, offset)
    offset = this.parseComment(offset)
    trace: this.type, { valueRange: this.valueRange, comment: this.comment }, JSON.stringify(this.rawValue)
    return offset
  }
}