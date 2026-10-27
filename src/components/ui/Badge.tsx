import React from 'react';
import { cn } from '@/lib/classnames';

export type BadgeVariant = 'completed' | 'pending' | 'failed' | 'accent' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', children, className, style, ...props }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    completed: {
      backgroundColor: '#ECFDF5',
      color: '#10B981',
      border: '1px solid #D1FAE5',
    },
    pending: {
      backgroundColor: '#FFFBEB',
      color: '#F59E0B',
      border: '1px solid #FEF3C7',
    },
    failed: {
      backgroundColor: '#FEF2F2',
      color: '#EF4444',
      border: '1px solid #FEE2E2',
    },
    accent: {
      backgroundColor: 'var(--primary-accent-light)',
      color: 'var(--primary-accent)',
      border: '1px solid var(--primary-accent-border)',
    },
    neutral: {
      backgroundColor: '#F3F4F6',
      color: '#4B5563',
      border: '1px solid #E5E7EB',
    },
  };

  return (
    <span
      className={cn('inline-flex items-center text-xs font-semibold rounded-full', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '11.5px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
