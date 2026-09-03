import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { parseRepoUrl } from '../core/ingest/githubFetch';
import { ingest } from '../core/ingest/pipeline';
import { setState } from '../core/state/store';
import { Button } from './ui/Button';
import { Spinner } from '@phosphor-icons/react';
import { StrataMark } from './ui/StrataMark';

export function RepoInput() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const ref = parseRepoUrl(url);
    if (!ref) {
      setError('That does not look like a GitHub repo URL.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await ingest(ref);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Excavation failed';
      setError(msg);
      setState({ ingestion: { stage: 'error', progress: 0, error: msg } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="w-full"
    >
      <div className="relative flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="repo-url" className="sr-only">
            GitHub repository URL
          </label>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <StrataMark name="module-1" size={18} className="text-text-tertiary" aria-hidden="true" />
          </div>
          <input
            id="repo-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
            className="w-full rounded-md border border-border bg-bg-input py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:bg-bg-input-focus focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-mono-ui"
          />
        </div>
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? (
            <>
              <Spinner className="h-4 w-4 animate-spin" />
              <span>EXCAVATING…</span>
            </>
          ) : (
            <>
              <StrataMark name="excavation" size={16} className="shrink-0" aria-hidden="true" />
              <span>EXCAVATE</span>
            </>
          )}
        </Button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-error font-ui"
        >
          {error}
        </motion.p>
      )}
    </motion.form>
  );
}