import { useState, useEffect } from 'react';
import { loadByok, saveByok, clearByok, getGroqPreset, type ByokConfig } from '../core/llm/byok';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      const existing = loadByok();
      setKey(existing?.apiKey ?? '');
      setSaved(false);
    }
  }, [open]);

  function handleSave() {
    if (!key.trim()) return;
    const preset = getGroqPreset();
    const config: ByokConfig = { ...preset, apiKey: key.trim() };
    saveByok(config);
    setSaved(true);
    setTimeout(onClose, 600);
  }

  function handleClear() {
    clearByok();
    setKey('');
    setSaved(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-h2 font-semibold text-text-primary mb-4">
          API Key Setup
        </h2>

        <p className="text-body-sm text-text-secondary mb-3">
          Get a free key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">console.groq.com</a>
        </p>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="gsk_..."
          className="w-full rounded-xl border border-border bg-bg-input px-4 py-2.5 text-body text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent/10 mb-4"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="text-body-sm text-text-tertiary transition-colors hover:text-error"
          >
            Clear
          </button>
          <div className="flex-1" />
          {saved && <span className="text-body-sm text-success">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-body-sm font-medium text-text-inverse transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
