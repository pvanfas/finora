"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui";
import { AlertTriangle, CheckCircle, Info, Check } from "lucide-react";

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      title: "Partner Capital Contribution: ₹50,000 received",
      time: "2 hours ago",
      unread: true,
      type: "success",
      text: "Capital contribution of ₹50,000 from Shuhaib (3004) has been credited to Bank Account (1010).",
    },
    {
      id: "2",
      title: "OPEX Allocation Notice: Salaries & Wages",
      time: "Yesterday at 9:15 AM",
      unread: true,
      type: "info",
      text: "Salaries & Wages - October (6000) of ₹45,000 has been debited successfully.",
    },
    {
      id: "3",
      title: "Service Revenue Milestone Cleared",
      time: "Oct 22, 2026",
      unread: false,
      type: "success",
      text: "Client wire of ₹65,000 for Q3 Milestone Service Revenue (4000) confirmed.",
    },
  ]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.notifications)) {
          setAlerts(data.notifications);
        }
      })
      .catch(() => {});
  }, []);

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
    fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.warn(
            "[Notifications] markAllRead failed:",
            errData?.error || `HTTP ${res.status}`,
          );
        }
      })
      .catch((err) =>
        console.warn("[Notifications] markAllRead network error:", err),
      );
  };

  return (
    <DashboardShell>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "800px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              Notifications
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
              Real-time activity logs, budget threshold triggers, and payment
              confirmations.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            leftIcon={<Check size={14} />}
          >
            Mark all as read
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "20px 24px",
                border: item.unread
                  ? "1px solid var(--primary-accent)"
                  : "1px solid #ECEEF2",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor:
                    item.type === "warning"
                      ? "var(--primary-accent-light)"
                      : item.type === "success"
                        ? "#ECFDF5"
                        : "#F3F4F6",
                  color:
                    item.type === "warning"
                      ? "var(--primary-accent)"
                      : item.type === "success"
                        ? "#10B981"
                        : "#3B82F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                {item.type === "warning" ? (
                  <AlertTriangle size={18} />
                ) : item.type === "success" ? (
                  <CheckCircle size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {item.title}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#8A92A6" }}>
                    {item.time}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "#4B5563",
                    marginTop: "4px",
                    lineHeight: 1.5,
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
