import React from 'react';
import { cn } from '@/lib/classnames';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, style, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white border border-gray-100 rounded-2xl shadow-sm transition-all', className)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px 28px',
        border: '1px solid #ECEEF2',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  style,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '12px',
        ...style,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
            marginBottom: subtitle ? '4px' : 0,
          }}
        >
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: '13.5px', color: '#6B7280' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
