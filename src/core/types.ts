export interface RepoRef {
    url: string
    name: string
    owner: string
}

export interface FileEntry {
    path: string
    lang: string
    size: number
}

export interface Repo {
    ref: RepoRef
    files: FileEntry[]
    indexedAt: number
    fileCount: number
    chunkCount: number
}

export interface Chunk {
    id: string
    file: string
    startLine: number
    endLine: number
    text: string
    tokens: number
}

export interface Citation {
    file: string
    line: number
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    citations?: Citation[]
}

export type IngestionStage = 'idle' | 'fetch' | 'chunk' | 'embed' | 'index' | 'done' | 'error'

export interface IngestionState {
    stage: IngestionStage
    progress: number
    message?: string
    error?: string
}