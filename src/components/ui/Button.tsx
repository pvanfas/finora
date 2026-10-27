import React from 'react';
import { cn } from '@/lib/classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      pill = true,
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: { padding: '6px 12px', fontSize: '12.5px', gap: '6px' },
      md: { padding: '9px 18px', fontSize: '13.5px', gap: '8px' },
      lg: { padding: '12px 24px', fontSize: '14.5px', gap: '8px' },
    }[size];

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--primary-accent)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: 'var(--primary-accent-glow)',
      },
      secondary: {
        backgroundColor: '#FAFAFC',
        color: '#111827',
        border: '1px solid #E5E7EB',
      },
      outline: {
        backgroundColor: '#FFFFFF',
        color: '#374151',
        border: '1px solid #D1D5DB',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#6B7280',
        border: 'none',
      },
      danger: {
        backgroundColor: '#FEF2F2',
        color: '#EF4444',
        border: '1px solid #FEE2E2',
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('inline-flex items-center justify-center font-semibold cursor-pointer transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed', className)}
        style={{
          display: fullWidth ? 'flex' : 'inline-flex',
          width: fullWidth ? '100%' : undefined,
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          borderRadius: pill ? '9999px' : '10px',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
          transition: 'all 0.15s ease',
          ...sizeStyles,
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
