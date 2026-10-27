'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { FinoraLogo } from '@/components/common/FinoraLogo';
import { Button } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#F6F7FA',
      }}
    >
      {/* Left Column: 50% Brand Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
        }}
        className="auth-hero-banner auth-split-left"
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, var(--primary-accent-border) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <FinoraLogo size="md" variant="badge" />
        </div>

        {/* Center Headline */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: 'auto 0' }}>
          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Account recovery,<br />
            <span style={{ color: 'var(--primary-accent)' }}>secure & simple.</span>
          </h1>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#6B7280' }}>
          &copy; 2026 Finora Finance Inc.
        </div>
      </div>

      {/* Right Column: 50% Reset Form */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
          minHeight: '100vh',
        }}
        className="auth-split-right"
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            border: '1px solid #ECEEF2',
            textAlign: 'center',
          }}
        >
        <div style={{ marginBottom: '28px' }}>
          <FinoraLogo size="lg" />
        </div>

        {!isSubmitted ? (
          <>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              Reset Password
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6B7280', marginBottom: '22px' }}>
              We&apos;ll email you a recovery link.
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{ position: 'absolute', left: '14px', top: '13px', color: '#9CA3AF' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.morgan@finora.finance"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      color: '#111827',
                    }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
              >
                Send Link
              </Button>
            </form>
          </>
        ) : (
          <div className="animate-fade-in">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={30} />
            </div>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#111827',
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              Check your inbox
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6B7280', marginBottom: '20px' }}>
              Recovery link sent to <strong style={{ color: '#111827' }}>{email}</strong>.
            </p>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setIsSubmitted(false)}
            >
              Resend link
            </Button>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#6B7280',
              fontSize: '13.5px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}
