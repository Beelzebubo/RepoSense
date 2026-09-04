import type { Chunk, FileEntry, Repo, RepoRef } from '../types'
import { setState } from '../state/store'
import { chunkFile } from '../chunk/chunker'
import { buildManifest } from './treeWalk'
import { codeloadUrl } from './githubFetch'
import { unzipRepo } from './unzip'
import { saveChunksOnly, loadIndex, repoId } from '../index/idb'
import { setEngine } from '../chat/engine'

export async function ingest(ref: RepoRef): Promise<{ repo: Repo; chunks: Chunk[] }> {
  const url = ref.url
  console.log('[RepoSense] starting ingest for', url)

  const cached = await loadIndex(url)
  if (cached) {
    const repo: Repo = {
      ref,
      files: cached.files,
      indexedAt: Date.now(),
      fileCount: cached.files.length,
      chunkCount: cached.chunks.length,
    }
    setState({
      repo,
      ingestion: { stage: 'done', progress: 100 },
      messages: [],
      fileContents: cached.fileContents,
    })
    setEngine({
      repoUrl: url,
      chunks: cached.chunks,
      vectors: cached.vectors,
      dim: cached.dim,
    })
    return { repo, chunks: cached.chunks }
  }

  setState({ ingestion: { stage: 'fetch', progress: 0, message: 'Fetching repo archive…' } })
  const archiveUrl = codeloadUrl(ref)
  console.log('[RepoSense] fetching archive from', archiveUrl)
  const resp = await fetch(archiveUrl)
  if (!resp.ok) throw new Error(`Failed to fetch repo (${resp.status})`)
  const buf = await resp.arrayBuffer()
  const zip = new Uint8Array(buf)

  setState({ ingestion: { stage: 'fetch', progress: 100, message: 'Unzipping…' } })
  const files = await unzipRepo(zip)

  setState({ ingestion: { stage: 'chunk', progress: 0, message: 'Building manifest…' } })
  const manifest = buildManifest(files)
  // console.log('manifest:', manifest.length, 'files')

  setState({ ingestion: { stage: 'chunk', progress: 20, message: 'Chunking files…' } })
  const { chunks: allChunks, fileContents } = chunkManifest(manifest, files)
  console.log('[RepoSense] chunked', allChunks.length, 'chunks from', manifest.length, 'files')

  const repo: Repo = {
    ref,
    files: manifest,
    indexedAt: Date.now(),
    fileCount: manifest.length,
    chunkCount: allChunks.length,
  }

  setState({
    repo,
    ingestion: { stage: 'embed', progress: 0, message: 'Queued for embedding...' },
    messages: [],
    fileContents,
  })

  setEngine({
    repoUrl: url,
    chunks: allChunks,
    vectors: new Float32Array(0),
    dim: 0,
  })

  await saveChunksOnly(url, allChunks, manifest, fileContents)
  embedInBackground(url)

  return { repo, chunks: allChunks }
}

function embedInBackground(url: string) {
  const worker = new Worker(
    new URL('../embed/worker.ts', import.meta.url),
    { type: 'module' }
  )

  worker.postMessage({ type: 'embed', repoUrl: url })

  worker.onmessage = (e: MessageEvent) => {
    const { type, progress, message } = e.data as any

    if (type === 'progress') {
      setState({ ingestion: { stage: 'embed', progress, message } })
    } else if (type === 'done') {
      loadIndex(url).then((cached) => {
        if (cached) {
          setEngine({
            repoUrl: url,
            chunks: cached.chunks,
            vectors: cached.vectors,
            dim: cached.dim,
          })
        }
      })
      setState({ ingestion: { stage: 'done', progress: 100 } })
      worker.terminate()
    } else if (type === 'error') {
      console.error('Embedding failed:', message)
      setState({ ingestion: { stage: 'done', progress: 100, message: 'Embedding skipped' } })
      worker.terminate()
    }
  }

  worker.onerror = (err) => {
    console.error('Worker error:', err)
    setState({ ingestion: { stage: 'done', progress: 100, message: 'Embedding skipped' } })
    worker.terminate()
  }
}

function chunkManifest(manifest: FileEntry[], files: Map<string, Uint8Array>): { chunks: Chunk[]; fileContents: Record<string, string> } {
  const chunks: Chunk[] = []
  const fileContents: Record<string, string> = {}
  let processed = 0
  for (const entry of manifest) {
    const rawPath = findRawPath(entry.path, files)
    if (!rawPath) continue
    const bytes = files.get(rawPath)
    if (!bytes) continue
    const text = new TextDecoder().decode(bytes)
    fileContents[entry.path] = text
    chunks.push(...chunkFile(repoId(entry.path), entry.path, text))
    processed++
    // update progress every 20 files so it doesnt spam state updates
    if (processed % 20 === 0 || processed === manifest.length) {
      const pct = Math.round((processed / manifest.length) * 80) + 20
      setState({ ingestion: { stage: 'chunk', progress: pct, message: `Chunking ${processed}/${manifest.length}…` } })
    }
  }
  return { chunks, fileContents }
}

// this strips the leading folder name from the zip entry (e.g. "repo-main/src/App.tsx" -> "src/App.tsx")
// took me a while to figure out why paths werent matching lol
function findRawPath(relative: string, files: Map<string, Uint8Array>): string | null {
  for (const k of files.keys()) {
    const stripped = k.replace(/^[^/]+\//, '')
    if (stripped === relative) return k
  }
  return null
}
