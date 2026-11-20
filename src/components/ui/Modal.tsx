'use client';

import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useKeyPress } from '@/hooks/useKeyPress';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/classnames';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
  isStatic?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = '520px',
  maxHeight = 'calc(100dvh - 40px)',
  className,
  isStatic = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [pulse, setPulse] = React.useState(false);

  // Close on Escape key only if NOT static
  useKeyPress('Escape', isStatic ? () => {} : onClose, isOpen && !isStatic);

  // Close on Outside click only if NOT static
  useClickOutside(modalRef, isStatic ? () => {} : onClose, isOpen && !isStatic);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If static modal and user clicked the backdrop outside the dialog
    if (isStatic && e.target === e.currentTarget) {
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="modal-backdrop-container"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={cn('animate-slide-down modal-dialog-responsive', className)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth,
          maxHeight,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #ECEEF2',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: pulse ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header-responsive"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #ECEEF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h3 id="modal-title" style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {title}
            </h3>
            {description && (
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with smooth internal scroll */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
