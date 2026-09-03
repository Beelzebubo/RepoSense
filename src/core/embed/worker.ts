import { pipeline } from '@huggingface/transformers'

const DB_NAME = 'reposense'
const DB_VERSION = 2

interface StoredRepo {
  repoId: string
  vectors: Float32Array
  dim: number
  chunkIds: string[]
  files: any[]
  indexedAt: number
  fileContents: Record<string, string>
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('repos')) {
        db.createObjectStore('repos', { keyPath: 'repoId' })
      }
      if (!db.objectStoreNames.contains('chunks')) {
        const store = db.createObjectStore('chunks', { keyPath: 'id' })
        store.createIndex('repoId', 'repoId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function repoId(url: string): string {
  let h = 0
  for (const c of url) h = (h ^ c.charCodeAt(0)) >>> 0
  return h.toString(36)
}

async function loadChunks(repoUrl: string): Promise<any[]> {
  const db = await openDb()
  const id = repoId(repoUrl)

  const repoData = await new Promise<StoredRepo | undefined>((resolve, reject) => {
    const req = db.transaction('repos').objectStore('repos').get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  if (!repoData) return []

  const chunks: any[] = await Promise.all(
    repoData.chunkIds.map(
      (cid: string) =>
        new Promise<any>((resolve, reject) => {
          const req = db.transaction('chunks').objectStore('chunks').get(cid)
          req.onsuccess = () => resolve(req.result.chunk)
          req.onerror = () => reject(req.error)
        }),
    ),
  )

  return chunks
}

async function saveVectors(repoUrl: string, chunks: any[], vectors: Float32Array[], dim: number) {
  const db = await openDb()
  const id = repoId(repoUrl)

  const allVectors = new Float32Array(chunks.length * dim)
  const chunkIds: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    allVectors.set(vectors[i], i * dim)
    chunkIds.push(chunks[i].id)
  }

  const repoData = await new Promise<StoredRepo | undefined>((resolve, reject) => {
    const req = db.transaction('repos').objectStore('repos').get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  if (!repoData) return

  const tx = db.transaction(['repos'], 'readwrite')
  tx.objectStore('repos').put({
    ...repoData,
    vectors: allVectors,
    dim,
  })

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

self.onmessage = async (e: MessageEvent) => {
  const { type, repoUrl } = e.data

  if (type !== 'embed') return

  try {
    self.postMessage({ type: 'progress', progress: 5, message: 'Loading chunks…' })
    const chunks = await loadChunks(repoUrl)

    if (chunks.length === 0) {
      self.postMessage({ type: 'error', message: 'No chunks found for this repo' })
      return
    }

    self.postMessage({ type: 'progress', progress: 10, message: 'Loading embedding model…' })

    const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      dtype: 'fp32',
    })

    self.postMessage({ type: 'progress', progress: 25, message: 'Generating embeddings…' })

    const dim = 384
    const batchSize = 16
    const allVecs: Float32Array[] = []

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const batchVecs: Float32Array[] = []

      for (const chunk of batch) {
        const output = await pipe(chunk.text, { pooling: 'mean', normalize: true })
        const raw = Array.from(output.data as ArrayLike<number>)
        batchVecs.push(new Float32Array(raw))
      }

      allVecs.push(...batchVecs)

      const pct = Math.round((i / chunks.length) * 60) + 25
      self.postMessage({
        type: 'progress',
        progress: pct,
        message: `Embedding ${Math.min(i + batchSize, chunks.length)}/${chunks.length}…`,
      })
    }

    self.postMessage({ type: 'progress', progress: 90, message: 'Saving index…' })
    await saveVectors(repoUrl, chunks, allVecs, dim)

    self.postMessage({ type: 'done' })
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Embedding failed',
    })
  }
}
