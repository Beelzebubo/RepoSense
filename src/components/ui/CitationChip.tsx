import { type MouseEvent } from 'react';
import { motion } from 'motion/react';

interface CitationChipProps {
  file: string;
  line: number;
  onClick: (file: string, line: number) => void;
}

export function CitationChip({ file, line, onClick }: CitationChipProps) {
  return (
    <motion.button
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(file, line);
      }}
      className="inline-flex items-center gap-1 rounded-md bg-accent-ghost px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/15 cursor-pointer font-mono border border-transparent hover:border-accent/20"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Open ${file} at line ${line}`}
    >
      <span>{file}:{line}</span>
    </motion.button>
  );
}
