import React from 'react';
import { cn } from '@/lib/classnames';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  height?: number;
  useHatchedTrack?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ProgressBar({
  value,
  color = 'var(--primary-accent)',
  height = 6,
  useHatchedTrack = true,
  className,
  style,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn('w-full overflow-hidden rounded-full', className)}
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '9999px',
        overflow: 'hidden',
        background: useHatchedTrack
          ? 'repeating-linear-gradient(-45deg, #ECEEF3, #ECEEF3 3px, #F4F5F8 3px, #F4F5F8 6px)'
          : '#ECEEF3',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${clampedValue}%`,
          backgroundColor: color,
          borderRadius: '9999px',
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}
