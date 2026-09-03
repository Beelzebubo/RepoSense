import { useState, useEffect } from 'react';
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

  return (
    <div className="flex h-full flex-1 min-w-0 flex-col border-l border-border bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-body-sm text-text-primary truncate max-w-[250px]">{activeFile ?? 'Code'}</span>
        {activeFile && (
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
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {activeFile && content ? (
          <pre className="font-mono text-mono text-text-primary whitespace-pre">
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
          <div className="flex h-full items-center justify-center">
            <p className="text-body-sm text-text-tertiary">
              {activeFile ? `${activeFile}${activeLine ? ` line ${activeLine}` : ''}` : 'Select a file to view'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
