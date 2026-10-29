import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface FinoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'on-dark' | 'badge';
  href?: string;
  className?: string;
}

export function FinoraLogo({
  size = 'md',
  variant = 'default',
  href = '/',
  className,
}: FinoraLogoProps) {
  const dimensions = {
    sm: { height: 26, width: 101 },
    md: { height: 32, width: 124 },
    lg: { height: 40, width: 155 },
  }[size];

  const logoImage = (
    <Image
      src="/finora.png"
      alt="Finora"
      width={dimensions.width}
      height={dimensions.height}
      priority
      style={{
        height: `${dimensions.height}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );

  let content: React.ReactNode;

  if (variant === 'on-dark' || variant === 'badge') {
    content = (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: size === 'sm' ? '5px 12px' : size === 'lg' ? '8px 18px' : '6px 14px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          userSelect: 'none',
        }}
      >
        {logoImage}
      </div>
    );
  } else {
    content = (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {logoImage}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        style={{
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
