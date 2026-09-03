import { motion } from 'motion/react';
import { useAppState } from '../core/state/store';
import { FileTree } from './FileTree';
import { ChatWindow } from './ChatWindow';
import { FileViewer } from './FileViewer';
import { IndexProgress } from './IndexProgress';
import { FloatingDots } from './FloatingDots';

interface Props {
  onOpenSettings: () => void;
}

export function Workspace({ onOpenSettings }: Props) {
  const { activeFile } = useAppState();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col overflow-hidden"
    >
      <FloatingDots count={8} />
      <IndexProgress />
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-body-sm font-semibold text-text-primary">
              Files
            </span>
            <button
              onClick={onOpenSettings}
              className="rounded-md px-2.5 py-1.5 text-caption text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-secondary"
              title="API Key Settings"
            >
              Settings
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <FileTree />
          </div>
        </aside>

        <ChatWindow onOpenSettings={onOpenSettings} className="w-[640px] shrink-0" />
        <FileViewer />
      </div>
    </motion.div>
  );
}
