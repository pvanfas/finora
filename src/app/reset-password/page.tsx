'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { FinoraLogo } from '@/components/common/FinoraLogo';
import { Button } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#E5E7EB' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { score: 50, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score: 75, label: 'Good', color: '#3B82F6' };
    return { score: 100, label: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
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

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', margin: 'auto 0' }}>
          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Reset your<br />
            <span style={{ color: 'var(--primary-accent)' }}>account password.</span>
          </h1>
          <p style={{ marginTop: '16px', fontSize: '16px', color: '#9CA3AF', lineHeight: 1.6 }}>
            Set a strong and secure new password to protect your financial workspace and analytics.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#6B7280' }}>
          &copy; 2026 Finora Finance Inc.
        </div>
      </div>

      {/* Right Column: 50% Form */}
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
            maxWidth: '420px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            border: '1px solid #ECEEF2',
          }}
        >
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                Password Reset Successfully!
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
                Your account password has been updated. You can now sign in with your new credentials.
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/login')}
                rightIcon={<ArrowRight size={18} />}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <FinoraLogo size="lg" />
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#111827',
                    marginTop: '16px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Create New Password
                </h2>
                <p style={{ fontSize: '13.5px', color: '#6B7280', marginTop: '6px' }}>
                  Please choose a strong password with at least 6 characters.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginBottom: '18px',
                    border: '1px solid #FEE2E2',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={18}
                      style={{ position: 'absolute', left: '14px', top: '13px', color: '#9CA3AF' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 42px',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        fontSize: '14px',
                        color: '#111827',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '12px',
                        color: '#9CA3AF',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#6B7280' }}>Strength</span>
                        <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${strength.score}%`,
                            height: '100%',
                            backgroundColor: strength.color,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={18}
                      style={{ position: 'absolute', left: '14px', top: '13px', color: '#9CA3AF' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
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
                  Reset Password
                </Button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13.5px', color: '#6B7280' }}>
                Remember your password?{' '}
                <Link
                  href="/login"
                  style={{ color: 'var(--primary-accent)', fontWeight: 700, textDecoration: 'none' }}
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
