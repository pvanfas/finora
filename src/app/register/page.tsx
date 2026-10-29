"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import { FinoraLogo } from "@/components/common/FinoraLogo";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to login after a brief moment
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F6F7FA",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
          border: "1px solid #ECEEF2",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <FinoraLogo size="lg" />
        </div>

        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#FEF2F2",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          <Lock size={26} />
        </div>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#111827",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Registration Closed
        </h2>

        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            lineHeight: 1.5,
            marginBottom: "24px",
          }}
        >
          New account creation is currently disabled. Please sign in with your authorized credentials.
        </p>

        <Link href="/login" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="md" fullWidth leftIcon={<ArrowLeft size={16} />}>
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
