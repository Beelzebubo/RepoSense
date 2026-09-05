import { useAppState } from '../core/state/store';

export function EmbeddingOverlay() {
  const { ingestion } = useAppState();

  if (ingestion.stage !== 'embed' && ingestion.stage !== 'index') return null;

  return (
    <div className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
      <div className="flex items-center gap-3 rounded-2xl bg-bg-surface px-5 py-3 shadow-lg border border-border">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <div>
          <p className="text-body-sm font-medium text-text-primary">
            {ingestion.message || (ingestion.stage === 'embed' ? 'Generating embeddings...' : 'Saving index...')}
          </p>
          <div className="mt-1.5 h-1 w-40 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${ingestion.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
