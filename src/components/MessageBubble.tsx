import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import type { ChatMessage } from '../core/types';
import { setState } from '../core/state/store';
import { CitationChip } from './ui/CitationChip';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-body leading-relaxed ${
          isUser
            ? 'bg-accent text-text-inverse rounded-tr-sm shadow-sm'
            : 'bg-bg-surface text-text-primary rounded-tl-sm shadow-sm border border-border'
        }`}
      >
        {isUser ? (
          <p className="text-pretty">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:text-text-primary prose-a:text-accent prose-code:text-text-code prose-code:bg-bg-code prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <pre className="overflow-x-auto rounded-lg bg-bg-code p-3 text-mono text-text-code border border-border">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="rounded-md bg-bg-code px-1.5 py-0.5 text-text-code text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                a({ href, children }) {
                  if (href?.startsWith('cite:')) {
                    const [, file, line] = href.split(':');
                    return (
                      <CitationChip file={file} line={parseInt(line)} onClick={() => {}} />
                    );
                  }
                  return <a href={href} className="text-accent underline underline-offset-2">{children}</a>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.citations.map((c, i) => (
              <CitationChip key={i} file={c.file} line={c.line} onClick={() => setState({ activeFile: c.file, activeLine: c.line })} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
