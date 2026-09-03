import type { RepoRef } from '../types'

const GITHUB_RE = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)\/?$/

export function parseRepoUrl(input: string): RepoRef | null {
  const match = input.trim().match(GITHUB_RE)
  if (!match) return null
  const owner = match[2]
  const name = match[3].replace(/\.git$/, '')
  return { url: `https://github.com/${owner}/${name}`, name, owner }
}

export function codeloadUrl(ref: RepoRef, branch = 'HEAD'): string {
  const raw = `https://codeload.github.com/${ref.owner}/${ref.name}/zip/${branch}`
  if (import.meta.env.DEV) return `/proxy/codeload${new URL(raw).pathname}`
  const proxy = import.meta.env.VITE_CORS_PROXY
  if (!proxy) throw new Error('CORS proxy not configured for production. Set VITE_CORS_PROXY or deploy the Cloudflare Worker.')
  return `${proxy}?url=${encodeURIComponent(raw)}`
}
