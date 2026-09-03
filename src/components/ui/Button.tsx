import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'ghost' | 'outline';
  children: ReactNode;
  loading?: boolean;
}

const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-body-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-accent text-text-inverse hover:bg-accent-dim shadow-sm hover:shadow-md active:scale-[0.98]',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary active:scale-[0.98]',
  outline: 'border border-border bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary hover:border-accent/50 active:scale-[0.98]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, loading, className = '', disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={isDisabled}
        whileHover={loading ? undefined : { scale: 1.02 }}
        whileTap={loading ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
