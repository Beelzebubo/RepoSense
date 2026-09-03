import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadByok, saveByok, clearByok, getGroqPreset, type ByokConfig } from '../core/llm/byok';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const [config, setConfig] = useState<ByokConfig>({ baseUrl: '', apiKey: '', model: '' });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (open) {
      const existing = loadByok();
      if (existing) {
        const preset = getGroqPreset();
        if (!existing.baseUrl || !existing.model || existing.model !== preset.model) {
          setConfig({ ...preset, apiKey: existing.apiKey });
        } else {
          setConfig(existing);
        }
      } else {
        setConfig(getGroqPreset());
      }
      setSaved(false);
      setTestResult('idle');
    }
  }, [open]);

  function applyGroq() {
    const preset = getGroqPreset();
    setConfig(preset);
  }

  async function handleTest() {
    if (!config.apiKey) return;
    setTesting(true);
    setTestResult('idle');
    try {
      const resp = await fetch(`${config.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      setTestResult(resp.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    if (config.apiKey) {
      saveByok(config);
      setSaved(true);
      setTimeout(onClose, 800);
    }
  }

  function handleClear() {
    clearByok();
    setConfig({ baseUrl: '', apiKey: '', model: '' });
    setSaved(false);
    setTestResult('idle');
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md rounded-2xl border border-border bg-bg-surface p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 id="settings-title" className="text-h2 font-semibold text-text-primary">
                API Key Setup
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-text-tertiary transition-colors hover:text-text-primary hover:bg-bg-hover"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Step-by-step guide */}
            <div className="mb-5 rounded-xl bg-bg-raised p-4">
              <p className="text-body-sm font-medium text-text-primary mb-3">
                Quick setup with Groq (free):
              </p>
              <ol className="space-y-2 text-body-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-text-inverse">1</span>
                  <span>Go to <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">console.groq.com</a> and create a free account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-text-inverse">2</span>
                  <span>Navigate to API Keys and create a new key</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-text-inverse">3</span>
                  <span>Copy the key and paste it below</span>
                </li>
              </ol>
              <button
                onClick={applyGroq}
                className="mt-3 w-full rounded-lg border border-accent/30 bg-accent-ghost px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                Use Groq free tier (recommended)
              </button>
            </div>

            {/* Provider selector */}
            <div className="mb-4">
              <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">Provider</label>
              <select
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                className="w-full rounded-xl border border-border bg-bg-input px-3 py-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent/10"
              >
                <option value="https://api.groq.com/openai/v1">Groq (free tier)</option>
                <option value="https://api.openai.com/v1">OpenAI</option>
                <option value="https://api.together.xyz/v1">Together AI</option>
                <option value="http://localhost:11434/v1">Ollama (local)</option>
                <option value="">Custom...</option>
              </select>
            </div>

            {/* Model */}
            <div className="mb-4">
              <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">Model</label>
              <input
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="openai/gpt-oss-20b"
                className="w-full rounded-xl border border-border bg-bg-input px-3 py-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent/10"
              />
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="gsk_..."
                  className="w-full rounded-xl border border-border bg-bg-input px-3 py-2.5 pr-10 text-body text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent/10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M2 2l20 20" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="mb-5 rounded-lg bg-bg-raised px-3 py-2.5 text-center text-caption text-text-secondary">
              Your key stays in this browser only. Never sent to our servers.
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTest}
                disabled={!config.apiKey || testing}
                className="rounded-xl border border-border bg-bg-raised px-4 py-2.5 text-body-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test'}
              </button>

              {testResult === 'success' && (
                <span className="text-body-sm text-success">Connected!</span>
              )}
              {testResult === 'error' && (
                <span className="text-body-sm text-error">Connection failed</span>
              )}

              <div className="flex-1" />

              <button
                onClick={handleClear}
                className="text-body-sm text-text-tertiary transition-colors hover:text-error"
              >
                Clear key
              </button>

              <motion.button
                onClick={handleSave}
                disabled={!config.apiKey}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-accent px-5 py-2.5 text-body-sm font-medium text-text-inverse shadow-sm transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saved ? 'Saved!' : 'Save key'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
