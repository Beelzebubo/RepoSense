import type { Chunk } from '../types'
import { streamByok, loadByok } from '../llm/byok'
import { getLocalLLM } from '../llm/local'
import { getEmbedder } from '../embed/embedder'
import { cosineTopK } from '../retrieve/retriever'

export interface ChatEngine {
  repoUrl: string
  chunks: Chunk[]
  vectors: Float32Array
  dim: number
}

let engine: ChatEngine | null = null

export function setEngine(e: ChatEngine) {
  engine = e
}

export async function* ask(
  question: string,
  contextText: string,
): AsyncGenerator<string> {
  const byok = loadByok()

  if (byok?.apiKey) {
    const systemPrompt = buildSystemPrompt(contextText)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ]
    yield* streamByok(byok, messages)
    return
  }

  const local = await getLocalLLM()
  yield* local.generate(buildSystemPrompt(contextText) + '\n\nUser: ' + question)
}

function buildSystemPrompt(context: string): string {
  return `You are RepoSense, a helpful code assistant. Answer the user's question about the codebase using ONLY the provided code context. Cite specific files and line numbers in your answer using [file:line] format. Be concise and direct.

Code context:
${context}`
}

export async function retrieveForQuery(query: string): Promise<{
  chunks: Chunk[]
  context: string
}> {
  if (!engine) throw new Error('No repo loaded')

  if (engine.vectors.length === 0 || engine.dim === 0) {
    return { chunks: [], context: '' }
  }

  const embedder = await getEmbedder()
  const [queryVec] = await embedder.embed([query])
  const result = cosineTopK(queryVec, engine.vectors, engine.dim, engine.chunks, 8)

  return { chunks: result.chunks, context: result.context }
}
