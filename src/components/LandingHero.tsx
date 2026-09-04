import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { parseRepoUrl } from '../core/ingest/githubFetch';
import { ingest } from '../core/ingest/pipeline';
import { setState } from '../core/state/store';
import { CherryBlossomTree } from './CherryBlossomTree';

interface Props {
  onOpenSettings: () => void;
}

export function LandingHero({ onOpenSettings }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    console.log('[RepoSense] submitting url:', url);
    const ref = parseRepoUrl(url);
    if (!ref) {
      setError('Please enter a valid GitHub repo URL');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await ingest(ref);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      setState({ ingestion: { stage: 'error', progress: 0, error: msg } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute right-0 bottom-0 z-0 opacity-50 hidden md:block">
        <CherryBlossomTree className="h-[550px] w-[380px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-display font-bold tracking-tight text-text-primary"
        >
          RepoSense
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-3 text-h2 text-text-secondary"
        >
          Chat with your code. Get cited answers.
        </motion.p>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 w-full"
        >
          <div className="rounded-2xl bg-bg-surface p-1.5 shadow-md transition-shadow focus-within:shadow-lg">
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a GitHub repo URL..."
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
              className="w-full rounded-xl bg-bg-input px-5 py-4 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-error"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-4 flex items-center justify-center gap-3">
            <motion.button
              type="submit"
              disabled={!url.trim() || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-accent px-8 py-3 text-body font-medium text-text-inverse shadow-md transition-all hover:bg-accent-dim hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Started'}
            </motion.button>

            <motion.button
              type="button"
              onClick={onOpenSettings}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-border bg-bg-surface px-6 py-3 text-body font-medium text-text-secondary shadow-sm transition-all hover:bg-bg-hover hover:text-text-primary"
            >
              Set up API key
            </motion.button>
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-caption text-text-tertiary"
        >
          Free &middot; Open source &middot; Your code never leaves your browser
        </motion.p>


      </div>
    </section>
  );
}
