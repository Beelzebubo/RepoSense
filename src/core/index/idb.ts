import type { Chunk, FileEntry } from '../types'

const DB_NAME = 'reposense'
const DB_VERSION = 2

interface StoredRepo {
  repoId: string
  vectors: Float32Array
  dim: number
  chunkIds: string[]
  files: FileEntry[]
  indexedAt: number
  fileContents: Record<string, string>
}

interface StoredChunk {
  id: string
  repoId: string
  chunk: Chunk
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

export function repoId(url: string): string {
  let h = 0
  for (const c of url) h = (h ^ c.charCodeAt(0)) >>> 0
  return h.toString(36)
}

export async function saveIndex(
  url: string,
  chunks: Chunk[],
  vectors: Float32Array[],
  dim: number,
  files: FileEntry[] = [],
  fileContents: Record<string, string> = {},
): Promise<void> {
  const db = await openDb()
  const id = repoId(url)

  const allVectors = new Float32Array(chunks.length * dim)
  const chunkIds: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    allVectors.set(vectors[i], i * dim)
    chunkIds.push(chunks[i].id)
  }

  const tx = db.transaction(['repos', 'chunks'], 'readwrite')
  tx.objectStore('repos').put({
    repoId: id,
    vectors: allVectors,
    dim,
    chunkIds,
    files,
    indexedAt: Date.now(),
    fileContents,
  } satisfies StoredRepo)

  for (const chunk of chunks) {
    tx.objectStore('chunks').put({ id: chunk.id, repoId: id, chunk } satisfies StoredChunk)
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadIndex(
  url: string,
): Promise<{ chunks: Chunk[]; vectors: Float32Array; dim: number; files: FileEntry[]; fileContents: Record<string, string> } | null> {
  const db = await openDb()
  const id = repoId(url)

  const repoData = await new Promise<StoredRepo | undefined>((resolve, reject) => {
    const req = db.transaction('repos').objectStore('repos').get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  if (!repoData) return null

  const chunks: Chunk[] = await Promise.all(
    repoData.chunkIds.map(
      (cid) =>
        new Promise<Chunk>((resolve, reject) => {
          const req = db.transaction('chunks').objectStore('chunks').get(cid)
          req.onsuccess = () => resolve(req.result.chunk)
          req.onerror = () => reject(req.error)
        }),
    ),
  )

  return { chunks, vectors: repoData.vectors, dim: repoData.dim, files: repoData.files ?? [], fileContents: repoData.fileContents ?? {} }
}
