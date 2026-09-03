import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Step {
  title: string;
  description: string;
  target: string;
}

const STEPS: Step[] = [
  {
    title: 'Welcome to RepoSense',
    description: 'Chat with any GitHub repository. Ask questions about the code and get answers with exact file:line citations.',
    target: 'landing-title',
  },
  {
    title: 'Paste a repo URL',
    description: 'Enter any GitHub repository URL above. We\'ll fetch the code, index it, and make it searchable — all in your browser.',
    target: 'repo-url',
  },
  {
    title: 'Set up your API key',
    description: 'You\'ll need a free API key to chat. Groq offers one at no cost — takes 30 seconds to set up.',
    target: 'settings-button',
  },
  {
    title: 'Ask anything',
    description: 'Once indexed, ask questions about the code. Every answer cites exact files and line numbers you can click to view.',
    target: 'chat-area',
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingOverlay({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onboarded = localStorage.getItem('reposense.onboarded');
    if (onboarded) {
      setVisible(false);
      onComplete();
    }
  }, [onComplete]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  function handleSkip() {
    finish();
  }

  function finish() {
    localStorage.setItem('reposense.onboarded', 'true');
    setVisible(false);
    onComplete();
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleSkip} />

          {/* Tooltip card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-bg-surface p-6 shadow-lg"
          >
            {/* Step indicator */}
            <div className="mb-4 flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <h3 className="text-h3 font-semibold text-text-primary">
              {current.title}
            </h3>
            <p className="mt-2 text-body-sm leading-relaxed text-text-secondary">
              {current.description}
            </p>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-body-sm text-text-tertiary transition-colors hover:text-text-secondary"
              >
                Skip
              </button>
              <div className="flex items-center gap-2">
                <span className="text-caption text-text-tertiary">
                  {step + 1} of {STEPS.length}
                </span>
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-text-inverse shadow-sm transition-all hover:bg-accent-dim"
                >
                  {step === STEPS.length - 1 ? 'Get started' : 'Next'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
