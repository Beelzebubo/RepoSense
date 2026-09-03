export interface Embedder {
  dim: number
  ready: Promise<void>
  embed(texts: string[]): Promise<Float32Array[]>
}

let instance: Embedder | null = null

export async function getEmbedder(): Promise<Embedder> {
  if (instance) return instance
  const { loadEmbedder } = await import('./loader')
  instance = await loadEmbedder()
  return instance
}
