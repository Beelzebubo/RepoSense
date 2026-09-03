import type { Chunk } from '../types'

const MAX_CHARS = 1800
const OVERLAP = 200

export function chunkFile(id: string, file: string, text: string): Chunk[] {
  const lines = text.split('\n')
  const chunks: Chunk[] = []
  let start = 0

  while (start < lines.length) {
    let cursor = start
    let nextBoundary = -1

    while (cursor < lines.length && lineLength(lines.slice(start, cursor + 1)) <= MAX_CHARS) {
      if (isScopeBoundary(lines[cursor])) nextBoundary = cursor
      cursor++
    }

    const end = nextBoundary >= start ? nextBoundary + 1 : Math.max(start + 1, cursor)
    const chunkText = lines.slice(start, end).join('\n')
    chunks.push({
      id: `${id}::${file}::${start + 1}`,
      file,
      startLine: start + 1,
      endLine: end,
      text: chunkText,
      tokens: Math.ceil(chunkText.length / 4),
    })

    const next = Math.max(start + 1, end - overlapLines(lines, start, end))
    if (next <= start) break
    start = next
  }

  return chunks
}

function isScopeBoundary(line: string): boolean {
  return /^\s*(def |class |function |fn |public |private |export |async |const |func |impl |trait )/.test(line)
}

function lineLength(lines: string[]): number {
  return lines.reduce((sum, l) => sum + l.length + 1, 0)
}

function overlapLines(lines: string[], from: number, to: number): number {
  let chars = 0
  let n = 0
  for (let i = to - 1; i >= from && chars < OVERLAP; i--) {
    chars += lines[i].length + 1
    n++
  }
  return Math.max(0, n - 1)
}
