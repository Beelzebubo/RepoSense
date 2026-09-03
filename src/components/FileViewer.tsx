import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppState, setState } from '../core/state/store';

export function FileViewer() {
  const { activeFile, activeLine, fileContents } = useAppState();
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFile) {
      setContent(null);
      return;
    }
    const text = fileContents[activeFile] ?? null;
    setContent(text);
  }, [activeFile, fileContents]);

  if (!activeFile) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex h-full w-96 flex-col border-l border-border bg-bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-body-sm text-text-primary truncate max-w-[250px]">{activeFile}</span>
        <div className="flex items-center gap-2">
          {activeLine && (
            <span className="text-caption text-text-tertiary">line {activeLine}</span>
          )}
          <button
            onClick={() => setState({ activeFile: null, activeLine: null })}
            className="rounded-md p-1 text-text-tertiary transition-colors hover:text-text-primary hover:bg-bg-hover"
            aria-label="Close file viewer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {content ? (
          <pre className="font-mono text-mono text-text-primary">
            {content.split('\n').map((line, i) => (
              <div
                key={i}
                className={`flex ${
                  activeLine && i + 1 === activeLine
                    ? 'bg-accent-ghost border-l-2 border-accent'
                    : ''
                }`}
              >
                <span className="mr-4 inline-block w-8 select-none text-right text-text-tertiary text-xs">
                  {i + 1}
                </span>
                <span>{line || ' '}</span>
              </div>
            ))}
          </pre>
        ) : (
          <p className="text-body-sm text-text-tertiary">
            {activeFile}:{activeLine ? ` line ${activeLine}` : ''}
          </p>
        )}
      </div>
    </motion.div>
  );
}
