export interface ByokConfig {
  baseUrl: string
  apiKey: string
  model: string
}

const GROQ_PRESET: ByokConfig = {
  baseUrl: 'https://api.groq.com/openai/v1',
  apiKey: '',
  model: 'openai/gpt-oss-20b',
}

export function getGroqPreset(): ByokConfig {
  return { ...GROQ_PRESET }
}

export function loadByok(): ByokConfig | null {
  try {
    const raw = localStorage.getItem('reposense.byok')
    if (!raw) return null
    const config: ByokConfig = JSON.parse(raw)
    const preset = getGroqPreset()
    if (config.model !== preset.model) {
      config.model = preset.model
      if (!config.baseUrl) config.baseUrl = preset.baseUrl
      localStorage.setItem('reposense.byok', JSON.stringify(config))
    }
    return config
  } catch {
    return null
  }
}

export function saveByok(config: ByokConfig): void {
  localStorage.setItem('reposense.byok', JSON.stringify(config))
}

export function clearByok(): void {
  localStorage.removeItem('reposense.byok')
}

export async function* streamByok(
  config: ByokConfig,
  messages: { role: string; content: string }[],
): AsyncGenerator<string> {
  // TODO: add retry logic for rate limits
  const resp = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
    }),
  })

  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`Provider error ${resp.status}: ${body.slice(0, 200)}`)
  }

  const reader = resp.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const parsed: any = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {

      }
    }
  }
}
