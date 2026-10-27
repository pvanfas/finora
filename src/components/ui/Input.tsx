import React from 'react';
import { cn } from '@/lib/classnames';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, style, ...props }, ref) => {
    return (
      <div style={{ width: '100%', marginBottom: label ? '16px' : 0 }}>
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '14px',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn('w-full border rounded-xl outline-none transition-all', className)}
            style={{
              width: '100%',
              padding: leftIcon ? '11px 14px 11px 42px' : '11px 14px',
              paddingRight: rightIcon ? '42px' : '14px',
              borderRadius: '12px',
              border: error ? '1px solid #EF4444' : '1px solid #D1D5DB',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: '#FFFFFF',
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '14px',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{error}</p>
        ) : hint ? (
          <p style={{ fontSize: '12px', color: '#8A92A6', marginTop: '4px' }}>{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
