import { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function OnboardingOverlay({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const done = localStorage.getItem('reposense.onboarded');
    if (done) {
      setVisible(false);
      onComplete();
    }
  }, [onComplete]);

  function dismiss() {
    localStorage.setItem('reposense.onboarded', 'true');
    setVisible(false);
    onComplete();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={dismiss} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-bg-surface p-8 shadow-lg">
        <h2 className="text-h2 font-semibold text-text-primary mb-3">
          Welcome to RepoSense
        </h2>
        <p className="text-body-sm text-text-secondary mb-4 leading-relaxed">
          Chat with any GitHub repository. Paste a URL, wait for indexing, then ask questions about the code.
          Every answer cites exact files and line numbers you can click.
        </p>
        <ul className="text-body-sm text-text-secondary mb-5 space-y-1.5">
          <li>- Everything runs in your browser. No server, no signup.</li>
          <li>- You will need a free API key from Groq (console.groq.com)</li>
          <li>- First time indexing takes a while, after that it is cached</li>
        </ul>
        <button
          onClick={dismiss}
          className="w-full rounded-xl bg-accent px-5 py-2.5 text-body-sm font-medium text-text-inverse transition-colors hover:bg-accent-dim"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
