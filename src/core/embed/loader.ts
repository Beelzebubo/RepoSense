import { pipeline } from '@huggingface/transformers'
import type { Embedder } from './embedder'

let embedder: Embedder | null = null

export async function loadEmbedder(): Promise<Embedder> {
  if (embedder) return embedder

  const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    dtype: 'fp32',
  })
  await new Promise(r => setTimeout(r, 0))

  embedder = {
    dim: 384,
    ready: Promise.resolve(),
    async embed(texts: string[]): Promise<Float32Array[]> {
      const results: Float32Array[] = []
      for (const text of texts) {
        const output = await pipe(text, { pooling: 'mean', normalize: true })
        const raw = Array.from(output.data as ArrayLike<number>)
        results.push(new Float32Array(raw))
      }
      return results
    },
  }

  return embedder
}
