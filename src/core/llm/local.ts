export interface LocalLLM {
  ready: Promise<void>
  generate(prompt: string): AsyncGenerator<string>
}

let instance: LocalLLM | null = null

export async function getLocalLLM(): Promise<LocalLLM> {
  if (instance) return instance
  
  
  instance = {
    ready: Promise.resolve(),
    async *generate() {
      yield 'Local model not loaded yet. Use BYOK for instant answers — click the button.\n\n'
      yield 'To use a free Groq key, visit console.groq.com and grab one.'
    },
  }
  return instance
}
