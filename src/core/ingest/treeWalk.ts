import type { FileEntry } from '../types'
import { isUsableTextFile, languageFor } from './langs'

const TOP_LEVEL = /^[^/]+\//

export function stripTopLevel(path: string): string {
  return path.replace(TOP_LEVEL, '')
}

export function buildManifest(files: Map<string, Uint8Array>): FileEntry[] {
  const manifest: FileEntry[] = []
  for (const [rawPath, bytes] of files) {
    const path = stripTopLevel(rawPath)
    if (!path || !isUsableTextFile(path)) continue
    manifest.push({ path, lang: languageFor(path), size: bytes.byteLength })
  }
  manifest.sort((a, b) => a.path.localeCompare(b.path))
  return manifest
}
