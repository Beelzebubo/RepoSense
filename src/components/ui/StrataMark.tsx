import { forwardRef } from 'react';

interface StrataMarkProps {
  name: keyof typeof STRATA_MARKS;
  className?: string;
  size?: number;
  'aria-label'?: string;
}

const STRATA_MARKS = {
  'layer-1': 'strata-1',
  'layer-2': 'strata-2',
  'layer-3': 'strata-3',
  'layer-4': 'strata-4',
  'function-1': 'strata-5',
  'function-2': 'strata-6',
  'class-1': 'strata-7',
  'class-2': 'strata-8',
  'module-1': 'strata-9',
  'module-2': 'strata-10',
  'artifact-1': 'strata-11',
  'artifact-2': 'strata-12',
  'horizon': 'strata-13',
  'depth-marker': 'strata-14',
  'excavation': 'strata-15',
} as const;

export const StrataMark = forwardRef<SVGSVGElement, StrataMarkProps>(
  ({ name, className = '', size = 24, 'aria-label': ariaLabel, ...props }, ref) => {
    const symbolId = STRATA_MARKS[name];
    if (!symbolId) {
      console.warn(`StrataMark: unknown name "${name}"`);
      return null;
    }

    return (
      <svg
        ref={ref}
        className={`strata-mark ${className}`}
        style={{ width: size, height: size }}
        aria-hidden={!ariaLabel}
        aria-label={ariaLabel}
        {...props}
      >
        <use href={`/assets/strata/strata-sprite.svg#${symbolId}`} />
      </svg>
    );
  }
);

StrataMark.displayName = 'StrataMark';

export type StrataMarkName = keyof typeof STRATA_MARKS;
