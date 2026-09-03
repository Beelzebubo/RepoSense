import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppState, setState, getState } from '../core/state/store';
import type { ChatMessage, Citation } from '../core/types';
import { ask, retrieveForQuery } from '../core/chat/engine';
import { MessageBubble } from './MessageBubble';
import { loadByok } from '../core/llm/byok';

interface Props {
  onOpenSettings: () => void;
}

export function ChatWindow({ onOpenSettings }: Props) {
  const { messages } = useAppState();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || streaming) return;

    const byok = loadByok();
    if (!byok?.apiKey) {
      onOpenSettings();
      return;
    }

    setInput('');
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: q };

    const { ingestion } = getState();
    if (ingestion.stage !== 'done') {
      const waitMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Still indexing the codebase... try again in a moment.',
      };
      setState({ messages: [...messages, userMsg, waitMsg] });
      return;
    }

    setState({ messages: [...messages, userMsg] });
    setStreaming(true);

    try {
      const { context } = await retrieveForQuery(q);
      let full = '';
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        citations: [],
      };

      setState({ messages: [...messages, userMsg, assistantMsg] });

      for await (const chunk of ask(q, context)) {
        full += chunk;
        const citations = extractCitations(full);
        setState((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: full, citations } : m,
          ),
        }));
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`,
      };
      setState((s) => ({ messages: [...s.messages, userMsg, errorMsg] }));
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const hasKey = !!loadByok()?.apiKey;

  return (
    <div className="flex flex-1 min-w-0 flex-col overflow-hidden bg-bg-canvas">
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex h-full items-center justify-center"
          >
            <div className="text-center max-w-md">
              <p className="text-h3 font-semibold text-text-primary mb-2">
                Ask anything about this code
              </p>
              <p className="text-body-sm text-text-secondary">
                Try: "Where is the main entry point?" or "How does error handling work?"
              </p>
              {!hasKey && (
                <motion.button
                  onClick={onOpenSettings}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 rounded-full border border-border bg-bg-surface px-5 py-2 text-sm font-medium text-text-secondary shadow-sm transition-all hover:bg-bg-hover"
                >
                  Set up API key to start chatting
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border bg-bg-surface p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={hasKey ? "Ask a question about this code..." : "Set up an API key to start chatting"}
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-border bg-bg-input px-4 py-3 text-body text-text-primary placeholder:text-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          />
          <motion.button
            onClick={send}
            disabled={!input.trim() || streaming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-accent px-5 py-3 text-body font-medium text-text-inverse shadow-sm transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {streaming ? 'Thinking...' : 'Ask'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function extractCitations(text: string): Citation[] {
  const regex = /\[([^\]]+?):(\d+)\]/g;
  const citations: Citation[] = [];
  const seen = new Set<string>();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = `${match[1]}:${match[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    citations.push({ file: match[1], line: parseInt(match[2]) });
  }
  return citations;
}
