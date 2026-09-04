import { useSyncExternalStore } from 'react'
import type { ChatMessage, IngestionState, Repo } from '../types'

export interface State {
  repo: Repo | null
  ingestion: IngestionState
  messages: ChatMessage[]
  activeFile: string | null
  activeLine: number | null
  fileContents: Record<string, string>
}

const initialState: State = {
  repo: null,
  ingestion: { stage: 'idle', progress: 0 },
  messages: [],
  activeFile: null,
  activeLine: null,
  fileContents: {},
}

let state: State = initialState
const listeners = new Set<() => void>()

function emit(next: State) {
  state = next
  listeners.forEach((l) => l())
}

export function getState(): State {
  return state
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  // console.log('[store] setState', typeof patch === 'function' ? 'fn' : Object.keys(patch))
  emit(typeof patch === 'function' ? { ...state, ...patch(state) } : { ...state, ...patch })
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppState(): State {
  return useSyncExternalStore(subscribe, getState, getState)
}