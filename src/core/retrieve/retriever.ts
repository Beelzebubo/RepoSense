import type { Chunk, Citation } from '../types'

export interface RetrievalResult {
  chunks: Chunk[]
  citations: Citation[]
  context: string
}

export function cosineTopK(
  queryVec: Float32Array,
  vectors: Float32Array,
  dim: number,
  chunks: Chunk[],
  k = 8,
): RetrievalResult {
  const n = vectors.length / dim
  const scores: { idx: number; score: number }[] = []

  for (let i = 0; i < n; i++) {
    let dot = 0
    let normA = 0
    let normB = 0
    for (let d = 0; d < dim; d++) {
      const a = queryVec[d]
      const b = vectors[i * dim + d]
      dot += a * b
      normA += a * a
      normB += b * b
    }
    scores.push({ idx: i, score: dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8) })
  }

  scores.sort((a, b) => b.score - a.score)
  const top = scores.slice(0, k)

  const resultChunks: Chunk[] = []
  const citations: Citation[] = []
  const lines: string[] = []

  for (const { idx } of top) {
    const chunk = chunks[idx]
    if (!chunk) continue
    resultChunks.push(chunk)
    citations.push({ file: chunk.file, line: chunk.startLine })
    lines.push(`[${chunk.file}:${chunk.startLine}]\n${chunk.text}`)
  }

  return {
    chunks: resultChunks,
    citations: dedup(citations),
    context: lines.join('\n\n'),
  }
}

function dedup(citations: Citation[]): Citation[] {
  const seen = new Set<string>()
  return citations.filter((c) => {
    const key = `${c.file}:${c.line}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
