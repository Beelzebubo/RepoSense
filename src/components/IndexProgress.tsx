import { useAppState } from '../core/state/store';
import type { IngestionStage } from '../core/types';
import { motion } from 'motion/react';

const STAGES: { key: IngestionStage; label: string }[] = [
  { key: 'fetch', label: 'Fetching' },
  { key: 'chunk', label: 'Indexing' },
  { key: 'embed', label: 'Analyzing' },
  { key: 'index', label: 'Building' },
];

export function IndexProgress() {
  const { ingestion } = useAppState();
  if (ingestion.stage === 'idle' || ingestion.stage === 'done' || ingestion.stage === 'error') return null;

  const currentIdx = STAGES.findIndex((s) => s.key === ingestion.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border-b border-border bg-bg-surface/80 px-4 py-3 backdrop-blur-sm"
    >
      <div className="mb-2 flex items-center gap-3">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                i < currentIdx
                  ? 'bg-success'
                  : i === currentIdx
                    ? 'bg-accent animate-pulse'
                    : 'bg-border'
              }`}
            />
            <span
              className={`text-caption font-medium ${
                i <= currentIdx ? 'text-text-primary' : 'text-text-tertiary'
              }`}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
      {ingestion.message && (
        <p className="text-caption text-text-secondary">
          {ingestion.message}
        </p>
      )}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ingestion.progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full bg-accent rounded-full"
        />
      </div>
    </motion.div>
  );
}
