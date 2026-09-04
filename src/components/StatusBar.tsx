import { useAppState } from '../core/state/store';
import type { IngestionStage } from '../core/types';

const LABELS: Record<IngestionStage, string> = {
  idle: 'Paste a repo URL to get started',
  fetch: 'Fetching repo...',
  chunk: 'Indexing files...',
  embed: 'Building embeddings...',
  index: 'Finalizing index...',
  done: 'Ready to chat!',
  error: 'Something went wrong',
  // idle: 'Waiting...',
};

interface Props {
  onOpenSettings?: () => void;
}

export function StatusBar({ onOpenSettings }: Props) {
  const { ingestion } = useAppState();

  const getStatusIcon = () => {
    if (ingestion.stage === 'error') return <span className="text-error">&#10007;</span>;
    if (ingestion.stage === 'done') return <span className="text-success">&#10003;</span>;
    if (ingestion.stage !== 'idle') return <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />;
    return <span className="text-text-tertiary">&#8226;</span>;
  };

  return (
    <footer className="border-t border-border bg-bg-surface px-4 py-2">
      <div className="flex items-center justify-between text-caption text-text-tertiary">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span>{LABELS[ingestion.stage]}</span>
          {ingestion.stage === 'error' && ingestion.error && (
            <span className="text-error">{ingestion.error}</span>
          )}
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-text-tertiary transition-colors hover:text-text-secondary"
            title="API Key Settings"
          >
            Settings
          </button>
        )}
      </div>
    </footer>
  );
}
