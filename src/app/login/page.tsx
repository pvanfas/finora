"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { FinoraLogo } from "@/components/common/FinoraLogo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect already-authenticated users away from login
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#F6F7FA",
      }}
    >
      {/* Left Column: 50% Brand Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
        }}
        className="auth-hero-banner auth-split-left"
      >
        {/* Glow ambient effects */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: "450px",
            height: "450px",
            background:
              "radial-gradient(circle, var(--primary-accent-border) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Center Headline */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "480px",
            margin: "auto 0",
          }}
        >
          <h1
            style={{
              fontSize: "44px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Smart money,
            <br />
            <span style={{ color: "var(--primary-accent)" }}>
              real-time clarity.
            </span>
          </h1>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "12px",
            color: "#6B7280",
          }}
        >
          &copy; 2026 Finora Finance Inc.
        </div>
      </div>

      {/* Right Column: 50% Sign In Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 32px",
          minHeight: "100vh",
        }}
        className="auth-split-right"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            padding: "36px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
            border: "1px solid #ECEEF2",
          }}
        >
          {/* Logo & Clean Heading */}
          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <FinoraLogo size="lg" />
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#111827",
                marginTop: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Sign In
            </h2>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "18px",
                border: "1px solid #FEE2E2",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "13px",
                    color: "#9CA3AF",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "13px",
                    color: "#9CA3AF",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 42px",
                    borderRadius: "12px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "12px",
                    color: "#9CA3AF",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                fontSize: "13px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  color: "#4B5563",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: "var(--primary-accent)",
                    width: "15px",
                    height: "15px",
                  }}
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                style={{
                  color: "var(--primary-accent)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
