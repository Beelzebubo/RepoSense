import { unzipSync } from 'fflate'

export async function unzipRepo(zipped: Uint8Array): Promise<Map<string, Uint8Array>> {
  const files = unzipSync(zipped)
  const result = new Map<string, Uint8Array>()
  for (const [path, data] of Object.entries(files)) {
    result.set(path, data)
  }
  return result
}
