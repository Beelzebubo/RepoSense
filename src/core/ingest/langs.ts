const BY_EXT: Record<string, string> = {
  py: 'python',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  rs: 'rust',
  go: 'go',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  json: 'json',
  md: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  html: 'html',
  css: 'css',
  sh: 'bash',
  bash: 'bash',
  sql: 'sql',
}

const BINARY_EXT = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'pdf', 'zip', 'gz', 'tar', 'rar', '7z',
  'mp3', 'mp4', 'mov', 'avi', 'wav', 'ogg',
  'wasm', 'class', 'jar', 'dll', 'exe', 'so', 'dylib',
])

const IGNORED = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next',
  '__pycache__', '.venv', 'venv', 'target', '.idea', '.vscode',
  'coverage', '.cache', 'vendor',
])

export function languageFor(path: string): string {
  const dot = path.lastIndexOf('.')
  if (dot === -1) return 'text'
  const ext = path.slice(dot + 1).toLowerCase()
  return BY_EXT[ext] ?? 'text'
}

export function isBinaryPath(path: string): boolean {
  const dot = path.lastIndexOf('.')
  if (dot === -1) return false
  return BINARY_EXT.has(path.slice(dot + 1).toLowerCase())
}

export function isIgnored(path: string): boolean {
  const segments = path.split('/')
  return segments.some((s) => IGNORED.has(s))
}

export function isUsableTextFile(path: string): boolean {
  if (isBinaryPath(path)) return false
  if (isIgnored(path)) return false
  const name = path.split('/').pop() ?? path
  const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Cargo.lock', 'poetry.lock']
  if (lockfiles.includes(name)) return false
  return true
}
