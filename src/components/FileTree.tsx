import { useMemo, useState } from 'react';
import { useAppState, setState } from '../core/state/store';
import type { FileEntry } from '../core/types';

interface TreeNodeData {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNodeData[];
}

export function FileTree() {
  const { repo, activeFile } = useAppState();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildTree(repo?.files ?? []), [repo]);

  if (!repo) return null;

  function toggle(dir: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dir)) next.delete(dir);
      else next.add(dir);
      return next;
    });
  }

  return (
    <nav className="flex flex-col gap-0.5 overflow-y-auto">
      <div className="mb-2 flex items-center gap-2 px-3 text-caption text-text-secondary border-b border-border-subtle pb-2">
        <span className="font-mono font-medium text-text-primary text-xs">{repo.ref.owner}/{repo.ref.name}</span>
        <span className="text-text-tertiary">&middot; {repo.fileCount} files</span>
      </div>
      {tree.map((node) => (
        <TreeNode
          key={node.name}
          node={node}
          depth={0}
          expanded={expanded}
          activeFile={activeFile}
          onToggle={toggle}
          onSelect={(f) => setState({ activeFile: f, activeLine: null })}
        />
      ))}
    </nav>
  );
}

interface TreeNodeProps {
  node: TreeNodeData;
  depth: number;
  expanded: Set<string>;
  activeFile: string | null;
  onToggle: (dir: string) => void;
  onSelect: (file: string) => void;
}

function TreeNode({ node, depth, expanded, activeFile, onToggle, onSelect }: TreeNodeProps) {
  const pl = depth * 12 + 12;
  const isExpanded = expanded.has(node.path);
  const isActive = !node.isDir && activeFile === node.path;

  if (node.isDir) {
    return (
      <div>
        <button
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-body-sm text-text-secondary transition-colors hover:bg-bg-hover rounded-md mx-1"
          style={{ paddingLeft: pl }}
          onClick={() => onToggle(node.path)}
        >
          <span
            className="text-text-tertiary text-xs transition-transform"
            style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            &#9654;
          </span>
          <FolderIcon open={isExpanded} />
          <span className="truncate font-medium text-text-primary">{node.name}</span>
        </button>
        {isExpanded && (
          <div className="overflow-hidden">
            {node.children!.map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                activeFile={activeFile}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-body-sm transition-colors rounded-md mx-1 ${
        isActive
          ? 'bg-accent-ghost text-accent font-medium'
          : 'text-text-secondary hover:bg-bg-hover'
      }`}
      style={{ paddingLeft: pl }}
      onClick={() => onSelect(node.path)}
    >
      <FileIcon name={node.name} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-4 w-4 flex-shrink-0 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </>
      ) : (
        <>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </>
      )}
    </svg>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  let color = 'text-text-tertiary';
  if (['ts', 'tsx'].includes(ext || '')) color = 'text-blue-400';
  else if (['js', 'jsx'].includes(ext || '')) color = 'text-yellow-500';
  else if (ext === 'py') color = 'text-green-500';
  else if (ext === 'rs') color = 'text-orange-400';
  else if (ext === 'go') color = 'text-cyan-400';
  else if (ext === 'css') color = 'text-pink-400';
  else if (ext === 'md') color = 'text-text-secondary';

  return (
    <svg className={`h-4 w-4 flex-shrink-0 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function buildTree(files: FileEntry[]): TreeNodeData[] {
  const root: TreeNodeData[] = [];
  for (const file of files) {
    const parts = file.path.split('/');
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isDir = i < parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join('/');

      let existing = cursor.find((n) => n.name === name);
      if (!existing) {
        existing = { name, path: fullPath, isDir, children: isDir ? [] : undefined };
        cursor.push(existing);
      }
      if (isDir) cursor = existing.children!;
    }
  }
  return sortNodes(root);
}

function sortNodes(nodes: TreeNodeData[]): TreeNodeData[] {
  nodes.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const n of nodes) {
    if (n.children) sortNodes(n.children);
  }
  return nodes;
}
