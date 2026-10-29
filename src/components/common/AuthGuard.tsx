"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * AuthGuard — wraps protected pages.
 * - While auth is resolving: renders a full-screen skeleton spinner.
 * - If not authenticated after resolution: redirects to /login.
 * - If authenticated: renders children.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading skeleton while auth resolves
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary, #F9FAFB)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Spinner ring */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "3px solid var(--primary-accent-light, #FFF2EC)",
              borderTopColor: "var(--primary-accent, #FF5C16)",
              animation: "finora-spin 0.8s linear infinite",
            }}
          />
          <span
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Loading your workspace…
          </span>
        </div>
        <style>{`
          @keyframes finora-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes finora-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.75; transform: scale(0.96); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated — blank render while redirect fires
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
